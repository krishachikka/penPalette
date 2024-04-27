import React, { useState, useEffect } from "react";
import { Card, Button, Alert, Spinner } from "react-bootstrap";
import { useAuth } from "../contexts/AuthContexts";
import { Link, useNavigate } from "react-router-dom";
import PrivateRoute from "./PrivateRoute";
import { storage, db } from "../firebase"; // Import Firebase storage and Realtime Database

export default function Dashboard() {
  const [error, setError] = useState("");
  const [file, setFile] = useState(null);
  const [coverPage, setCoverPage] = useState(null);
  const [title, setTitle] = useState("");
  const [fileData, setFileData] = useState([]);
  const [loading, setLoading] = useState(false); // State for loading animation
  const [successMessage, setSuccessMessage] = useState(""); // State for success message
  const { currentUser, logout } = useAuth();
  const history = useNavigate();

  useEffect(() => {
    const fetchFiles = () => {
      db.ref("files").once("value", (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const fileArray = Object.entries(data).map(([key, value]) => ({
            id: key,
            ...value,
          }));
          setFileData(fileArray);
        }
      });
    };

    fetchFiles();
  }, []);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleCoverPageChange = (e) => {
    setCoverPage(e.target.files[0]);
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handlePublish = async () => {
    setError("");
    setLoading(true); // Set loading to true when uploading starts

    try {
      const fileRef = storage.ref().child(file.name);
      await fileRef.put(file);
      
      const coverPageRef = storage.ref().child(coverPage.name);
      await coverPageRef.put(coverPage);

      const fileURL = await fileRef.getDownloadURL();
      const coverPageURL = await coverPageRef.getDownloadURL();

      const newFileKey = db.ref().child("files").push().key;
      await db.ref(`files/${newFileKey}`).set({
        title,
        fileURL,
        coverPageURL,
        createdBy: currentUser.uid,
        createdAt: new Date().toISOString(),
        views: 0,
      });

      setFileData((prevData) => [
        ...prevData,
        {
          id: newFileKey,
          title,
          fileURL,
          coverPageURL,
          createdBy: currentUser.uid,
          createdAt: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
          views: 0,
        },
      ]);

      // Clear input fields after successful upload
      setFile(null);
      setCoverPage(null);
      setTitle("");
      setSuccessMessage("File uploaded successfully!");

    } catch (error) {
      setError("Failed to publish");
      console.error(error);
    } finally {
      setLoading(false); // Set loading to false after uploading finishes
    }
  };

  const handleLogout = async () => {
    setError("");

    try {
      await logout();
      history.push("/login");
    } catch {
      setError("Failed to log out");
    }
  };

  const openFile = (fileId, fileURL) => {
    // Increment views count when the file is opened
    handleFileClick(fileId);
    // Open the file in a new tab
    window.open(fileURL);
  };

  const handleFileClick = async (fileId) => {
    try {
      // Get the current views count for the file
      const currentViews = fileData.find((file) => file.id === fileId).views;
  
      // Update views in the database
      await db.ref(`files/${fileId}`).update({
        views: currentViews + 1 // Increment views by 1
      });
  
      // Update views in the local state
      setFileData((prevData) =>
        prevData.map((file) =>
          file.id === fileId ? { ...file, views: currentViews + 1 } : file
        )
      );
    } catch (error) {
      console.error("Error updating views:", error);
    }
  };

  return (
    <div className="container-fluid">
      <div className="dashboard-container">
        <div className="left-section">
          <h2 className="text-center">Profile</h2>
          <Card>
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              {successMessage && <Alert variant="success">{successMessage}</Alert>}
              <p><strong>Email:</strong> {currentUser.email}</p>
              <Link to="/update-profile" className="btn btn-primary btn-block mt-3">
                Update Profile
              </Link>
              <div className="w-100 text-center mt-2">
                <Button variant="link" onClick={handleLogout}>
                  Log Out
                </Button>
              </div>
            </Card.Body>
          </Card>
          <h2 className="text-center mb-4">File Upload</h2>
          <Card className="mb-3">
            <Card.Body>
              <input type="file" className="form-control mb-2" onChange={handleFileChange} />
              <input type="file" className="form-control mb-2" onChange={handleCoverPageChange} />
              <input type="text" className="form-control mb-2" placeholder="Title" value={title} onChange={handleTitleChange} />
              <Button onClick={handlePublish} className="btn btn-success btn-block" disabled={loading}>
                {loading ? <Spinner animation="border" size="sm" /> : "Publish"}
              </Button>
            </Card.Body>
          </Card>
        </div>
        <div className="right-section">
          <h2 className="text-center mb-4">Uploaded Files by Others</h2>
          <div className="row flex-nowrap overflow-auto">
            {fileData.map((file, index) => (
              file.createdBy !== currentUser.uid && (
                <div key={file.id} className="col-md-4 mb-4">
                  <div className="card">
                    <img
                      src={file.coverPageURL}
                      alt="Cover Page"
                      className="card-img-top"
                      style={{ height: "250px", cursor: "pointer" }}
                      onClick={() => openFile(file.id, file.fileURL)}
                    />
                    <div className="card-body">
                      <h5 className="card-title">{file.title}</h5>
                      <p className="card-text">Uploaded: {file.createdAt}</p>
                      <p className="card-text">Views: {file.views}</p>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
        <div className="center-section">
          <h2 className="text-center mb-4">Your Uploaded Files</h2>
          <div className="row flex-nowrap overflow-auto">
            {fileData.map((file, index) => (
              file.createdBy === currentUser.uid && (
                <div key={file.id} className="col-md-4 mb-4">
                  <div className="card">
                    <img
                      src={file.coverPageURL}
                      alt="Cover Page"
                      className="card-img-top"
                      style={{ height: "250px", cursor: "pointer" }}
                      onClick={() => openFile(file.id, file.fileURL)}
                    />
                    <div className="card-body">
                      <h5 className="card-title">{file.title}</h5>
                      <p className="card-text">Uploaded: {file.createdAt}</p>
                      <p className="card-text">Views: {file.views}</p>
                    </div>
                  </div>
                </div>
              )
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
