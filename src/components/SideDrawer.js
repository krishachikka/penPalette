// SideDrawer.js

import React from 'react';
import '../styles/SideDrawer.css'

const SideDrawer = ({ isOpen, toggle, chapters, setActiveChapterIndex }) => {
    return (
        <div className={`side-drawer ${isOpen ? 'open' : ''}`}>
            <h2>Chapters</h2>
            <ul>
                {chapters.map((chapter, index) => (
                    <li key={index} onClick={() => setActiveChapterIndex(index)}>
                        {chapter.name}
                    </li>
                ))}
            </ul>
            <button onClick={toggle}>Close Drawer</button>
        </div>
    );
};

export default SideDrawer;