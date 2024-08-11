import React, { useState, useEffect } from 'react';
import { db } from '../../firebase';
import { useAuth } from '../../contexts/AuthContexts';
import { useNavigate } from 'react-router-dom';
import "../../styles/dashboard/SavedBooks.css"; // Import the CSS file for styling

const SavedBooks = () => {
    const [savedFiles, setSavedFiles] = useState([]);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

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
            // Navigate to the dynamic route with the book ID
            navigate(`/book/${fileId}`);
        } catch (error) {
            console.error("Failed to open file", error);
            // Optional: Display a user-friendly message
            alert("Failed to open file");
        }
    };

    return (
        <div className="saved-books-container">
            <h1 className="saved-books-title">Saved Books</h1>
            <div className="book-list">
                {savedFiles.length === 0 ? (
                    <p>No saved books.</p>
                ) : (
                    savedFiles.map((file) => (
                        <div key={file.id} className="book-item">
                            <img src={file.coverPageURL} alt={file.title} className="book-cover" />
                            <div className="book-details">
                                <h3>{file.title}</h3>
                                <p>{file.description}</p>
                                <button
                                    className="continue-reading-btn"
                                    onClick={() => openFile(file.id, file.coverPageURL, file.createdBy)}
                                >
                                    Continue Reading
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default SavedBooks;