import React, { useState } from "react";

export default function FileUpload({ currentUser }) {
    const [error, setError] = useState("");
    const [file, setFile] = useState(null);
    const [coverPage, setCoverPage] = useState(null);
    const [title, setTitle] = useState("");
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setFile(file);
    };

    const handleCoverPageChange = (e) => {
        const coverPage = e.target.files[0];
        setCoverPage(coverPage);
    };

    const handleTitleChange = (e) => {
        setTitle(e.target.value);
    };

    const handlePublish = async () => {
        setError("");
        setLoading(true);

        try {
            if (!file || !coverPage || !title) {
                throw new Error("Please select a file, cover page, and provide a title.");
            }

            // Simulating file upload with setTimeout
            setLoading(true);
            setTimeout(() => {
                setShowSuccessModal(true); // Show success modal after successful upload
                setLoading(false);
            }, 2000);

        } catch (error) {
            setError(error.message);
            console.error(error);
            setLoading(false);
        }
    };

    return (
        <div className="card mb-3">
            <h2 className="text-center mb-4" style={{ color: "black" }}>File Upload</h2>
            <div className="card-body">
                <input type="file" className="form-control mb-2" onChange={handleFileChange} />
                <input type="file" className="form-control mb-2" onChange={handleCoverPageChange} />
                <input type="text" className="form-control mb-2" placeholder="Title" value={title} onChange={handleTitleChange} />
                {error && <p className="text-danger">{error}</p>}
                <button onClick={handlePublish} className="btn btn-success btn-block" disabled={loading} style={{ color: "white" }}>
                    {loading ? "Uploading..." : "Publish"}
                </button>
            </div>

            {/* Success Modal */}
            {showSuccessModal && (
                <div className="modal" style={{ display: "block" }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">File Uploaded Successfully!</h5>
                                <button type="button" className="btn-close" onClick={() => setShowSuccessModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                Your file has been successfully uploaded.
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowSuccessModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
