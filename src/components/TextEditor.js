import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import JoditEditor from 'jodit-react';
import { storage, db } from '../firebase';
import '../styles/TextEditor.css';

function TextEditor({ currentUser }) {
    const [chapterName, setChapterName] = useState('');
    const [content, setContent] = useState('');
    const [chapters, setChapters] = useState([]);
    const [editingIndex, setEditingIndex] = useState(null);
    const editorRef = useRef(null);

    const location = useLocation();
    const navigate = useNavigate();

    const uploadedFileTitle = location.state?.fileTitle;
    const uploadedFileDescription = location.state?.fileDescription;
    const coverPageURL = location.state?.coverPageURL;

    const goBack = () => {
        navigate('/dashboard');
    };

    async function downloadPdf() {
        const pdf = new jsPDF('p', 'pt', 'a4');
        pdf.setFontSize(12);

        const uploaderEmail = currentUser ? currentUser.email : 'abc@gmail.com'; // Use default email if currentUser is not available

        const pdfPromises = chapters.map((chapter, index) => {
            return new Promise((resolve, reject) => {
                const chapterContent = chapter.content;

                html2canvas(document.getElementById(`chapter-${index}`)).then(canvas => {
                    const imgData = canvas.toDataURL('image/png');
                    const imgWidth = 595.28;
                    const pageHeight = 842;
                    const imgHeight = (canvas.height * imgWidth) / canvas.width;
                    let heightLeft = imgHeight;
                    let position = 0;

                    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                    heightLeft -= pageHeight;

                    while (heightLeft >= 0) {
                        position = heightLeft - imgHeight;
                        pdf.addPage();
                        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                        heightLeft -= pageHeight;
                    }

                    if (index !== chapters.length - 1) {
                        pdf.addPage();
                    } else {
                        const pdfBlob = pdf.output('blob');
                        const fileName = `${uploadedFileTitle}.pdf`; // Use title name for the PDF file
                        const pdfURL = URL.createObjectURL(pdfBlob);
                        const link = document.createElement('a');
                        link.href = pdfURL;
                        link.setAttribute('download', fileName);
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        resolve();
                    }
                });
            });
        });

        try {
            await Promise.all(pdfPromises);

            // Redirect to the dashboard after the file is published
            navigate('/dashboard');
        } catch (error) {
            console.error("Error saving PDF file:", error);
        }
    }

    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
            const imgBase64 = e.target.result;
            setContent((prevContent) => `${prevContent}<img src="${imgBase64}" alt="Uploaded Image" />`);
        };
        reader.readAsDataURL(file);
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

    const addChapter = () => {
        const newChapter = {
            name: chapterName,
            content: content
        };
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
    };

    const editChapter = (index) => {
        setChapterName(chapters[index].name);
        setContent(chapters[index].content);
        setEditingIndex(index);
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

    return (
        <div className="text-editor-container">
            <div className="button-section">
                <button className="go-back-button" onClick={goBack}>Go Back</button>
                <button className="add-btn" onClick={addChapter}>{editingIndex !== null ? 'Update' : 'Add'}</button>
                <button className="publish-button" onClick={downloadPdf}>Publish</button>
            </div>

            <div className="section title-section">
                {coverPageURL && (
                    <div className="cover-page">
                        <img src={coverPageURL} alt="Cover Page" style={{ height: 100 }} />
                    </div>
                )}
                <div className="title-description-container">
                    <h1 className="title">{uploadedFileTitle}</h1>
                    <p className="description">{uploadedFileDescription}</p>
                </div>
            </div>

            {chapters.map((chapter, index) => (
                <div key={index} id={`chapter-${index}`} className="section editor-section">
                    <h2>{chapter.name}</h2>
                    <div dangerouslySetInnerHTML={{ __html: chapter.content }} />
                    <button className="edit-btn" onClick={() => editChapter(index)}>Edit</button>
                </div>
            ))}

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
                <div className="upload-section">
                    <input type="file" accept="image/*" onChange={handleImageUpload} />
                    <input type="file" accept=".txt" onChange={handleTextFileUpload} />
                </div>
            </div>
        </div>
    );
}

export default TextEditor;