// LandingPage.js

import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import WAVES from 'vanta/src/vanta.waves';
import { auth } from "../firebase"; // Import Firebase auth instance
import "../styles/landingpage.css"; // Import the CSS file
import logo from "../images/logo.png";
import book from "../images/book.png";

function LandingPage() {
    const vantaRef = useRef(null);
    const navigate = useNavigate();
    const [fadeIn, setFadeIn] = useState(false);

    useEffect(() => {
        // Vanta.js effect setup
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

        // Clean up Vanta.js effect
        return () => {
            if (vantaEffect) vantaEffect.destroy();
        };
    }, [vantaRef]);

    useEffect(() => {
        // Trigger fade in animation after 100ms delay
        const timer = setTimeout(() => {
            setFadeIn(true);
        }, 100);

        // Clear timer on component unmount
        return () => clearTimeout(timer);
    }, []);

    const handleGetStarted = () => {
        if (auth.currentUser) {
            // Redirect to dashboard if user is logged in
            navigate('/dashboard');
        } else {
            // Redirect to login if user is not logged in
            navigate('/login');
        }
    };

    return (
        <div>
            <div className={`bg ${fadeIn ? 'fade-in' : ''}`} ref={vantaRef}>
                <img src={logo} alt="Logo" className={`logo ${fadeIn ? 'fade-in-logo' : ''}`} />
                <div className={`block ${fadeIn ? 'fade-in-block' : ''}`}>
                    <img src={book} alt="Book" className="book" />
                    <div>
                        <h1 className="titlel">Welcome to Our Website!</h1>
                        <p className="subtitle">Please log in or sign up to access our services.</p>
                    </div>
                </div>
                <div className={`button-container ${fadeIn ? 'fade-in-button' : ''}`}>
                    <button className="buttonlp" onClick={handleGetStarted}>
                        Get Started
                    </button>
                </div>
            </div>
        </div>
    );
}

export default LandingPage;
