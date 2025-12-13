// src/components/Navbar.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/auth';
import '../styles/Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentUser = getCurrentUser();
    const [searchQuery, setSearchQuery] = useState('');

    const handleLogout = () => {
        logout();
        navigate('/signin');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // /search 페이지로 이동하면서 검색어를 쿼리 파라미터로 전달
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery(''); // 검색 후 입력창 초기화
        }
    };

    // ✅ 돋보기 버튼 클릭 핸들러 추가
    const handleSearchIconClick = () => {
        if (searchQuery.trim()) {
            // 검색어가 있으면 검색 실행
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        } else {
            // 검색어가 없으면 Search 페이지로 이동
            navigate('/search');
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <div className="navbar-left">
                    <h1 className="navbar-logo" onClick={() => navigate('/')}>
                        🎬 MOVIEFLIX
                    </h1>
                    <ul className="navbar-menu">
                        <li
                            className={`navbar-item ${location.pathname === '/' ? 'active' : ''}`}
                            onClick={() => navigate('/')}
                        >
                            홈
                        </li>
                        <li
                            className={`navbar-item ${location.pathname === '/popular' ? 'active' : ''}`}
                            onClick={() => navigate('/popular')}
                        >
                            영화
                        </li>
                        <li
                            className={`navbar-item ${location.pathname === '/wishlist' ? 'active' : ''}`}
                            onClick={() => navigate('/wishlist')}
                        >
                            내가 찜한 콘텐츠
                        </li>
                    </ul>
                </div>

                <div className="navbar-right">
                    <form className="navbar-search" onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="영화 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                        {/* ✅ type을 button으로 변경하고 onClick 추가 */}
                        <button
                            type="button"
                            className="search-button"
                            onClick={handleSearchIconClick}
                        >
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