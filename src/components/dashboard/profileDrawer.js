import React, { useState, useRef, useEffect } from "react";
import Profile from "./profile";
import FileUpload from "./FileUpload";
import "../../styles/profiledrawer.css";
import { motion, AnimatePresence } from 'framer-motion';

const ProfileDrawer = ({ isOpen, onClose, currentUser, fileData, setLoading }) => {
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [showFileUploadModal, setShowFileUploadModal] = useState(false);
    const profileModalRef = useRef(null);
    const fileUploadModalRef = useRef(null);

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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (profileModalRef.current && !profileModalRef.current.contains(event.target)) {
                setShowProfileModal(false);
            }
            if (fileUploadModalRef.current && !fileUploadModalRef.current.contains(event.target)) {
                setShowFileUploadModal(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <>
        {isOpen && (
                <div className="blur-background"></div>
            )}
        <div className={`profile-drawer ${isOpen ? "open" : ""}`}>

            <button className="close-button" onClick={onClose}><ion-icon name="close-circle" size="large"></ion-icon></button>

            <div className="left-section">
                <button onClick={handleOpenProfileModal} className="button">
                    <ion-icon name="person" id="btnicon"></ion-icon> Profile
                </button>
                {/* Profile Modal */}
                {showProfileModal && (
                    <div ref={profileModalRef} className="overlay">
                        <div className="modal-container slide-down">
                            <div className="modal-content" style={{maxWidth: "100%"}}>
                                    <button onClick={handleCloseProfileModal} type="button" className="bttn">
                                        Close
                                    </button>
                                <div className="modal-body">
                                    <Profile />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <button onClick={handleOpenFileUploadModal} className="button">
                <ion-icon name="create"></ion-icon>     Write your own Story
                </button> {/* Added button to open file upload modal */}

                {/* File Upload Modal */}
                {showFileUploadModal && (
                    <div ref={fileUploadModalRef} className="file-upload-modal">
                        <div className="overlay">
                            <div className="modal-container slide-down">
                                <div className="modalcontent">
                                    <div className="modalbody">
                                        <FileUpload currentUser={currentUser} setLoading={setLoading} />
                                    </div>
                                    <div className="modalfooter">
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
        </>
    );
};

export default ProfileDrawer;
