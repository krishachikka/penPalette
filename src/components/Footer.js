import React from 'react';

function Footer() {
    return (
        <div>
            <footer className="footer">
                <div className="footer-content">
                    <div>
                        <strong>Contact:</strong>
                        <br />
                        <br />
                    </div>
                    <div className="footer-contact">
                        <a href="yashchavan4628@gmail.com" className="footer-link text-white">yashchavan4628@gmail.com</a>
                    </div>
                    <div className="footer-contact">
                        <a href="chikkakrisha@gmail.com" className="footer-link  text-white ,">chikkakrisha@gmail.com</a>
                    </div>
                </div>
                <p>&copy; 2024 PenPalette. All rights reserved.</p>
            </footer>
        </div>
    );
}

export default Footer;