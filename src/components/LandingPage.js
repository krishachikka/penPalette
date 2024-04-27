import React, { useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
// import { Link } from "react-router-dom";
import WAVES from 'vanta/src/vanta.waves';
import "../styles/landingpage.css"; // Import the CSS file
import logo from "../images/logo.png";
import book from "../images/book.png";

function LandingPage() {
    const vantaRef = useRef(null);
    const navigate = useNavigate();

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
    }, [vantaRef]);


    return (
        <div className="bg" ref={vantaRef}>
            <img src={logo} alt="Logo" className="logo" />
            <div className="block">
                <img src={book} alt="Book" className="book" />
                <div>
                    <h1 className="title">Welcome to Our Website!</h1>
                    <p className="subtitle">Please log in or sign up to access our services.</p>
                </div>
            </div>
            <div className="button-container">
                <button className="buttonlp" onClick={() => navigate('/login')}>
                  Login
                </button>
                <button className="buttonlp" onClick={() => navigate('/signup')}>
                  Signup
                </button>
            </div>
        </div>
    );
}

export default LandingPage;