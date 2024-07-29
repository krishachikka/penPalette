import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../firebase';
import SideDrawer from './SideDrawer'; // Assuming you have a SideDrawer component similar to the one in TextEditor
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
            contentRef.current.scrollTo({
                top: contentRef.current.childNodes[index].offsetTop,
                behavior: 'smooth'
            });
        }
        toggleDrawer(); // Close the drawer after navigating to the chapter
    };

    if (!bookData) {
        return <div>Loading...</div>;
    }

    const toggleMode = () => {
        setMode(mode === 'light' ? 'dark' : 'light');
    };

    const transition = { duration: 0.5 };
    // const isPublishDisabled = !chapters.length || !bookDetails.title;

    return (
        <motion.div
            className={`text-editor-container ${mode === 'dark' ? 'dark-mode' : 'light-mode'}`}
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
            style={{ transition: 'background-color 0.5s ease, color 0.5s ease' }}
        >
            <div className="button-section">
                <button className="Chplist" onClick={toggleDrawer}><ion-icon name="list" size="large"></ion-icon></button>
                <img src={logomeow} alt="Meow" id="logoMeow"></img>
                <button className={`themebtn ${mode === 'dark' ? 'dark-mode' : 'light-mode'}`} onClick={toggleMode}>
                    <div className='circle'><ion-icon name="bulb-outline" size="large"></ion-icon></div>
                </button>
                <SideDrawer isOpen={isDrawerOpen} toggle={toggleDrawer} chapters={bookData.chapters} navigateToChapter={navigateToChapter} />
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
                    {bookData.chapters && bookData.chapters.length > 0 ? (
                        bookData.chapters.map((chapter, index) => (
                            <section className='chpContent'>
                                <div key={index} id={`chapter-${index}`} className= {index === activeChapterIndex ? 'active-chapter' : ''}>
                                    <h2>{chapter.name}</h2>
                                    <div dangerouslySetInnerHTML={{ __html: chapter.content }} />
                                </div>
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