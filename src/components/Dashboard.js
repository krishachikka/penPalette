import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from "../contexts/AuthContexts";
import { useNavigate } from "react-router-dom";
import { db, storage } from "../firebase";
// import Profile from "./dashboard/profile";
// import FileUpload from "./dashboard/FileUpload";
import UploadedFilesSection from "./dashboard/UploadedFilesSection";
import "../styles/dashboard/dashboard.css";
import ProfileDrawer from "./dashboard/profileDrawer";
import "../styles/modal.css";
import "../styles/card.css";
import booktop from '../images/booktop.png';
import bookside from '../images/bookside.png';
import logo from '../images/logo.png';

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
      file.createdBy !== (currentUser && currentUser.uid) &&
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
        userEmail: (currentUser && currentUser.email) || "Unknown",
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

  // Function to handle file upload
  const handleFileUpload = async (file) => {
    const storageRef = storage.ref();
    const fileRef = storageRef.child(file.name);
    try {
      setLoading(true);
      await fileRef.put(file);
      const fileURL = await fileRef.getDownloadURL();
      await db.ref("files").push({
        title: file.name,
        coverPageURL: fileURL,
        description: "", // Set default description here if needed
        uploaderEmail: (currentUser && currentUser.email) || "Unknown",
        createdBy: (currentUser && currentUser.uid) || "Unknown",
        createdAt: new Date().toISOString(),
        views: 0,
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  // Add state for saving file
  const [isSaved, setIsSaved] = useState(false);

  // Function to toggle save state
  const toggleSave = () => {
    setIsSaved(!isSaved);
  };

  return (
    <div>
      <header>
        <div className="profile-icon" onClick={toggleProfileDrawer}>
          <ion-icon name="person-circle" size="large" id="profile-icon"></ion-icon>
          <img src={logo} alt="Pen Palette" className="logod"></img>
        </div>
        <div className="header-buttons">
          {/* Button to go to the uploaded files section */}
          <div className="book-button" onClick={() => document.querySelector(".center-section").scrollIntoView({ behavior: 'smooth' })}>
            <button>View Your Books</button>
          </div>
          {/* Button to go to the section of exploring more stories */}
          <div className="book-button" onClick={() => document.querySelector(".right-section").scrollIntoView({ behavior: 'smooth' })}>
            <button>Explore More Stories</button>
          </div>
        </div>


      </header>
      {/* Profile drawer */}
      < ProfileDrawer isOpen={profileDrawerOpen} onClose={toggleProfileDrawer} currentUser={currentUser} setLoading={setLoading} />
      <div className="container-fluid m-0 p-0">
        <div className="dashboard-container">

          <div className="right-section">
          <div className="searchname">
              <h2 className="text-center mb-4" style={{ color: "white" }}>Explore more Stories</h2>
              <div className="row">
                <input
                  type="text"
                  placeholder= "Search by title..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="form-control mb-3 "
                  id="searchbar"
                />
              </div>
          </div>
            <div className="row">
              {filteredFiles.map((file) => (
                <div key={file.id} className="mb-4" style={{ width: "25%" }}>
                  <div className="layout" onClick={() => openFile(file.id)}>
                    <div className="actions">
                      <ion-icon name="bookmark"></ion-icon>
                    </div>
                    <div className="book-cover">
                      <img className="book-top" src={booktop} alt="book-top" />
                      <img
                        src={file.coverPageURL}
                        alt="Cover Page"
                        className="card-img-top"
                        style={{ height: "250px", cursor: "pointer", borderRadius: "10px" }}

                      />
                      <img className="book-side" src={bookside} alt="book-side" />
                    </div>
                    <div className="preface">
                      <div className="title">{file.title}</div>
                      <div className="author">{file.uploaderEmail}</div>
                      <p>Views : {file.views}</p>
                      <div className="body">
                        <p>{file.description}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="center-section">
          <UploadedFilesSection fileData={fileData} currentUser={currentUser} />
        </div>

        <AnimatePresence>
          {showFileModal && (
            <motion.div
              className="modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.92 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFileModal(false)}
            >
              <motion.div
                className="modal-content"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h5 className="modal-title">File Details</h5>
                  <button className="close" onClick={() => setShowFileModal(false)}>
                    <ion-icon name="close-circle" size="large"></ion-icon>
                  </button>

                </div>
                <div className="modal-body">
                  {selectedFile && (
                    <div className="content">
                      <img src={selectedFile.coverPageURL} alt="Cover Page" style={{ width: "30%", margin: "10px" }} />

                      <div>
                        <h3>{selectedFile.title}</h3>
                        <p><i>Uploaded By: {selectedFile.uploaderEmail}</i></p>
                        <p>Description: {selectedFile.description}</p>
                      </div>
                    </div>
                  )}
                  <div>
                    <p className="comflex"><h4 className="p-2">Comments <ion-icon name="chatbubble-outline"></ion-icon>  :</h4>
                      <button onClick={handleToggleComments} className="modalbtn">
                        {showComments ? "Hide Comments" : "Show Comments"} <ion-icon name="chatbubbles-outline"></ion-icon>
                      </button></p>
                    {showComments && fileComments.map((comment, index) => (
                      <div className="comment m-2" key={index}>
                        <i><small>By: {comment.userEmail}</small></i>
                        <p>{comment.text}</p>
                        {comment.userEmail === (currentUser && currentUser.email) && (
                          <button className="modalbtn" onClick={() => handleDeleteComment(comment.id)}>Delete</button>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="comm mb-3">
                    <textarea
                      value={comment}
                      onChange={handleCommentChange}
                      placeholder="Add a comment..."
                      className="form-control mb-1"
                      id="commentarea"
                    />
                    {commentError && <div style={{ color: "red" }}>{commentError}</div>}
                    <button
                      className="commentbtn"
                      onClick={() => handleCommentSubmit(selectedFile.id)}
                      disabled={comment.trim().length === 0 || loading}
                    >
                      <ion-icon name="send" size="large"></ion-icon>
                    </button>
                  </div>
                </div>
                <div className="modal-footer">

                  <button className="modalbtn" onClick={() => handleOpen(selectedFile.coverPageURL)}>
                    Read
                  </button>
                  <button className="modalbtn" onClick={toggleSave}>
                    {isSaved ? "Unsave" : "Save"}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>



        {/* <Modal show={showFileModal} onHide={() => setShowFileModal(false)}>
          <Modal.Header closeButton>
            <Modal.Title>File Details</Modal.Title>
            <Button variant="secondary" onClick={toggleSave}>
              {isSaved ? "Unsave" : "Save"}
            </Button>
          </Modal.Header>
          <Modal.Body>
            {selectedFile && (
              <div>
                <h4>Title: {selectedFile.title}</h4>
                <p>Uploaded By: {selectedFile.uploaderEmail}</p>
                <img src={selectedFile.coverPageURL} alt="Cover Page" style={{ width: "70%" }} />
                <p>Description: {selectedFile.description}</p>
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
                  {comment.userEmail === (currentUser && currentUser.email) && (
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
            <Button variant="primary" onClick={() => handleOpen(selectedFile.coverPageURL)}>
              Open
            </Button>
          </Modal.Footer>
        </Modal> */}
      </div>
    </div>
  );
}