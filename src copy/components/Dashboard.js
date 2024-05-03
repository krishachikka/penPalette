import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContexts";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import Profile from "./dashboard/profile";
import FileUpload from "./dashboard/FileUpload";
import UploadedFilesSection from "./dashboard/UploadedFilesSection";
import { Modal, Button } from 'react-bootstrap';
import "../styles/dashboard.css";
import  ProfileDrawer from './dashboard/profiledrawer';

export default function Dashboard() {
  const [fileData, setFileData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFileModal, setShowFileModal] = useState(false);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [fileComments, setFileComments] = useState([]);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const history = useNavigate();

  const toggleProfileDrawer = () => {
    setProfileDrawerOpen(!profileDrawerOpen); // Toggle the state
  };

  useEffect(() => {
    const fetchFiles = () => {
      db.ref("files").on("value", (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const fileArray = Object.entries(data).map(([key, value]) => ({
            id: key,
            uploaderEmail: value.uploaderEmail,
            comments: value.comments || [],
            ...value,
          }));
          setFileData(fileArray);
        } else {
          setFileData([]);
        }
      });
    };

    fetchFiles();

    return () => db.ref("files").off("value");
  }, []);

  useEffect(() => {
    if (selectedFile) {
      db.ref(`files/${selectedFile.id}/comments`).on("value", (snapshot) => {
        const commentsData = snapshot.val();
        if (commentsData) {
          const commentsArray = Object.entries(commentsData).map(([key, value]) => ({
            id: key,
            ...value,
          }));
          setFileComments(commentsArray);
        } else {
          setFileComments([]);
        }
      });
    }
  }, [selectedFile]);

  const handleDelete = async (fileId) => {
    try {
      setLoading(true);
      await db.ref(`files/${fileId}`).remove();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      history.push("/login");
    } catch {
      console.error("Failed to log out");
    }
  };

  const openFile = async (fileId) => {
    const file = fileData.find(file => file.id === fileId);
    setSelectedFile(file);
    setShowFileModal(true);
    // Increment views count when the file is opened
    if (file) {
      handleFileClick(file.id, file.views || 0);
    }
  };

  const handleFileClick = async (fileId, views) => {
    try {
      await db.ref(`files/${fileId}/views`).set(views + 1);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "pm" : "am";
    hours = hours % 12 || 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    return `${day}/${month}/${year} - ${hours}:${minutes} ${ampm}`;
  };

  const filteredFiles = fileData.filter(
    (file) =>
      file.createdBy !== currentUser.uid &&
      file.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownload = (fileURL) => {
    const anchor = document.createElement("a");
    anchor.href = fileURL;
    anchor.download = selectedFile.title;
    anchor.click();
  };

  const handleOpen = (fileURL) => {
    window.open(fileURL, '_blank');
  };

  const handleCommentChange = (e) => {
    const commentText = e.target.value;
    setComment(commentText);
    if (commentText.trim().length === 0) {
      setCommentError("Comment cannot be empty");
    } else {
      setCommentError("");
    }
  };

  const handleCommentSubmit = async (fileId) => {
    if (comment.trim().length === 0) {
      setCommentError("Comment cannot be empty");
      return;
    }

    try {
      setLoading(true);
      await db.ref(`files/${fileId}/comments`).push({
        text: comment,
        userEmail: currentUser.email,
        createdAt: new Date().toISOString(),
      });
      setComment("");
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComments = () => {
    setShowComments(!showComments);
  };

  const handleDeleteComment = async (commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      try {
        setLoading(true);
        await db.ref(`files/${selectedFile.id}/comments/${commentId}`).remove();
        // Update fileComments state after deleting the comment
        setFileComments(prevComments => prevComments.filter(comment => comment.id !== commentId));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="container-fluid">
        <div className="profile-icon" onClick={toggleProfileDrawer}>
        <ion-icon name="person" size="large"></ion-icon>        
        </div>

        {/* Profile drawer */}
        <ProfileDrawer isOpen={profileDrawerOpen} onClose={toggleProfileDrawer} />

      <div className="dashboard-container">
        <div className="left-section">
          <Profile />
          <FileUpload currentUser={currentUser} />
        </div>
        <div className="right-section">
          <h2 className="text-center mb-4" style={{ color: "white" }}>Uploaded Files by Others</h2>
          <div className="row">
          <input
            type="text"
            placeholder="Search by title..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="form-control mb-3"
            id="searchbar"
          />
          <ion-icon name="search" className="icon"></ion-icon>
          </div>
          <div className="row">
            {filteredFiles.map((file) => (
              <div key={file.id} className="mb-4" style={{ width: "240px" }}>
                <div className="card">
                  <img
                    src={file.coverPageURL}
                    alt="Cover Page"
                    className="card-img-top"
                    style={{ height: "250px", cursor: "pointer" }}
                    onClick={() => openFile(file.id)}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{file.title}</h5>
                    <p className="card-text">Uploaded By: {file.uploaderEmail}</p>
                    <p className="card-text">Uploaded: {formatDate(file.createdAt)}</p>
                    <p className="card-text">Views: {file.views}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="center-section">
          <UploadedFilesSection fileData={fileData} currentUser={currentUser} />
        </div>
      </div>

      <Modal show={showFileModal} onHide={() => setShowFileModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>File Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedFile && (
            <div>
              <h4>Title: {selectedFile.title}</h4>
              <p>Uploaded By: {selectedFile.uploaderEmail}</p>
              <img src={selectedFile.coverPageURL} alt="Cover Page" style={{ width: "100%" }} />
            </div>
          )}
          <div>
            <h4>Comments:</h4>
            <Button onClick={handleToggleComments}>
              {showComments ? "Hide Comments" : "Show Comments"}
            </Button>
            {showComments && fileComments.map((comment, index) => (
              <div key={index}>
                <p>{comment.text}</p>
                <small>By: {comment.userEmail}</small>
                {comment.userEmail === currentUser.email && (
                  <Button onClick={() => handleDeleteComment(comment.id)}>Delete</Button>
                )}
              </div>
            ))}
          </div>
          <textarea
            value={comment}
            onChange={handleCommentChange}
            placeholder="Add a comment..."
            className="form-control mb-3"
          />
          {commentError && <div style={{ color: "red" }}>{commentError}</div>}
          <Button
            variant="primary"
            onClick={() => handleCommentSubmit(selectedFile.id)}
            disabled={comment.trim().length === 0 || loading}
          >
            Add Comment
          </Button>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={() => handleOpen(selectedFile.fileURL)}>
            Open
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
