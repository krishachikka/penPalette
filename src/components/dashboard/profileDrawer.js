import React, { useState } from "react";
import Profile from "./profile";
import FileUpload from "./FileUpload";
import "../../styles/profiledrawer.css"; // If you have custom styles for the profile drawer

const ProfileDrawer = ({ isOpen, onClose, currentUser, fileData, setLoading }) => {
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showFileUploadModal, setShowFileUploadModal] = useState(false);

    const handleOpenProfileModal = () => {
        setShowProfileModal(true);
    };

    const handleCloseProfileModal = () => {
        setShowProfileModal(false);
    };

    const handleOpenFileUploadModal = () => {
        setShowFileUploadModal(true);
    };

    const handleCloseFileUploadModal = () => {
        setShowFileUploadModal(false);
    };

    return (
        <div className={`profile-drawer ${isOpen ? "open" : ""}`}>
        
        <button className="close-button" onClick={onClose}><ion-icon name="close-circle" size="large"></ion-icon></button>

            <div className="left-section">
                <button onClick={handleOpenProfileModal} className="button">
                    <ion-icon name="person" id="btnicon"></ion-icon> Profile
                </button>
                            {/* Profile Modal */}
                            {showProfileModal && (
                                <div className="overlay" onClick={handleCloseProfileModal}>
                                    <div className="modal-container slide-down">
                                        <div className="modal-content">
                                            <div className="modal-body">
                                                <Profile />
                                            </div>
                                            <div className="modal-footer">
                                                <button onClick={handleCloseProfileModal} type="button" className="close-button">
                                                    Close
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                <button onClick={handleOpenFileUploadModal} className="button">
                <ion-icon name="images" id="btnicon"></ion-icon>  Upload File
                </button> {/* Added button to open file upload modal */}

                            {/* File Upload Modal */}
                            {showFileUploadModal && (
                                <div className="file-upload-modal">
                                    <div className="overlay">
                                        <div className="modal-container slide-down">
                                            <div className="modal-content">
                                                <div className="modal-body">
                                                    <FileUpload currentUser={currentUser} setLoading={setLoading} />
                                                </div>
                                                <div className="modal-footer">
                                                    <button onClick={handleCloseFileUploadModal} type="button" className="button">
                                                        Close
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
            </div>


        </div>
    );
};

export default ProfileDrawer;
