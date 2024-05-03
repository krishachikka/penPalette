import React from "react";
import Profile from "./profile";
import FileUpload from "./FileUpload";
import UploadedFilesSection from "./UploadedFilesSection";
import "../../styles/profiledrawer.css"

const ProfileDrawer = ({ isOpen, onClose, currentUser, fileData}) => {
  return (
    <div className={`profile-drawer ${isOpen ? "open" : ""}`}>
      {/* Content of the profile drawer */}
      <div className="left-section">
          <Profile />
          <FileUpload currentUser={currentUser} />
      </div>
      {/* <div className="center-section">
          <UploadedFilesSection fileData={fileData} currentUser={currentUser} />
      </div> */}
      {/* Close button */}
      <button className="close-button" onClick={onClose}>Close</button>
    </div>
  );
};

export default ProfileDrawer;
