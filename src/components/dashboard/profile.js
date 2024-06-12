import React, { useState } from "react";
import { useAuth } from "../../contexts/AuthContexts";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/modal.css";

export default function Profile() {
    const [error, setError] = useState("");
    const { currentUser, logout } = useAuth();
    const history = useNavigate();

    const handleLogout = async () => {
        setError("");

        try {
            await logout();
            history.push("/login");
        } catch {
            setError("Failed to log out");
        }
    };

    return (
        <>
            <h2 className="text-center" style={{ color: "white" }}>
                Profile
            </h2>
            {/* <div className="card"> */}
            <div className="card-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <p>
                    <strong>Email:</strong> {currentUser.email}
                </p>
                {/* <button className="bttn">
                    <Link to="/update-profile" style={{ textDecoration: "none", color: "black" }}>
                        Update Profile
                    </Link> 
            </button> */}
                <div className="w-100 text-center mt-2">
                    <button className="button" onClick={handleLogout}>
                        Log Out
                    </button>
                </div>
            </div >
            {/* </div> */}
        </>
    );
}