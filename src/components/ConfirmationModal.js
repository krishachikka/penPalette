import React from 'react';
import '../styles/ConfirmationModal.css';

const ConfirmationModal = ({ isOpen, onConfirm, onCancel, fileTitle }) => {
  if (!isOpen) return null;

  return (
    <div className="confirmation-modal">
      <div className="confirmation-modal-content">
        <h3>Are you sure you want to remove "{fileTitle}"?</h3>
        <div className="confirmation-buttons">
          <button className="confirm-button" onClick={onConfirm}>Yes, Unsave</button>
          <button className="cancel-button" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
