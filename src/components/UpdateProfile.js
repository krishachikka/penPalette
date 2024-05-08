import React, { useRef, useState } from "react";
import { useAuth } from "../contexts/AuthContexts";
import { Link, useNavigate } from "react-router-dom";

export default function UpdateProfile() {
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const { currentUser, updatePassword } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError("Passwords do not match");
    }

    setError("");
    setLoading(true);

    try {
      await updatePassword(passwordRef.current.value);
      navigate("/dashboard");
    } catch {
      setError("Failed to update account");
    }

    setLoading(false);
  }

  return (
    <div style={{backgroundColor:"rgb(41, 1, 75)", height:"100vh", padding:"50px"}}>
      <div className="signup-card">
        <div className="card-body">
          <h2 className="text-center mb-4">Update Profile</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={currentUser.email}
                disabled
                className="form-control" id="form-control"
              />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                ref={passwordRef}
                required
                placeholder="Enter new password"
                className="form-control" id="form-control"
              />
            </div>
            <div className="form-group">
              <label>Password Confirmation</label>
              <input
                type="password"
                ref={passwordConfirmRef}
                required
                placeholder="Confirm new password"
                className="form-control" id="form-control"
              />
            </div>
            <button disabled={loading} className="button" type="submit">
              Update Password
            </button>
          </form>
          <button className="button"><Link to="/dashboard" style={{textDecoration:"none", color:"white"}}>Cancel</Link></button>
        </div>
        <div className="w-100 text-center mt-2">
        
      </div>
      </div>
      
    </div>
  );
}
