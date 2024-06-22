import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../firebase';

function BookPreview() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bookData, setBookData] = useState(null);

    useEffect(() => {
        const fetchBookData = async () => {
            const bookRef = db.ref(`files/${id}`);
            const snapshot = await bookRef.once('value');
            setBookData(snapshot.val());
        };

        fetchBookData();
    }, [id]);

    if (!bookData) {
        return <div>Loading...</div>;
    }

    return (
        <div className="book-preview">
            <h1>{bookData.title}</h1>
            {bookData.coverPageURL && (
                <img src={bookData.coverPageURL} alt="Cover Page" style={{ height: 100 }} />
            )}
            <p>{bookData.description}</p>
            {bookData.chapters && bookData.chapters.length > 0 ? (
                bookData.chapters.map((chapter, index) => (
                    <div key={index}>
                        <h2>{chapter.name}</h2>
                        <div dangerouslySetInnerHTML={{ __html: chapter.content }} />
                    </div>
                ))
            ) : (
                <p>No chapters available</p>
            )}
        </div>
    );
}

export default BookPreview;