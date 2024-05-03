import React, { useRef, useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContexts";
import { Link } from "react-router-dom";
import WAVES from 'vanta/src/vanta.waves'; // Import Vanta Waves
import "../styles/forgot.css";

export default function ForgotPassword() {
  const emailRef = useRef();
  const { resetPassword } = useAuth();
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const vantaRef = useRef(null);

  useEffect(() => {
    const vantaEffect = WAVES({
      el: vantaRef.current,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 200.00,
      minWidth: 200.00,
      scale: 1.00,
      scaleMobile: 1.00,
      color: 0x1c0831,
      waveHeight: 13.00,
      waveSpeed: 0.75,
      zoom: 1.20
    });

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, []); // Empty dependency array to ensure effect runs only once


  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setMessage("");
      setError("");
      setLoading(true);
      await resetPassword(emailRef.current.value);
      setMessage("Check your inbox for further instructions");
    } catch {
      setError("Failed to reset password");
    }

    setLoading(false);
  }

  return (
    <body ref={vantaRef} id="body">
      <div className="forgot-card">
        <div className="card-body">
          <h2 className="text-center mb-4">Password Reset</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {message && <div className="alert alert-success">{message}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" ref={emailRef} required className="form-control" id="form-control" />
            </div>
            <button disabled={loading} className="button w-100" type="submit">
              Reset Password
            </button>
          </form>
          <div className="w-100 text-center mt-3">
            <Link to="/login" className="linktext">Login</Link>
          </div>
        </div>
        <div className="w-100 text-center mt-5">
          Need an account? <Link to="/signup" className="linktext">Sign Up</Link>
        </div>
      </div>

    </body>
  );
}