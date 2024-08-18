import React, { useRef, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContexts';
import WAVES from 'vanta/src/vanta.waves';
import '../../styles/Authentication/signup.css';
import logo from '../../images/logo.png';

function Signup() {
  const emailRef = useRef();
  const passwordRef = useRef();
  const passwordConfirmRef = useRef();
  const usernameRef = useRef(); // Added ref for username
  const { signup } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const vantaRef = useRef(null);

  async function handleSubmit(e) {
    e.preventDefault();

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      await signup(emailRef.current.value, passwordRef.current.value, usernameRef.current.value);
      navigate('/dashboard'); // Redirect to dashboard after successful signup
    } catch {
      setError('Failed to create an account');
    }

    setLoading(false);
  }

  useEffect(() => {
    const vantaEffect = WAVES({
      el: vantaRef.current,
      mouseControls: true,
      touchControls: true,
      gyroControls: false,
      minHeight: window.innerHeight,
      minWidth: window.innerWidth,
      scale: 1.00,
      scaleMobile: 1.00,
      color: 0x1c0831,
      waveHeight: 13.00,
      waveSpeed: 0.75,
      zoom: 1.20,
    });

    return () => {
      if (vantaEffect) vantaEffect.destroy();
    };
  }, []);

  return (
    <body ref={vantaRef}>
      <img src={logo} alt="Logo" className="logosignup"/>
      <div className="scontainer">
        <div className="signup-card">
          <div className="cardbody">
            <h2 className="heading">SIGNUP</h2>
            {error && <div className="alert alert-danger">{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  ref={usernameRef}
                  required
                  className="form-control mt-3"
                  id="form-control"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  ref={emailRef}
                  required
                  className="form-control mt-3"
                  id="form-control"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  ref={passwordRef}
                  required
                  className="form-control mt-3"
                  id="form-control"
                />
              </div>
              <div className="form-group">
                <label>Password Confirmation</label>
                <input
                  type="password"
                  ref={passwordConfirmRef}
                  required
                  className="form-control mt-3"
                  id="form-control"
                />
              </div>
              <button disabled={loading} className="button w-100" type="submit">
                Sign Up
              </button>
            </form>
          </div>
          <div className="text-center mt-3">
            Already have an account? <Link to="/login" className="linktext">Log In</Link>
          </div>
        </div>
      </div>
    </body>
  );
}

export default Signup;