// LandingPage.js
import React, { useRef, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import WAVES from 'vanta/src/vanta.waves';
import { auth } from "../../firebase"; // Import Firebase auth instance
import "../../styles/Authentication/landingpage.css"; // Import the CSS file
import logo from "../../images/logo.png";
import book from "../../images/logomeow.png";
import reading from "../../images/landing/reading.png"
import writing from "../../images/landing/storyWriting.png"
import guyChilling from "../../images/landing/chillreading.png"
import giggle from "../../images/landing/giggling man.png"
import oldie from "../../images/landing/oldwoman.png"
import kids from "../../images/landing/children.png"
import planer from "../../images/landing/planeright.png"
import planel from "../../images/landing/planeleft.png"
import 'aos/dist/aos.css';

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
        
        <div className={`bg ${fadeIn ? 'fade-in' : ''}`} ref={vantaRef} style={{height:"100%"}}>
            <section className="scrollableContent">
            <img src={logo} alt="Logo" className={`logo ${fadeIn ? 'fade-in-logo' : ''}`} />

                <section style={{height:'100vh'}}>
                        <section>
                        <div className={`block ${fadeIn ? 'fade-in-block' : ''}`}>
                            <img src={book} alt="Book" className="book" />
                            <section>
                                <h1 className="titlel">Welcome to Our Website!</h1>
                                <p className="subtitle">Because Your Cat Doesn’t Want to Hear Your Story (But We Do!)</p>
                            </section>
                        </div>
                        <div className={`button-container ${fadeIn ? 'fade-in-button' : ''}`}>
                            <button className="buttonlp" onClick={handleGetStarted}>
                                Get Started
                            </button>
                        </div>
                        <div style={{color:"white", padding:"10px", width:"50px", border:"2px solid white",borderRadius:"25px", fontSize:"20px"}}>
                            <ion-icon name="arrow-down-outline"></ion-icon>
                        </div>
                    </section>
                </section>
                
                <section className="features">
                    <section>
                        <div className="featureBox text-white m-6 p-4 "
                         data-aos="zoom-in-left"
                         data-aos-anchor-placement="center-center"
                        >
                            <img src={giggle} alt="Reading" className="ftImg"/>
                            <div>
                                <h2 className="headline text-6xl">Discover Your Next Favorite Read</h2>
                                <p>Dive into a vast library of captivating stories from emerging and established authors alike. Whether you're in the mood for a heartwarming romance, a thrilling mystery, or a fantastical journey to distant worlds, you'll find a diverse range of genres and genres tailored to your interests.</p>
                            </div>
                        </div>
                        <img src={oldie} alt="" style={{height:"17%", position:"absolute", top:"1000px"}}
                            data-aos="fade"
                        ></img>
                        <img src={planer} alt="" style={{position:"absolute", right:"20px", height:"4%"}}
                         data-aos="fade-up-left"
                         data-aos-easing="ease-out-cubic"
                         data-aos-duration="2000"
                        ></img>
                        <div className="featureBox2 text-white m-6 p-4 "
                            data-aos="zoom-in-right"
                            data-aos-anchor-placement="top-center"
                        >
                            <div>
                                <h2 className="headline text-6xl">Unleash Your Inner Author</h2>
                                <p>Bring your imagination to life with our easy-to-use writing tools. Craft your narrative, build your characters, and publish your stories for the world to read. Whether you’re a seasoned writer or just starting out, <b>PenPalette</b> is your canvas.</p>
                            </div>
                            <img src={writing} alt="Reading" className="ftImg"/>
                        </div>
                        <div className="featureBox text-white m-6 p-4 "
                            data-aos="zoom-in-left"
                            data-aos-anchor-placement="top-center"
                        >
                            <img src={guyChilling} alt="Reading" className="ftImg"/>
                            <div>
                                <h2 className="headline text-6xl">Read Anywhere, Anytime <p>Even While Waiting for Your Coffee!</p></h2>
                                <p>Enjoy your favorite stories on the go. You can read from your laptop, tablet, or computer, whether you’re at home or on the move.  Keep the adventure going, no matter where life takes you.</p>
                            </div>
                        </div>
                        <img src={planel} alt="" style={{position:"absolute", height:"4%", margin:"10px"}}
                         data-aos="fade-up-right"
                         data-aos-easing="ease-out-cubic"
                         data-aos-duration="2000"
                         data-aos-mirror="true"
                        ></img>
                        <div className="featureBox2 text-white m-6 p-4 "
                            data-aos="zoom-in-right"
                            data-aos-anchor-placement="top-center"
                        >
                            <div>
                                <h2 className="headline text-6xl">Hop into the Story Circle</h2>
                                <p>Meet fellow readers and writers! Share your ideas, drop comments, and be part of a lively community that cherishes creativity and storytelling.</p>
                            </div>
                            <img src={reading} alt="Reading" className="ftImg"/>
                        </div>
                        <img src={kids} alt="" style={{height:"10%",position:"absolute", right:"0", bottom:"350px"}}
                            data-aos="fade"
                        ></img>
                    </section>
                </section>
                <footer className="footer">
                 <ion-icon name="mail-open-outline"></ion-icon>
                 <ion-icon name="mail-open-outline"></ion-icon>
                </footer>
            </section>
        </div>
    );
}

export default LandingPage;