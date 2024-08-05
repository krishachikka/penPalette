import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import SideDrawer from './SideDrawer'; // Import the SideDrawer component
import "../../styles/Text_Editor/BookPreview.css";
import { motion } from 'framer-motion';
import logomeow from "../../images/logomeow.png";

function BookPreview() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bookData, setBookData] = useState(null);
    const [activeChapterIndex, setActiveChapterIndex] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const contentRef = useRef(null);
    const [mode, setMode] = useState('light');

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

    if (!bookData) {
        return <div>Loading...</div>;
    }

    const toggleMode = () => {
        setMode(mode === 'light' ? 'dark' : 'light');
    };

    const goBack = () => {
        navigate('/dashboard');
    };

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

            <div className="book-preview">
                <div className="content-section" ref={contentRef}>
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
                        chapters.map((chapter, index) => (
                            <section
                                key={index}
                                id={`chapter-${index}`}
                                className={`chpContent ${index === activeChapterIndex ? 'active-chapter' : ''}`}
                            >
                                <h2>{chapter.name}</h2>
                                <div dangerouslySetInnerHTML={{ __html: chapter.content }} />
                            </section>
                        ))
                    ) : (
                        <p>No chapters available</p>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

export default BookPreview;