import React, { useRef, useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContexts";
import { Link, useNavigate } from "react-router-dom";
import "../../styles/Authentication/login.css"; // Import CSS styles
import WAVES from 'vanta/src/vanta.waves'; // Import Vanta Waves
import "../../styles/Authentication/landingpage.css"; // Import the CSS file
import logo from "../../images/logo.png";
import cool from "../../images/cool.gif";
import "../../styles/animation.css";

export default function Login() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const { login, currentUser } = useAuth(); // Access currentUser from the auth context
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const vantaRef = useRef(null); // Create a ref for Vanta Waves

  // Redirect if user is already logged in
  useEffect(() => {
    if (currentUser) {
      navigate("/dashboard"); // Redirect to dashboard if logged in
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    const vantaEffect = WAVES({
      el: vantaRef.current,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: 500.00,
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
  }, []);

  useEffect(() => {
    const eyeball = (event) => {
      const eyes = document.querySelectorAll(".eye");
      eyes.forEach((eye) => {
        let x = eye.getBoundingClientRect().left + eye.clientWidth / 2;
        let y = eye.getBoundingClientRect().top + eye.clientHeight / 2;
        let radian = Math.atan2(event.pageX - x, event.pageY - y);
        let rot = radian * (180 / Math.PI) * -1 + 270;
        eye.style.transform = `rotate(${rot}deg)`;
      });
    };

    document.querySelector("body").addEventListener("mousemove", eyeball);

    return () => {
      document.querySelector("body").removeEventListener("mousemove", eyeball);
    };
  }, []);

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
    <div className="outer">
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
          <div className="face">
            <div className="eyes">
              <div className="eye"></div>
              <div className="eye"></div>
            </div>
          </div>
        </div>

        {/* Additional content at the bottom */}
        <footer className="footer">
          <p className="text-center">&copy; 2024 Your Website. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
}