import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContexts';
import { useNavigate } from 'react-router-dom';
import "../../styles/dashboard/SavedBooks.css";
import "../../styles/card.css";
import { toast } from "react-toastify";
import logomeow from "../../images/logomeow.png";
import ConfirmationModal from '../ConfirmationModal';

const SavedBooks = () => {
    const [savedFiles, setSavedFiles] = useState([]);
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const [toastVisible, setToastVisible] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [fileToUnsave, setFileToUnsave] = useState(null);

    const goBack = () => {
        navigate('/dashboard');
    };

    useEffect(() => {
        if (currentUser) {
            const fetchSavedFiles = async () => {
                try {
                    const savedFilesSnapshot = await db.ref(`users/${currentUser.uid}/savedFiles`).once("value");
                    const savedFilesData = savedFilesSnapshot.val() || {};
                    const savedFileIds = Object.keys(savedFilesData);

                    const filesSnapshot = await db.ref("files").once("value");
                    const allFilesData = filesSnapshot.val() || {};
                    const savedFiles = Object.entries(allFilesData).filter(([key]) => savedFileIds.includes(key));

                    setSavedFiles(savedFiles.map(([key, value]) => ({
                        id: key,
                        ...value,
                    })));
                } catch (error) {
                    console.error("Error fetching saved files:", error);
                }
            };

            fetchSavedFiles();
        }
    }, [currentUser]);

    const openFile = async (fileId, fileURL, createdBy) => {
        try {
            if (createdBy !== currentUser.uid) {
                await db.ref(`files/${fileId}/views`).transaction((currentViews) => {
                    return (currentViews || 0) + 1;
                });
            }
            navigate(`/book/${fileId}`);
        } catch (error) {
            console.error("Failed to open file", error);
            alert("Failed to open file");
        }
    };

    const handleSave = async (fileId) => {
        try {
            const userRef = db.ref(`users/${currentUser.uid}/savedFiles`);
            const snapshot = await userRef.child(fileId).once("value");

            if (snapshot.exists()) {
                setFileToUnsave(fileId); // Set the file ID to unsave
                setIsModalOpen(true); // confirmation modal
            } else {
                await userRef.child(fileId).set(true);
                setSavedFiles(prev => [...prev, fileId]);
                showToast("Saved to your book list");
            }
        } catch (error) {
            console.error("Error saving file:", error);
        }
    };

    const handleUnsave = async () => {
        try {
            const userRef = db.ref(`users/${currentUser.uid}/savedFiles`);
            if (fileToUnsave) {
                await userRef.child(fileToUnsave).remove();
                setSavedFiles(prev => prev.filter(file => file.id !== fileToUnsave)); // Update state directly
                showToast("Removed from saved books");
                setFileToUnsave(null); // Reset the file ID
            }
        } catch (error) {
            console.error("Error unsaving file:", error);
        } finally {
            setIsModalOpen(false); // Close the modal
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

    const handleCancel = () => {
        setFileToUnsave(null); // Reset the file ID
        setIsModalOpen(false); // Close the modal
    };

    return (
        <div className="saved-books-container">
            <header className="saved-books-title">
                <button className="goback" onClick={goBack}>
                    <ion-icon name="arrow-back" size="large"></ion-icon>
                </button>
                <img src={logomeow} alt="Meow"></img>
                <h1>Saved Books</h1>
            </header>
            <div className="book-list">
                {savedFiles.length === 0 ? (
                    <p>No saved books.</p>
                ) : (
                    savedFiles.map((file) => (
                        <div key={file.id} className="book-item layout">
                            <img src={file.coverPageURL} alt={file.title} className="bookcover" />
                            <div className="book-details">
                                <h4>{file.title}</h4>
                                <div className='Savedlistbuttons'>
                                    <button
                                        className="reading button"
                                        onClick={() => openFile(file.id, file.coverPageURL, file.createdBy)}
                                    >
                                        Continue Reading
                                    </button>
                                    <ion-icon
                                        name="bookmark"
                                        size="large"
                                        className="bookMarkIcon"
                                        style={{
                                            color: savedFiles.some(savedFile => savedFile.id === file.id) ? "#580391d1" : "gray",
                                            cursor: "pointer", margin: "7px"
                                        }}
                                        onClick={() => handleSave(file.id)}
                                    ></ion-icon>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={isModalOpen}
                fileTitle={savedFiles.find(file => file.id === fileToUnsave)?.title || ''}
                onConfirm={handleUnsave}
                onCancel={handleCancel}
            />
        </div>
    );
};

export default SavedBooks;