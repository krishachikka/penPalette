import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContexts';
import { useNavigate } from 'react-router-dom';
import { db } from '../../firebase'; // Import your Firebase instance
import { ref, get } from 'firebase/database'; // Adjust for Realtime Database
import '../../styles/modal.css';

export default function Profile() {
    const [error, setError] = useState('');
    const [username, setUsername] = useState(''); // State to store username
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        async function fetchUserDetails() {
            if (currentUser) {
                try {
                    const userRef = ref(db, 'users/' + currentUser.uid);
                    const snapshot = await get(userRef);
                    if (snapshot.exists()) {
                        setUsername(snapshot.val().username);
                    } else {
                        console.error('User document does not exist');
                    }
                } catch (error) {
                    console.error('Error fetching user details:', error);
                }
            }
        }

        fetchUserDetails();
    }, [currentUser]);

    const handleLogout = async () => {
        setError('');

        try {
            await logout();
            navigate('/login');
        } catch {
            setError('Failed to log out');
        }
    };

    return (
        <>
            <h2 className="text-center" style={{ color: 'white' }}>
                Profile
            </h2>
            <div className="card-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <p>
                    <strong>Username:</strong> {username}
                </p>
                <p>
                    <strong>Email:</strong> {currentUser?.email}
                </p>
                <div className="w-100 text-center mt-2">
                    <button className="button" onClick={handleLogout}>
                        Log Out
                    </button>
                </div>
            </div>
        </>
    );
}