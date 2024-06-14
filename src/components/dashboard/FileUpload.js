import React, { useState } from "react";
import { storage, db } from "../../firebase";
import { useNavigate } from "react-router-dom";
// import "../../styles/modal.css";
// import "../../styles/card.css"

export default function FileUpload({ currentUser }) {
    const [error, setError] = useState("");
    const [coverPage, setCoverPage] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);
    const [coverPagePreview, setCoverPagePreview] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const navigate = useNavigate();

    const handleCoverPageChange = (e) => {
        const coverPage = e.target.files[0];
        setCoverPage(coverPage);
        setError("");

        // Preview cover page image
        const reader = new FileReader();
        reader.onload = (e) => {
            setCoverPagePreview(e.target.result);
        };
        reader.readAsDataURL(coverPage);
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
            if (!coverPage || !title) {
                throw new Error("Please select a cover page and provide a title.");
            }

            const coverPageRef = storage.ref().child(coverPage.name);
            await coverPageRef.put(coverPage);

            const coverPageURL = await coverPageRef.getDownloadURL();

            const newFileKey = db.ref().child("files").push().key;
            await db.ref(`files/${newFileKey}`).set({
                title,
                description,
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
        if (!coverPage || !title) {
            setError("Please select a cover page and provide a title.");
            return;
        }
        navigate("/dashboard/textEditor", {
            state: {
                coverPageURL: URL.createObjectURL(coverPage),
                fileTitle: title,
                fileDescription: description
            }
        });
    };

    const handleCancel = () => {
        setError("");
        setCoverPage(null);
        setTitle("");
        setDescription("");
        setLoading(false);
        setCoverPagePreview(null);
        document.getElementById("coverPageInput").value = "";
    };

    const closeModal = () => {
        setShowSuccessModal(false);
        handleCancel();
    };

    return (
        <div className="file-upload-container mb-3">
            <h2 className="text-center mb-4">Story Details</h2>
            <div className="card-body">
                <input id="coverPageInput" type="file" accept="image/*" className="form-control mb-2" onChange={handleCoverPageChange} />

                {coverPagePreview && (
                    <img src={coverPagePreview} alt="Cover Page Preview" className="cover-page-preview mb-2" style={{ width: '100px', height: '100px', border: '5px solid white', margin: '10px' }} />
                )}
                <input type="text" className="form-control mb-2" placeholder="Title" value={title} onChange={handleTitleChange} />
                <textarea className="form-control mb-2" placeholder="Description" value={description} onChange={handleDescriptionChange} />
                {error && <p className="text-danger">{error}</p>}
                <button onClick={handlePublish} className="bttn btn-success btn-block" disabled={loading}>
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
                        <div className="modal-header" style={{color:"black"}}>
                        <ion-icon name="happy-outline" size="large"></ion-icon>
                            <h5 className="modal-title" >Book Uploaded Successfully!</h5>
                            <button type="button" className="close" style={{border: "none", backgroundColor:"transparent", color:"black"}} onClick={() => setShowSuccessModal(false)}>
                                <ion-icon name="close-circle" size="large"></ion-icon>
                            </button>
                        </div>
                        <div className="modal-body d-flex flex-row justify-items-center" style={{color:"black"}}>
                            {coverPagePreview && (
                                <img src={coverPagePreview} alt="Uploaded Cover Page" style={{ maxWidth: '20%'}} />
                            )}
                            <h6>Your Story has been successfully uploaded.</h6>
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