import React from 'react';
import '../../styles/Text_Editor/SideDrawer.css';

const SideDrawer = ({ isOpen, toggle, chapters, navigateToChapter }) => {
    const totalChapters = chapters ? chapters.length : 0;

    return (
        <div className={`side-drawer ${isOpen ? 'open' : ''}`}>
            <h2>Chapters ({totalChapters})</h2>
            <ul>
                {chapters && chapters.length > 0 ? (
                    chapters.map((chapter, index) => (
                        <li
                            key={index}
                            onClick={() => navigateToChapter(index)}
                        >
                            {index + 1}. {chapter.name}
                        </li>
                    ))
                ) : (
                    <li>No chapters available</li>
                )}
            </ul>
            <button className="drawerClosebtn button" onClick={toggle}>Close Drawer</button>
        </div>
    );
};

export default SideDrawer;