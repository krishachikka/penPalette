// LoadingCatAnimation.js
import React from 'react';
import penPaletteLoader from '../images/penPaletteLoader.gif';
import "../styles/LoadingCatAnimation.css"

function LoadingCatAnimation() {
    return (
        <div className='loader'>
            <img src={penPaletteLoader} alt="Loading..." />
        </div>
    );
}

export default LoadingCatAnimation;