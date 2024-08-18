
import React, { useState, useEffect } from "react";
import { Button, Spinner, Modal, Form } from "react-bootstrap";
import { db } from "../../firebase";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../../styles/dashboard/dashboard.css"; // Import the dashboard CSS file
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import "../../styles/card.css";
import '../../styles/modal.css'


export default function UploadedFilesSection({ currentUser }) {

    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [fileData, setFileData] = useState([]);
    const [toastVisible, setToastVisible] = useState(false);
    const [showConfirmDelete, setShowConfirmDelete] = useState(false);
    const [fileToDelete, setFileToDelete] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editCoverPageURL, setEditCoverPageURL] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [fileToEdit, setFileToEdit] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [editFile, setEditFile] = useState(null);
    const [showFileModal, setShowFileModal] = useState(false);
    const [fileComments, setFileComments] = useState([]);
    const [showComments, setShowComments] = useState(false);
    const [comment, setComment] = useState("");
    const [commentError, setCommentError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);


    const handleSuggestionClick = (suggestion) => {
        setSearchQuery(suggestion);
        setSuggestions([]);
    };

    // Clear the search input
    const handleClearSearch = () => {
        setSearchQuery('');
        setDebouncedSearchQuery('');
    };

    useEffect(() => {
        const unsubscribe = db.ref("files").on("value", (snapshot) => {
            if (snapshot) {
                const files = [];
                snapshot.forEach((childSnapshot) => {
                    const data = childSnapshot.val();
                    if (data.createdBy === currentUser.uid) {
                        files.push({
                            id: childSnapshot.key,
                            ...data,
                            views: data.views || 0 // Ensure views property is included
                        });
                    }
                });
                setFileData(files);
            } else {
                setFileData([]);
            }
        });

        return () => {
            unsubscribe();
        };
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




    useEffect(() => {
        const unsubscribe = db.ref("files").on("value", (snapshot) => {
            if (snapshot) {
                const files = [];
                snapshot.forEach((childSnapshot) => {
                    const data = childSnapshot.val();
                    if (data.createdBy === currentUser.uid) {
                        files.push({
                            id: childSnapshot.key,
                            ...data
                        });
                    }
                });
                setFileData(files);
            } else {
                setFileData([]);
            }
        });

        return () => {
            unsubscribe();
        };
    }, [currentUser]);


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

    const filteredFiles = fileData.filter(
        (file) =>
            file.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAdd = async (file) => {
        try {
            // Retrieve additional details (title, uploaderEmail, description, coverPageURL) for the book
            const fileDetailsSnapshot = await db.ref(`files/${file.id}`).once('value');
            const { title, uploaderEmail, description, coverPageURL, tags } = fileDetailsSnapshot.val();


            // Navigate to the text editor route with the file ID and other details
            navigate(`/dashboard/textEditor/${file.id}`, {
                state: {
                    fileTitle: title,
                    fileUploaderEmail: uploaderEmail,
                    fileDescription: description,
                    tags: tags, // Pass the entire tags array
                    coverPageURL // Pass the cover page URL to the text editor
                }
            });
        } catch (error) {
            console.error("Error retrieving file details:", error);
        }
    };


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
            showToast("File deleted successfully!");
        } catch (error) {
            console.error(error);
            showToast("Failed to delete file");
        } finally {
            setLoading(false);
            setFileToDelete(null);
            setShowConfirmDelete(false);
        }
    };

    const deleteFiles = async (fileIds) => {
        if (toastVisible) return; // Prevent deleting files if toast is visible
        try {
            setLoading(true);
            await Promise.all(fileIds.map((fileId) => handleDelete(fileId)));
        } finally {
            setLoading(false);
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

    const handleConfirmDelete = (fileId) => {
        const fileToDelete = fileData.find(file => file.id === fileId);
        setFileToDelete(fileToDelete);
        setShowConfirmDelete(true);
    };


    const handleEdit = (file) => {
        setEditTitle(file.title);
        setEditCoverPageURL(file.coverPageURL);
        setEditDescription(file.description || "");
        setFileToEdit(file);
        setShowEditModal(true);
    };


    const saveEditedFile = async () => {
        try {
            setLoading(true);
            const updates = {
                title: editTitle,
                description: editDescription
            };

            if (editFile) {
                const fileRef = db.storage().ref().child(`files/${fileToEdit.id}`);
                await fileRef.put(editFile);
                const fileURL = await fileRef.getDownloadURL();
                updates.coverPageURL = fileURL;
                setEditCoverPageURL(fileURL); // Update editCoverPageURL with the new URL
            }

            await db.ref(`files/${fileToEdit.id}`).update(updates);
            showToast("File updated successfully!");
        } catch (error) {
            console.error(error);
            showToast("Failed to update file");
        } finally {
            setLoading(false);
            setShowEditModal(false);
            setFileToEdit(null);
            setEditFile(null);
        }
    };


    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setEditFile(file);
        // Assuming you have a function to upload the file to your storage
        uploadCoverImage(file);
    };

    const uploadCoverImage = async (file) => {
        try {
            setLoading(true);
            const fileRef = db.storage().ref().child(`files/${fileToEdit.id}`);
            await fileRef.put(file);
            const fileURL = await fileRef.getDownloadURL();
            setEditCoverPageURL(fileURL); // Update editCoverPageURL with the new URL
            return fileURL; // Return the file URL
        } catch (error) {
            console.error(error);
            showToast("Failed to upload cover image");
        } finally {
            setLoading(false);
        }
    };

    const resetEditForm = () => {
        setEditTitle(fileToEdit.title);
        setEditCoverPageURL(fileToEdit.coverPageURL);
        setEditDescription(fileToEdit.description || "");
        setEditFile(null);
    };

    const handleToggleComments = () => {
        setShowComments(!showComments);
    };

    const handleCommentChange = (e) => {
        setComment(e.target.value);
        if (e.target.value.trim().length === 0) {
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
            const newCommentRef = db.ref(`files/${fileId}/comments`).push();
            await newCommentRef.set({
                userEmail: currentUser.email,
                text: comment,
                createdAt: new Date().toISOString(),
            });
            setComment("");
            fetchComments(fileId);
        } catch (error) {
            console.error(error);
            showToast("Failed to add comment");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            setLoading(true);
            await db.ref(`files/${selectedFile.id}/comments/${commentId}`).remove();
            fetchComments(selectedFile.id);
            showToast("Comment deleted successfully!");
        } catch (error) {
            console.error(error);
            showToast("Failed to delete comment");
        } finally {
            setLoading(false);
        }
    };

    const toggleSave = () => {
        // Handle save and unsave logic here
    };

    const handleOpen = (coverPageURL) => {
        // Handle opening the file here
    };



    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = date.getDate();
        const month = date.toLocaleString('default', { month: 'short' });
        const year = date.getFullYear();
        const suffix = getSuffix(day);
        return `${day}${suffix} ${month} ${year}`;
    }

    function formatTime(timeString) {
        const time = new Date(timeString);
        let hours = time.getHours();
        const minutes = time.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // Handle midnight
        const formattedTime = `${hours}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;
        return formattedTime;
    }

    function getSuffix(day) {
        if (day > 3 && day < 21) return 'th';
        switch (day % 10) {
            case 1: return 'st';
            case 2: return 'nd';
            case 3: return 'rd';
            default: return 'th';
        }
    }

    return (
        <div className="center-section">
            <br />
            <br />
            <br />
            <br />
            <div className="searchname">
                <h2 className="text-center mb-4" style={{ color: "white" }}>Your Published Books</h2>
                <div className="row">
                    {/*} <input
                        type="text"
                        placeholder="Search by title..."
                        value={searchQuery}
                        onChange={handleSearchChange} className="form-control mb-3"
                        id="searchbar"
                    /> */}
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Search by title..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="form-control mb-3"
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
            <AnimatePresence>
                {loading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center"
                    >
                        <Spinner animation="border" variant="primary" />
                    </motion.div>
                )}
            </AnimatePresence>
            <AnimatePresence>
                {!loading && filteredFiles.length === 0 && (
                    <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-center"
                    >
                        No Books Published.
                    </motion.p>
                )}
            </AnimatePresence>
            <div className="urBooks">
                {filteredFiles.map((file) => (
                    <motion.div
                        key={file.id}
                        className=""
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                    >
                        <div className="cardbitch">
                            <div className="image-container">
                                <img
                                    src={file.coverPageURL}
                                    alt={file.title}
                                />
                            </div>
                            <div className="card-body d-flex flex-column">
                                <h5 className="booktitle">{file.title}</h5>
                                <div className="bookInfo">
                                    <p className="card-text"><b>Uploaded on: </b>{formatDate(file.createdAt)}</p>
                                    <p className="card-text"><b>Uploaded at: </b>{formatTime(file.createdAt)}</p>
                                    <p className="card-text"><b>Views:  </b>  {file.views}  <ion-icon name="heart" id="viewicon"></ion-icon> </p> {/* Display views count */}
                                </div>

                                <div className="buttons-container mt-3 d-flex mx-auto">
                                    <button
                                        className="bttn" style={{ backgroundColor: "skyblue" }}
                                        onClick={() => handleEdit(file)}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        className="bttn" style={{ backgroundColor: "#e67272" }}
                                        onClick={() => handleConfirmDelete(file.id)}
                                    >
                                        Delete
                                    </button>
                                    <button
                                        className="bttn"
                                        style={{ backgroundColor: "darkgrey" }}
                                        onClick={() => {
                                            setShowFileModal(true);
                                            setSelectedFile(file);
                                            fetchComments(file.id);
                                        }}
                                    >
                                        Open
                                    </button>
                                    <button
                                        className="bttn"
                                        style={{ backgroundColor: "#90EE90" }}
                                        onClick={() => handleAdd(file)}
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="mt-3 d-flex mx-auto">

                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {showConfirmDelete && (
                    <motion.div
                        className="modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.92 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowConfirmDelete(false)}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h5 className="modal-title">Confirm Delete</h5>
                                <button className="close" onClick={() => setShowConfirmDelete(false)}>
                                    <ion-icon name="close-circle" size="large"></ion-icon>
                                </button>
                            </div>
                            <div className="modal-body">
                                <h5 className="modal-title">Delete File</h5>
                                <img src={fileToDelete && fileToDelete.coverPageURL} alt="Cover Page" style={{ maxWidth: "100%", maxHeight: "200px", margin: "auto", display: "block" }} />
                                <p><strong>Title: </strong>{fileToDelete && fileToDelete.title}</p>
                                <p>Are you sure you want to delete this file?</p>
                            </div>
                            <div className="modal-footer">
                                <button className="modalbtn" onClick={() => setShowConfirmDelete(false)}>
                                    Cancel
                                </button>
                                <button className="modalbtn" style={{ backgroundColor: "#e83549" }} onClick={() => handleDelete(fileToDelete.id)}>
                                    Delete
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


            <AnimatePresence>
                {showEditModal && (
                    <motion.div
                        className="modal-backdrop"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.92 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setShowEditModal(false)}
                    >
                        <motion.div
                            className="modal-content"
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="modal-header">
                                <h5 className="modal-title">Edit File</h5>
                                <button className="close" onClick={() => setShowEditModal(false)}>
                                    <ion-icon name="close-circle" size="large"></ion-icon>
                                </button>
                                <button className="modalbtn" onClick={saveEditedFile}>Save Changes</button> {/* Moved "Save Changes" button here */}
                            </div>

                            <div className="modal-body">
                                <Form>
                                    <Form.Group controlId="editTitle">
                                        <Form.Label>Title</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={editTitle}
                                            onChange={(e) => setEditTitle(e.target.value)}
                                        />
                                    </Form.Group>
                                    <Form.Group controlId="editCoverPageURL">
                                        <Form.Label>Cover Page</Form.Label>
                                        <img src={editCoverPageURL} alt="Cover Page" style={{ maxWidth: "100%", maxHeight: "200px", margin: "auto", display: "block" }} />
                                        {/* Remove the file input control */}
                                    </Form.Group>
                                    <Form.Group controlId="editDescription">
                                        <Form.Label>Description</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            rows={3}
                                            value={editDescription}
                                            onChange={(e) => setEditDescription(e.target.value)}
                                        />
                                    </Form.Group>
                                </Form>
                            </div>
                            {/* Removed modal footer */}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>


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
                                        <img
                                            src={selectedFile.coverPageURL}
                                            alt="Cover Page"
                                            style={{ width: "30%", margin: "10px" }}
                                        />
                                        <div>
                                            <h3>{selectedFile.title}</h3>
                                            <p><i>Uploaded By: {selectedFile.uploaderEmail}</i></p>
                                            <p>Description: {selectedFile.description}</p>
                                        </div>
                                    </div>
                                )}
                                <div>
                                    <p className="comflex">
                                        <h4 className="p-2">
                                            Comments <ion-icon name="chatbubble-outline"></ion-icon> :
                                        </h4>
                                        <button onClick={handleToggleComments} className="modalbtn">
                                            {showComments ? "Hide Comments" : "Show Comments"}{" "}
                                            <ion-icon name="chatbubbles-outline"></ion-icon>
                                        </button>
                                    </p>
                                    {showComments &&
                                        fileComments.map((comment, index) => (
                                            <div className="comment m-2" key={index}>
                                                <i><small>By: {comment.userEmail}</small></i>
                                                <p>{comment.text}</p>
                                                {comment.userEmail === (currentUser && currentUser.email) && (
                                                    <button
                                                        className="modalbtn"
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                    >
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* New Section for Tags */}
                            <div className="modal-tags">
                                <h5>Tags</h5>
                                <div className="tags-container">
                                    {selectedFile && selectedFile.tags && selectedFile.tags.length > 0 ? (
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
                                {selectedFile && (
                                    <button
                                        className="modalbtn"
                                        onClick={() => openFile(selectedFile.id, selectedFile.fileURL, selectedFile.createdBy)}
                                    >
                                        Read
                                    </button>
                                )}
                                {/* <button className="modalbtn" onClick={toggleSave}>
                        {selectedFile && selectedFile.isSaved ? "Unsave" : "Save"}
                    </button> */}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>



            <ToastContainer />
        </div>
    );
}
