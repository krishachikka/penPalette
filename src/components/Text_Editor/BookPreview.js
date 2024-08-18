import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import SideDrawer from './SideDrawer';
import "../../styles/Text_Editor/BookPreview.css";
import { motion } from 'framer-motion';
import logomeow from "../../images/logomeow.png";

function BookPreview() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bookData, setBookData] = useState(null);
    const [activeChapterIndex, setActiveChapterIndex] = useState(0);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const contentRef = useRef(null);
    const [mode, setMode] = useState('light');
    const [fontSize, setFontSize] = useState(16); // default font size
    const [isFontControlsOpen, setIsFontControlsOpen] = useState(false); // font controls

    useEffect(() => {
        const fetchBookData = async () => {
            const bookRef = db.ref(`files/${id}`);
            const snapshot = await bookRef.once('value');
            setBookData(snapshot.val());
        };

        fetchBookData();
    }, [id]);

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    const toggleFontControls = () => {
        setIsFontControlsOpen(!isFontControlsOpen);
    };

    const navigateToChapter = (index) => {
        setActiveChapterIndex(index);
        if (contentRef.current) {
            const chapterElement = contentRef.current.querySelector(`#chapter-${index}`);
            if (chapterElement) {
                chapterElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }
        toggleDrawer(); // Close the drawer after navigating to the chapter
    };

    const showPreviousChapter = () => {
        setActiveChapterIndex(prevIndex => Math.max(prevIndex - 1, 0));
    };

    const showNextChapter = () => {
        setActiveChapterIndex(prevIndex => Math.min(prevIndex + 1, (bookData.chapters || []).length - 1));
    };

    const increaseFontSize = () => {
        setFontSize(prevSize => Math.min(prevSize + 2, 32)); // Max font size limit
    };

    const decreaseFontSize = () => {
        setFontSize(prevSize => Math.max(prevSize - 2, 12)); // Min font size limit
    };

    const toggleMode = () => {
        setMode(mode === 'light' ? 'dark' : 'light');
    };

    const goBack = () => {
        navigate('/dashboard');
    };

    if (!bookData) {
        return <div>Loading...</div>;
    }

    const transition = { duration: 0.5 };

    const chapters = bookData.chapters || [];
    const totalChapters = chapters.length;

    return (
        <motion.div
            className={`text-editor-container ${mode === 'dark' ? 'dark-mode' : 'light-mode'}`}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
            style={{ transition: 'background-color 0.5s ease, color 0.5s ease' }}
        >
            <SideDrawer
                isOpen={isDrawerOpen}
                toggle={toggleDrawer}
                chapters={chapters}
                navigateToChapter={navigateToChapter}
            />

            {/* Slider Arrow for Font Controls */}
            <div
                className={`slider-arrow ${isFontControlsOpen ? 'open' : ''}`}
                onClick={toggleFontControls}
            >
                <ion-icon name={isFontControlsOpen ? "chevron-forward-outline" : "chevron-back-outline"}></ion-icon>
            </div>

            {/* Font Controls */}
            <div className={`font-controls ${isFontControlsOpen ? 'open' : ''}`}>
                <button className="font-size-btn" onClick={decreaseFontSize}>A-</button>
                <span className="font-size-display">{fontSize}px</span>
                <button className="font-size-btn" onClick={increaseFontSize}>A+</button>
            </div>

            <div className="book-preview">
                <div className="content-section" ref={contentRef} style={{ fontSize: `${fontSize}px` }}>
                    <section className='title-section' style={{ backgroundImage: `url(${bookData.coverPageURL})` }}>
                        {bookData.coverPageURL && (
                            <div className='cover-page'>
                                <img src={bookData.coverPageURL} alt="Cover Page" />
                            </div>
                        )}
                        <div className='title-details'>
                            <h1>{bookData.title}</h1>
                            <p>{bookData.description}</p>
                        </div>
                    </section>
                    {chapters.length > 0 ? (
                        <section
                            id={`chapter-${activeChapterIndex}`}
                            className={`chpContent ${activeChapterIndex === activeChapterIndex ? 'active-chapter' : ''}`}
                        >
                            <h2>{chapters[activeChapterIndex].name}</h2>
                            <div dangerouslySetInnerHTML={{ __html: chapters[activeChapterIndex].content }} />
                        </section>
                    ) : (
                        <p>No chapters available</p>
                    )}
                </div>

                <div className="button-section bookPreview">
                    <div className='imp-buttons'>
                        <button className="goback" onClick={goBack}>
                            <ion-icon name="arrow-back" size="large"></ion-icon>
                        </button>
                        <button className="Chplist" onClick={toggleDrawer}>
                            <ion-icon name="list" size="large"></ion-icon>
                        </button>
                    </div>
                    <img src={logomeow} alt="Meow" id="logoMeow" />
                    <button className={`themebtn ${mode === 'dark' ? 'dark-mode' : 'light-mode'}`} onClick={toggleMode}>
                        <div className='circle'>
                            <ion-icon name="bulb-outline" size="large"></ion-icon>
                        </div>
                    </button>
                </div>
                <div className="navigation-buttons">
                    <button
                        className="prev-btn"
                        onClick={showPreviousChapter}
                        disabled={activeChapterIndex === 0}
                    >
                        Previous
                    </button>
                    <button
                        className="next-btn"
                        onClick={showNextChapter}
                        disabled={activeChapterIndex === totalChapters - 1}
                    >
                        Next
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

export default BookPreview;
