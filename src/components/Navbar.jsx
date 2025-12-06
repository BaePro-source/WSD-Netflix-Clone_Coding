// src/components/Navbar.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/auth';
import '../styles/Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const currentUser = getCurrentUser();
    const [searchQuery, setSearchQuery] = useState('');

    const handleLogout = () => {
        logout();
        navigate('/signin');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // TODO: 나중에 검색 페이지로 이동
            console.log('검색:', searchQuery);
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-left">
                    <h1 className="navbar-logo">🎬 MOVIEFLIX</h1>
                    <ul className="navbar-menu">
                        <li className="navbar-item active">홈</li>
                        <li className="navbar-item">영화</li>
                        <li className="navbar-item">내가 찜한 콘텐츠</li>
                    </ul>
                </div>

                <div className="navbar-right">
                    {/* 검색 */}
                    <form className="navbar-search" onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="영화 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        <button type="submit" className="search-button">
                            🔍
                        </button>
                    </form>

                    <span className="navbar-user">{currentUser?.email}</span>
                    <button className="navbar-logout" onClick={handleLogout}>
                        로그아웃
                    </button>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;