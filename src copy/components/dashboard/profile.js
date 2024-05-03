import React, { useState } from "react";
import { Card, Alert, Button, Spinner } from "react-bootstrap";
import { useAuth } from "../../contexts/AuthContexts";
import { Link, useNavigate } from "react-router-dom";

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
            <Card>
                <Card.Body>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <p>
                        <strong>Email:</strong> {currentUser.email}
                    </p>
                    <Link to="/update-profile" className="btn btn-primary btn-block mt-3">
                        Update Profile
                    </Link>
                    <div className="w-100 text-center mt-2">
                        <Button variant="link" onClick={handleLogout}>
                            Log Out
                        </Button>
                    </div>
                </Card.Body>
            </Card>
        </>
    );
}
