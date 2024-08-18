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
import { ToastContainer, toast } from "react-toastify";
import "../styles/modal.css";
import "../styles/card.css";
import booktop from '../images/booktop.png';
import bookside from '../images/bookside.png';
import logo from '../images/logo.png';
import logomeow from '../images/logomeow.png';
import LoadingCatAnimation from "./LoadingCatAnimation";
import Footer from "./Footer";

export default function Dashboard() {
  const [fileData, setFileData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [savedFiles, setSavedFiles] = useState([]);
  const [userInfo, setUserInfo] = useState({});


  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showFileModal, setShowFileModal] = useState(false);
  const [comment, setComment] = useState("");
  const [commentError, setCommentError] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [fileComments, setFileComments] = useState([]);
  const [toastVisible, setToastVisible] = useState(false);
  const [profileDrawerOpen, setProfileDrawerOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();


  useEffect(() => {
    if (currentUser) {
      const fetchUserInfo = async () => {
        try {
          const userSnapshot = await db.ref(`users/${currentUser.uid}`).once("value");
          const userData = userSnapshot.val();
          setUserInfo(userData || {});
        } catch (error) {
          console.error("Error fetching user info:", error);
        }
      };

      fetchUserInfo();
    }
  }, [currentUser]);


  // Debounce the search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // Adjust the debounce delay as needed

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);





  // Clear the search input
  const handleClearSearch = () => {
    setSearchQuery('');
    setDebouncedSearchQuery('');
  };

  const toggleProfileDrawer = () => {
    setProfileDrawerOpen(!profileDrawerOpen); // Toggle the state
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    console.log('Menu toggled:', !menuOpen);
  };


  const openFileOverlay = async (fileId) => {
    const file = fileData.find(file => file.id === fileId);
    setSelectedFile(file);
    setShowFileModal(true);
    // Increment views count when the file is opened
    // if (file) {
    //   handleFileClick(file.id, file.views || 0);
    // }
  };




  useEffect(() => {
    const fetchFiles = () => {
      setLoading(true); // Set loading to true before fetching data
      db.ref("files").on("value", async (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const fileArray = await Promise.all(Object.entries(data).map(async ([key, value]) => {
            const userSnapshot = await db.ref(`users/${value.createdBy}`).once("value");
            const userData = userSnapshot.val() || {};
            return {
              id: key,
              uploaderUsername: userData.username || "Unknown", // Use username instead of email
              comments: value.comments || [],
              ...value,
            };
          }));
          setFileData(fileArray);
        } else {
          setFileData([]);
        }
        setLoading(false); // Set loading to false after fetching data
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


  const showToast = (message) => {
    try {
      toast.success(message, { autoClose: 1500, onClose: () => setToastVisible(false) });
      setToastVisible(true);
    } catch (error) {
      console.error("Error displaying toast:", error);
    }
  };

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
      navigate.push("/login");
    } catch {
      console.error("Failed to log out");
    }
  };


  const fetchComments = async (fileId) => {
    try {
      const snapshot = await db.ref(`files/${fileId}/comments`).once("value");
      const comments = [];
      snapshot.forEach((childSnapshot) => {
        comments.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      setFileComments(comments);
    } catch (error) {
      console.error(error);
      showToast("Failed to fetch comments");
    }
  };

  const openFile = async (fileId, fileURL, createdBy) => {
    try {
      if (createdBy !== currentUser.uid) {
        await db.ref(`files/${fileId}/views`).transaction((currentViews) => {
          return (currentViews || 0) + 1;
        });
      }
      const file = fileData.find((file) => file.id === fileId);
      setSelectedFile(file);
      setShowFileModal(true);
      fetchComments(fileId);

      // Navigate to the dynamic route with the book ID
      navigate(`/book/${fileId}`);
    } catch (error) {
      console.error(error);
      showToast("Failed to open file");
    }
  };

  const handleFileClick = async (fileId, views) => {
    try {
      await db.ref(`files/${fileId}/views`).set(views + 1);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setSearchQuery(suggestion);
    setSuggestions([]);
  };


  // const handleSearchChange = (e) => {
  //   setSearchQuery(e.target.value);
  // };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 0) {
      const filteredSuggestions = fileData
        .filter(file => file.title.toLowerCase().includes(query.toLowerCase()))
        .map(file => file.title);
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
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


  const handleSave = async (fileId) => {
    try {
      const userRef = db.ref(`users/${currentUser.uid}/savedFiles`);
      const snapshot = await userRef.child(fileId).once("value");

      if (snapshot.exists()) {
        // File is already saved, so unsave it
        await userRef.child(fileId).remove();
        setSavedFiles(prev => prev.filter(id => id !== fileId));
        showToast("Removed from saved books");
      } else {
        // File is not saved, so save it
        await userRef.child(fileId).set(true);
        setSavedFiles(prev => [...prev, fileId]);
        showToast("Saved to your books");
      }
    } catch (error) {
      console.error("Error saving file:", error);
    }
  };


  // useEffect(() => {
  //   if (currentUser) {
  //     const fetchSavedFiles = async () => {
  //       try {
  //         // Fetch saved files for the current user
  //         const savedFilesSnapshot = await db.ref(`users/${currentUser.uid}/savedFiles`).once("value");
  //         const savedFilesData = savedFilesSnapshot.val() || {};
  //         const savedFileIds = Object.keys(savedFilesData);

  //         // Fetch all files
  //         const filesSnapshot = await db.ref("files").once("value");
  //         const allFilesData = filesSnapshot.val() || {};

  //         // Filter files that are saved by the user
  //         const savedFiles = Object.entries(allFilesData).filter(([key]) => savedFileIds.includes(key));

  //         // Update state with saved files
  //         setSavedFiles(savedFiles.map(([key, value]) => ({
  //           id: key,
  //           ...value,
  //         })));
  //       } catch (error) {
  //         console.error("Error fetching saved files:", error);
  //       }
  //     };

  //     fetchSavedFiles();
  //   }
  // }, [currentUser]);

  useEffect(() => {
    if (currentUser) {
      const fetchSavedFiles = async () => {
        try {
          const savedFilesSnapshot = await db.ref(`users/${currentUser.uid}/savedFiles`).once("value");
          const savedFilesData = savedFilesSnapshot.val() || {};
          const savedFileIds = Object.keys(savedFilesData);
          setSavedFiles(savedFileIds); // Store the IDs of saved files
        } catch (error) {
          console.error("Error fetching saved files:", error);
        }
      };

      fetchSavedFiles();
    }
  }, [currentUser]);


  const handleSavedBooksClick = () => {
    navigate('/saved-books'); // Navigate to the "Saved Books" route
  };


  return (
    <div>
      {loading ? (
        <LoadingCatAnimation /> // Show loading animation while loading
      ) : (
        <div>
          <header className="blur-lg">
            <div className="profile-icon" onClick={toggleProfileDrawer}>
              {/* <ion-icon name="person-circle" size="large" id="profile-icon"></ion-icon> */}
              <img src={logomeow} alt="Meow" id="profile-icon"></img>
              <img src={logo} alt="Pen Palette" className="logod"></img>
            </div>
            <div className="header-buttons my-auto">
              {/* Button to go to the uploaded files section */}
              <div className="book-button" onClick={handleSavedBooksClick} >
                <button>Saved Books</button>
              </div>
              <div className="book-button" onClick={() => document.querySelector(".center-section").scrollIntoView({ behavior: 'smooth' })}>
                <button>My Books</button>
              </div>
              {/* Button to go to the section of exploring more stories */}
              <div className="book-button" onClick={() => document.querySelector(".container-fluid").scrollIntoView({ behavior: 'smooth' })}>
                <button>Explore Stories</button>
              </div>
            </div>
            <button className="menu-button" onClick={toggleMenu}>
              <ion-icon name="list-outline" size="large"></ion-icon>
            </button>

          </header>
          <div className={`header-buttons-mobile ${menuOpen ? 'open' : ''}`}>
            <div className="book-button" onClick={handleSavedBooksClick} >
              <button>Saved Books</button>
            </div>
            <div className="book-button" onClick={() => document.querySelector(".center-section").scrollIntoView({ behavior: 'smooth' })}>
              <button>View My Books</button>
            </div>
            <div className="book-button" onClick={() => document.querySelector(".container-fluid").scrollIntoView({ behavior: 'smooth' })}>
              <button>Explore Stories</button>
            </div>
          </div>

          {/* Profile drawer */}
          < ProfileDrawer isOpen={profileDrawerOpen} onClose={toggleProfileDrawer} currentUser={currentUser} setLoading={setLoading} />
          <div className="container-fluid m-0 p-0">
            <div className="dashboard-container">

              <div className="right-section">
                <div className="searchname">
                  <h2 className="text-center mb-4" style={{ color: "white" }}>Explore more Stories</h2>
                  <div className="row">
                    {/* <input
                  type="text"
                  placeholder="Search by title..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="form-control mb-3 "
                  id="searchbar"
                /> */}
                    <div className="search-container">
                      <input
                        type="text"
                        placeholder="Search by title..."
                        value={searchQuery}
                        onChange={handleSearchChange}
                        className="form-control"
                        id="searchbar"
                      />
                      {searchQuery && (
                        <button onClick={handleClearSearch} className="modalbtn">
                          Clear
                        </button>
                      )}
                      {suggestions.length > 0 && (
                        <ul className="suggestions-list">
                          {suggestions.map((suggestion, index) => (
                            <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
                              {suggestion}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>


                  </div>
                </div>
                <div className="row upperCard">
                  {filteredFiles.map((file) => (
                    <div key={file.id} className="mb-4 cardWidth">
                      <div className="layout" onClick={() => openFileOverlay(file.id)}>
                        <div className="actions">
                          <ion-icon
                            name="bookmark"
                            style={{
                              color: savedFiles.includes(file.id) ? "#580391d1" : "gray",
                              cursor: "pointer"
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSave(file.id);
                            }}
                          ></ion-icon>
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
                          <div className="author">{file.uploaderUsername}</div>
                          <p>Views: {file.views}</p>
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
                      <h5 className="modal-title">Book Details</h5>
                      <button className="close" onClick={() => setShowFileModal(false)}>
                        <ion-icon name="close-circle" size="large"></ion-icon>
                      </button>
                    </div>
                    <div className="modal-body">
                      {selectedFile && (
                        <div className="content">
                          <img src={selectedFile.coverPageURL} alt="Cover Page" />

                          <div>
                            <h3>{selectedFile.title}</h3>
                            <p><i>Uploaded By: {selectedFile.uploaderUsername}</i></p>
                            <p>Description: {selectedFile.description}</p>
                          </div>
                        </div>
                      )}

                      <div>
                        <p className="comflex">
                          <h4 className="p-2">Comments <ion-icon name="chatbubble-outline"></ion-icon> :</h4>
                          <button onClick={handleToggleComments} className="modalbtn">
                            {showComments ? "Hide Comments" : "Show Comments"} <ion-icon name="chatbubbles-outline"></ion-icon>
                          </button>
                        </p>
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

                    {/* New Section for Tags */}
                    <div className="modal-tags">
                      <h5>Tags</h5>
                      <div className="tags-container">
                        {selectedFile.tags && selectedFile.tags.length > 0 ? (
                          selectedFile.tags.map((tag, index) => (
                            <span key={index} className="tag">
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span style={{ color: "grey" }}>No tags available</span>
                        )}
                      </div>
                    </div>

                    <div className="modal-footer">
                      <button className="modalbtn" onClick={() => openFile(selectedFile.id, selectedFile.fileURL, selectedFile.createdBy)}>
                        Read
                      </button>
                      <button
                        className="modalbtn"
                        onClick={() => handleSave(selectedFile.id)}
                      >
                        {savedFiles.includes(selectedFile.id) ? "Unsave" : "Save"}
                      </button>
                    </div>

                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}