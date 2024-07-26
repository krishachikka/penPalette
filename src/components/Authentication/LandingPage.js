// LandingPage.js

import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import WAVES from 'vanta/src/vanta.waves';
import { auth } from "../../firebase"; // Import Firebase auth instance
import "../../styles/Authentication/landingpage.css"; // Import the CSS file
import logo from "../../images/logo.png";
import book from "../../images/logomeow.png";
import reading from "../../images/landing/reading.png"

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
        
        <div className={`bg ${fadeIn ? 'fade-in' : ''}`} ref={vantaRef}>
            <section className="scrollableContent">
                <img src={logo} alt="Logo" className={`logo ${fadeIn ? 'fade-in-logo' : ''}`} />
                <div className={`block ${fadeIn ? 'fade-in-block' : ''}`}>
                    <img src={book} alt="Book" className="book" />
                    <section>
                        <h1 className="titlel">Welcome to Our Website!</h1>
                        <p className="subtitle">Please log in or sign up to access our services.</p>
                    </section>
                </div>
                <div className={`button-container ${fadeIn ? 'fade-in-button' : ''}`}>
                    <button className="buttonlp" onClick={handleGetStarted}>
                        Get Started
                    </button>
                </div>
                <section className="features">
                    <div className="text-white">
                        <img src={reading}></img>
                        <b className="text-6xl">Discover Your Next Favorite Read</b>
                        <p className="">Dive into a vast library of captivating stories from emerging and established authors alike. Whether you're in the mood for a heartwarming romance, a thrilling mystery, or a fantastical journey to distant worlds, you'll find a diverse range of genres and genres tailored to your interests.</p>
                    </div>
                    <div className="text-white">
                        <img src={reading}></img>
                        <div>
                        <b className="text-6xl">Discover Your Next Favorite Read</b>
                        <p className="">Dive into a vast library of captivating stories from emerging and established authors alike. Whether you're in the mood for a heartwarming romance, a thrilling mystery, or a fantastical journey to distant worlds, you'll find a diverse range of genres and genres tailored to your interests.</p>
                        </div>
                    </div>
                </section>
            </section>
        </div>
            
        
    );
}

export default LandingPage;