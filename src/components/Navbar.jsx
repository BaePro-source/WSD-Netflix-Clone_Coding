// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/auth';
import '../styles/Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentUser = getCurrentUser();
    const [searchQuery, setSearchQuery] = useState('');
    const [scrolled, setScrolled] = useState(false); // ✅ 스크롤 상태 추가

    // ✅ 스크롤 이벤트 리스너
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/signin');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        }
    };

    const handleSearchIconClick = () => {
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        } else {
            navigate('/search');
        }
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}> {/* ✅ scrolled 클래스 추가 */}
            <div className="navbar-container">
                <div className="navbar-left">
                    {/* ✅ 로고에 cursor: pointer 스타일 */}
                    <h1
                        className="navbar-logo"
                        onClick={() => navigate('/')}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => e.key === 'Enter' && navigate('/')}
                    >
                        JFLIX
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
                            대세 콘텐츠
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
                        <button
                            type="button"
                            className="search-button"
                            onClick={handleSearchIconClick}
                            aria-label="검색"
                        >
                            🔍
                        </button>
                    </form>

                    {currentUser ? (
                        <>
                            <span className="navbar-user">{currentUser.email}</span>
                            <button className="navbar-logout" onClick={handleLogout}>
                                로그아웃
                            </button>
                        </>
                    ) : (
                        <button
                            className="navbar-signin"
                            onClick={() => navigate('/signin')}
                        >
                            로그인
                        </button>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;