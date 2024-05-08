import React, { useState } from "react";
import { storage, db } from "../../firebase";
import { useNavigate } from "react-router-dom";
import "../../styles/modal.css";

export default function FileUpload({ currentUser }) {
    const [error, setError] = useState("");
    const [file, setFile] = useState(null);
    const [coverPage, setCoverPage] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFile(file);
        setError("");
    };

    const handleCoverPageChange = (e) => {
        const coverPage = e.target.files[0];
        setCoverPage(coverPage);
        setError("");
    };

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
        setError("");
    };

    const handleDescriptionChange = (e) => {
        setDescription(e.target.value);
        setError("");
    };

    const handlePublish = async () => {
        setError("");
        setLoading(true);

        try {
            if (!file || !coverPage || !title) {
                throw new Error("Please select a file, cover page, and provide a title.");
            }

            const fileRef = storage.ref().child(file.name);
            await fileRef.put(file);

            const coverPageRef = storage.ref().child(coverPage.name);
            await coverPageRef.put(coverPage);

            const fileURL = await fileRef.getDownloadURL();
            const coverPageURL = await coverPageRef.getDownloadURL();

            const newFileKey = db.ref().child("files").push().key;
            await db.ref(`files/${newFileKey}`).set({
                title,
                description,
                fileURL,
                coverPageURL,
                uploaderEmail: currentUser && currentUser.email,
                createdBy: currentUser && currentUser.uid,
                createdAt: new Date().toISOString(),
                views: 0,
            });

            setShowSuccessModal(true);

        } catch (error) {
            setError(error.message);
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleNext = () => {
        if (!file || !coverPage || !title) {
            setError("Please select a file, cover page, and provide a title.");
            return;
        }
        navigate("/textEditor", {
            state: {
                coverPageURL: URL.createObjectURL(coverPage),
                fileTitle: title,
                fileDescription: description
            }
        });
    };

    const handleCancel = () => {
        setError("");
        setFile(null);
        setCoverPage(null);
        setTitle("");
        setDescription("");
        setLoading(false);
        setShowSuccessModal(false);
        document.getElementById("fileInput").value = "";
        document.getElementById("coverPageInput").value = "";
    };

    return (
        <div className="file-upload-container mb-3">
            <h2 className="text-center mb-4">File Upload</h2>
            <div className="card-body">
                <input id="fileInput" type="file" className="form-control mb-2" onChange={handleFileChange} />
                <input id="coverPageInput" type="file" className="form-control mb-2" onChange={handleCoverPageChange} />
                <input type="text" className="form-control mb-2" placeholder="Title" value={title} onChange={handleTitleChange} />
                <textarea className="form-control mb-2" placeholder="Description" value={description} onChange={handleDescriptionChange} />
                {error && <p className="text-danger">{error}</p>}
                <button onClick={handlePublish} className="bttn btn-success btn-block " disabled={loading}>
                    {loading ? <div className="spinner-border spinner-border-sm" role="status"></div> : "Publish"}
                </button>
                <button onClick={handleNext} className="bttn" disabled={loading}>
                    Next
                </button>
                <button onClick={handleCancel} className="bttn">
                    Cancel
                </button>
            </div>

            {showSuccessModal && (
                <div className="modal" style={{ display: "block",width: "100vw",backgroundColor: "rgba(0, 0, 0, 0.5)", color: "black"}}>
                    <div className="modal-content" style={{ backgroundColor: "white", margin: "15% auto", padding: "20px", border: "1px solid #888", width: "50%" }}>
                        <div className="modal-header">
                        <ion-icon name="happy-outline" size="large"></ion-icon>
                            <h5 className="modal-title">File Uploaded Successfully!</h5>
                            <button type="button" className="close" style={{border: "none", backgroundColor:"transparent"}} onClick={() => setShowSuccessModal(false)}>
                                <ion-icon name="close-circle" size="large"></ion-icon>
                            </button>
                        </div>
                        <div className="modal-body">
                            Your file has been successfully uploaded.
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" onClick={() => setShowSuccessModal(false)}>Close</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
