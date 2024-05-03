import React, { useRef, useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContexts";
import { Link, useNavigate } from "react-router-dom";
import "../styles/login.css"; // Import CSS styles
import WAVES from 'vanta/src/vanta.waves'; // Import Vanta Waves
import "../styles/landingpage.css"; // Import the CSS file
import logo from "../images/logo.png";
import cool from "../images/cool.gif";

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const vantaRef = useRef(null); // Create a ref for Vanta Waves

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
      setError("");
      setLoading(true);
      await login(emailRef.current.value, passwordRef.current.value);
      navigate("/dashboard"); // Redirect to dashboard after successful login
    } catch {
      setError("Failed to Sign in");
    }

    setLoading(false);
  }

  return (
    <div className="bg" ref={vantaRef}>
      <img src={logo} alt="Logo" className="logosml" />
      <div className="container">
        <div className="login-card">
          <h2 className="text-center mb-4">Log In</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                ref={emailRef}
                required
                className="form-control mt-3" id="form-control"
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                ref={passwordRef}
                required
                className="form-control mt-3" id="form-control"
              />
            </div>
            <button disabled={loading} className="button w-100" type="submit">
              Log In
            </button>
          </form>
          <div className="w-100 text-center mt-3">
            <Link to="/forgot-password" className="linktext">Forgot Password?</Link>
          </div>
          <div className="w-100 text-center mt-2 pt-4">
            Need an account? <Link to="/signup" className="linktext">Sign Up</Link>
          </div>
        </div>
        <img src={cool} alt="cool" className="cool" />
      </div>

    </div>
  );
}