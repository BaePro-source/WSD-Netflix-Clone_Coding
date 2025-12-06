// src/pages/Home.jsx
import React from 'react';
import Navbar from '../components/Navbar';
import '../styles/Home.css';

function Home() {
    return (
        <div className="home">
            <Navbar />
            <div className="home-content">
                <h1>🎬 영화 목록 페이지</h1>
                <p>곧 영화들이 여기에 표시됩니다!</p>
            </div>
        </div>
    );
}

export default Home;