import React, { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { motion } from 'framer-motion';
import JoditEditor from 'jodit-react';
import { useAuth } from '../../contexts/AuthContexts';
import { storage, db } from '../../firebase';
import '../../styles/Text_Editor/TextEditor.css';
import SideDrawer from './SideDrawer';

function TextEditor() {
    const { currentUser } = useAuth();
    const [chapterName, setChapterName] = useState('');
    const [content, setContent] = useState('');
    const [chapters, setChapters] = useState([]);
    const [activeChapterIndex, setActiveChapterIndex] = useState(null);
    const [editingIndex, setEditingIndex] = useState(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const editorRef = useRef(null);
    const [mode, setMode] = useState('light');
    const [menuOpen, setMenuOpen] = useState(false);

    const [bookDetails, setBookDetails] = useState({
        title: '',
        description: '',
        coverPageURL: '',
        email: 'Not logged in',
    });
    const [isExistingBook, setIsExistingBook] = useState(false);

    const { fileId } = useParams(); // Get fileId from URL
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchFileData = async () => {
            if (fileId) {
                setIsExistingBook(true);
                try {
                    const fileSnapshot = await db.ref(`files/${fileId}`).once('value');
                    const fileData = fileSnapshot.val();
                    if (fileData) {
                        setChapters(fileData.chapters || []);
                        setBookDetails({
                            title: fileData.title,
                            description: fileData.description,
                            coverPageURL: fileData.coverPageURL,
                            email: fileData.uploaderEmail || 'Not logged in',
                        });
                    }
                } catch (error) {
                    console.error("Error fetching file data:", error);
                }
            } else {
                setBookDetails({
                    title: location.state?.fileTitle || '',
                    description: location.state?.fileDescription || '',
                    coverPageURL: location.state?.coverPageURL || '',
                    email: currentUser ? currentUser.email : 'Not logged in',
                });
            }
        };

        fetchFileData();
    }, [fileId, location.state, currentUser]);

    const toggleDrawer = () => {
        setIsDrawerOpen(!isDrawerOpen);
    };

    const toggleMenu = () => {
        setMenuOpen(!menuOpen);
        console.log('Menu toggled:', !menuOpen);
    };

    const goBack = () => {
        navigate('/dashboard');
    };

    const downloadPdf = async () => {
        if (!bookDetails.title) {
            alert("File title is missing.");
            return;
        }

        if (chapters.length === 0) {
            alert("No chapters to include in the PDF.");
            return;
        }

        const pdf = new jsPDF('p', 'pt', 'a4');
        pdf.setFontSize(12);

        try {
            // Upload cover image to Firebase Storage if it's not already uploaded
            if (!bookDetails.coverPageURL.startsWith('https://firebasestorage.googleapis.com')) {
                const storageRef = storage.ref();
                const imagesRef = storageRef.child(`cover_images/${bookDetails.title}-cover`);

                // Convert cover image URL to blob
                const response = await fetch(bookDetails.coverPageURL);
                const blob = await response.blob();

                // Upload blob to Firebase Storage
                const snapshot = await imagesRef.put(blob);
                bookDetails.coverPageURL = await snapshot.ref.getDownloadURL();
            }

            // Generate PDF with chapters
            const pdfPromises = chapters.map((chapter, index) => {
                return new Promise((resolve, reject) => {
                    const chapterElement = document.getElementById(`pdf-chapter-${index}`);
                    html2canvas(chapterElement, { scale: 2 }).then(canvas => {
                        const imgData = canvas.toDataURL('image/png');
                        const imgWidth = 595.28;
                        const pageHeight = 842;
                        const imgHeight = (canvas.height * imgWidth) / canvas.width;

                        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, pageHeight);

                        if (index !== chapters.length - 1) {
                            pdf.addPage();
                        }
                        resolve();
                    }).catch(error => reject(error));
                });
            });

            await Promise.all(pdfPromises);

            const fileName = `${bookDetails.title}.pdf`;
            pdf.save(fileName);

            // Remove the existing book from the database if it exists
            if (fileId) {
                await db.ref(`files/${fileId}`).remove();
            }

            // Create new book with updated coverPageURL
            const newFileRef = db.ref('files').push();
            const newFileId = newFileRef.key; // Generate a new file ID

            await newFileRef.set({
                title: bookDetails.title,
                description: bookDetails.description,
                coverPageURL: bookDetails.coverPageURL,
                pdfURL: '', // No PDF URL storage in this case
                uploaderEmail: currentUser ? currentUser.email : 'abc@gmail.com',
                createdBy: currentUser ? currentUser.uid : null,
                createdAt: new Date().toISOString(),
                views: 0,
                chapters: chapters
            });

            alert("Book created and published successfully!");
            navigate(`/book/${newFileId}`);
        } catch (error) {
            console.error("Error publishing file:", error);
            alert(`An error occurred while publishing the file: ${error.message}`);
        }
    };


    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        const storageRef = storage.ref();
        const imagesRef = storageRef.child(`images/${file.name}`);

        try {
            // Upload file to Firebase Storage
            const snapshot = await imagesRef.put(file);
            const imageUrl = await snapshot.ref.getDownloadURL();

            // Update content with the image URL
            setContent((prevContent) => `${prevContent}<img src="${imageUrl}" alt="Uploaded Image" class="uploaded-image" />`);
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Failed to upload image. Please try again.");
        }
    };


    const handleTextFileUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const textContent = e.target.result;
            setContent((prevContent) => `${prevContent}<pre>${textContent}</pre>`);
        };
        reader.readAsText(file);
    };

    const addChapter = async () => {
        if (!chapterName.trim() || !content.trim()) {
            alert("Chapter name and content cannot be empty");
            return;
        }

        const newChapter = {
            name: chapterName,
            content: content
        };

        try {
            if (editingIndex !== null) {
                const updatedChapters = [...chapters];
                updatedChapters[editingIndex] = newChapter;
                setChapters(updatedChapters);
                setEditingIndex(null);
            } else {
                setChapters([...chapters, newChapter]);
            }

            setChapterName('');
            setContent('');

            if (fileId) {
                // Update existing book chapters
                await db.ref(`files/${fileId}/chapters`).set(chapters);
                alert("Chapter added/updated successfully!");
            }
        } catch (error) {
            console.error("Error adding/updating chapter:", error);
            alert("An error occurred while adding/updating the chapter. Please try again.");
        }
    };

    const editChapter = (index) => {
        setChapterName(chapters[index].name);
        setContent(chapters[index].content);
        setEditingIndex(index);
    };

    const saveStory = async () => {
        try {
            if (chapters.length === 0) {
                alert("No chapters to save");
                return;
            }

            const storyRef = await db.ref('MyStories').push();
            const storyId = storyRef.key;

            await storyRef.set({
                title: bookDetails.title,
                description: bookDetails.description,
                chapters: chapters,
                createdAt: new Date().toISOString(),
                createdBy: currentUser ? currentUser.uid : null
            });

            alert("Story saved successfully!");
        } catch (error) {
            console.error("Error saving story:", error);
            alert("An error occurred while saving the story. Please try again.");
        }
    };

    const editorConfig = {
        readonly: false,
        toolbarAdaptive: false,
        buttons: [
            'bold', 'italic', 'underline', '|',
            'alignleft', 'aligncenter', 'alignright', '|',
            'ul', 'ol', '|',
            'brush', '|',
            'undo', 'redo'
        ],
        height: 600
    };

    useEffect(() => {
        if (activeChapterIndex !== null && editorRef.current) {
            const chapterElement = document.getElementById(`chapter-${activeChapterIndex}`);
            if (chapterElement) {
                chapterElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, [activeChapterIndex]);

    const toggleMode = () => {
        setMode(mode === 'light' ? 'dark' : 'light');
    };

    const transition = { duration: 0.5 };
    const isPublishDisabled = !chapters.length || !bookDetails.title;

    const navigateToChapter = (index) => {
        setActiveChapterIndex(index);
        toggleDrawer();
    };

    return (
        <>
            <header>
            <div className="button-section textEditor">
                <SideDrawer isOpen={isDrawerOpen} toggle={toggleDrawer} chapters={chapters} navigateToChapter={navigateToChapter} />
                <button className="goback" onClick={goBack}>
                        <ion-icon name="arrow-back" size="large"></ion-icon>
                </button>
                <div className='textEditor-header'>
                    
                    <button className="save-btn" onClick={toggleDrawer}>Chapters</button>
                    <button className="add-btn" onClick={addChapter}>
                        {editingIndex !== null ? 'Update' : 'Add'} <ion-icon name="share"></ion-icon>
                    </button>
                    <button className="publish-button" onClick={downloadPdf} disabled={isPublishDisabled}>
                        Publish <ion-icon name="create"></ion-icon>
                    </button>
                </div>
                <button className="chp-button" onClick={toggleDrawer}>
                    <ion-icon name="list-outline" size="large"></ion-icon>
                </button>
                <button className="menu-button" onClick={toggleMenu}>
                    <ion-icon name="create" size="large"></ion-icon>
                </button>
                <button className={`themebtn ${mode === 'dark' ? 'dark-mode' : 'light-mode'}`} onClick={toggleMode}>
                    <div className='circle'><ion-icon name="bulb-outline" size="large"></ion-icon></div>
                </button>
            </div>
            <div className={`textEditor-buttons-mobile ${menuOpen ? 'open' : ''}`}>
                <button className="add-btn" onClick={addChapter}>
                    {editingIndex !== null ? 'Update' : 'Add'} <ion-icon name="share"></ion-icon>
                </button>
                <button className="publish-button" onClick={downloadPdf} disabled={isPublishDisabled}>
                    Publish <ion-icon name="create"></ion-icon>
                </button>
            </div>
            </header>
            <motion.div
                className={`text-editor-container ${mode === 'dark' ? 'dark-mode' : 'light-mode'}`}
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={transition}
                style={{ transition: 'background-color 0.5s ease, color 0.5s ease' }}
            >

                <div className="section title-section" style={{ backgroundImage: `url(${bookDetails.coverPageURL})` }}>
                    {bookDetails.coverPageURL && (
                        <div className="cover-page">
                            <img src={bookDetails.coverPageURL} alt="Cover Page" />
                        </div>
                    )}
                    <div className="title-description-container">
                        <h1 className="titlek">{bookDetails.title}</h1>
                        <p className="description">{bookDetails.description}</p>
                    </div>
                </div>

                <div className="section email-section">
                    <p>Email: {bookDetails.email}</p>
                </div>

                {chapters.map((chapter, index) => (
                    <div key={index} id={`chapter-${index}`} className={`section editor-section ${index === activeChapterIndex ? 'active-chapter' : ''}`}>
                        <h2>{chapter.name}</h2>
                        <div dangerouslySetInnerHTML={{ __html: chapter.content }} />
                        <button className="edit-btn" onClick={() => editChapter(index)}>Edit</button>
                    </div>
                ))}

                {/* <div className="hidden-pdf-container">
                    {chapters.map((chapter, index) => (
                        <div key={index} id={`pdf-chapter-${index}`} className="pdf-chapter">
                            <h2>{chapter.name}</h2>
                            <div dangerouslySetInnerHTML={{ __html: chapter.content }} />
                        </div>
                    ))}
                </div> */}

                <div className="section editor-section">
                    <input
                        type="text"
                        value={chapterName}
                        placeholder="Chapter Name"
                        onChange={(e) => setChapterName(e.target.value)}
                        className="input-field"
                    />
                    <br />
                    <JoditEditor
                        value={content}
                        config={editorConfig}
                        tabIndex={1}
                        onBlur={(newContent) => setContent(newContent)}
                        className="editor"
                        ref={editorRef}
                    />
                    <div className="textEditor-Bottom-btns" style={{ display: 'flex', gap: '10px' }}>
                        <label
                            htmlFor="image-upload"
                            className="save-btn"
                            style={{
                                display: 'inline-block',
                                padding: '10px 20px',
                                cursor: 'pointer',
                                textAlign: 'center',
                            }}
                        >
                            Upload Image
                        </label>
                        <input

                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                        />

                        <label
                            className="save-btn"
                            htmlFor="text-upload"
                            style={{
                                display: 'inline-block',
                                padding: '10px 20px',
                                cursor: 'pointer',
                                textAlign: 'center',
                            }}
                        >
                            Upload Text File
                        </label>
                        <input
                            id="text-upload"
                            type="file"
                            accept=".txt"
                            onChange={handleTextFileUpload}
                            style={{ display: 'none' }}
                        />
                    </div>

                </div>
            </motion.div>
        </>
    );
}

export default TextEditor;