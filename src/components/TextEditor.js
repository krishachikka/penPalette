// import React, { useState, useRef } from 'react';
// import { useLocation, useNavigate } from 'react-router-dom';
// import html2canvas from 'html2canvas';
// import jsPDF from 'jspdf';
// import '../styles/TextEditor.css';

// function TextEditor() {
//     const [chapterName, setChapterName] = useState('');
//     const [description, setDescription] = useState('');
//     const [content, setContent] = useState('');
//     const [uploadedTitle, setUploadedTitle] = useState('');
//     const [uploadedDescription, setUploadedDescription] = useState('');
//     const editorRef = useRef(null);

//     const location = useLocation();
//     const history = useNavigate();

//     const coverPageURL = location.state?.coverPageURL;
//     const uploadedFileTitle = location.state?.fileTitle;
//     const uploadedFileDescription = location.state?.fileDescription;

//     const goBack = () => {
//         history('/dashboard');
//     };

//     const downloadPdf = () => {
//         if (!editorRef.current) return;

//         const pdf = new jsPDF('p', 'pt', 'a4');
//         pdf.setFontSize(12);

//         html2canvas(editorRef.current).then(canvas => {
//             const imgData = canvas.toDataURL('image/png');
//             const imgWidth = 595.28; // A4 width in pixels
//             const pageHeight = 842; // A4 height in pixels
//             const imgHeight = (canvas.height * imgWidth) / canvas.width;
//             let heightLeft = imgHeight;
//             let position = 0;

//             pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
//             heightLeft -= pageHeight;

//             while (heightLeft >= 0) {
//                 position = heightLeft - imgHeight;
//                 pdf.addPage();
//                 pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
//                 heightLeft -= pageHeight;
//             }

//             pdf.save('text_editor_content.pdf');
//         });
//     };

//     return (
//         <div className="text-editor-container">
//             <div className="section go-back">
//                 <button onClick={goBack}>Go Back</button>
//             </div>

//             <div ref={editorRef} className="section editor-section" style={{ backgroundImage: coverPageURL ? `url(${coverPageURL})` : 'none' }}>
//                 <div className="editor-content">
//                     <h1>Text Editor</h1>
//                     <input
//                         type="text"
//                         value={chapterName}
//                         placeholder="Chapter Name"
//                         onChange={(e) => setChapterName(e.target.value)}
//                     />
//                     <br />
//                     <textarea
//                         value={description}
//                         placeholder="Description"
//                         onChange={(e) => setDescription(e.target.value)}
//                     />
//                     <br />
//                     <textarea
//                         value={content}
//                         placeholder="Type your content here..."
//                         onChange={(e) => setContent(e.target.value)}
//                     />
//                 </div>
//             </div>

//             {uploadedFileTitle && (
//                 <div className="section uploaded-file-section">
//                     <h2>Uploaded File Details</h2>
//                     <p>Title: {uploadedFileTitle}</p>
//                     <p>Description: {uploadedFileDescription}</p>
//                 </div>
//             )}

//             <div className="section button-section">
//                 <button className="publish-btn" onClick={downloadPdf}>Publish</button>
//                 <div className="dropdown">
//                     <button className="dropbtn">Save</button>
//                     <div className="dropdown-content">
//                         <button>Save Draft</button>
//                         <button>Discard Changes</button>
//                     </div>
//                 </div>
//             </div>

//             <div className="section alignment-section">
//                 <button>Align Left</button>
//                 <button>Align Center</button>
//                 <button>Align Right</button>
//                 <button>Bold</button>
//                 <button>Italic</button>
//                 <button>Underline</button>
//             </div>
//         </div>
//     );
// }

// export default TextEditor;
