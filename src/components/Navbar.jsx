// src/components/Navbar.jsx
// 📌 과제용 네비게이션 바 컴포넌트
// 📱 모바일/PC 반응형 UI를 고려하여 구현됨
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { logout, getCurrentUser } from '../services/auth';
import '../styles/Navbar.css';

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();
    const currentUser = getCurrentUser();
    // 🔐 현재 로그인한 사용자 정보 (과제: 인증 상태 분기 처리)

    const [searchQuery, setSearchQuery] = useState('');
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    // 📱 mobileMenuOpen: 모바일 햄버거 메뉴 상태 관리용 state

    // 🖱 스크롤 위치에 따라 네비게이션 스타일 변경
    // 과제 포인트: UX 향상을 위한 동적 UI 처리
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        // 🔓 로그아웃 처리 후 로그인 페이지로 이동
        logout();
        navigate('/signin');
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // 🔍 검색 기능 구현 (라우터 기반 페이지 이동)
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
            setMobileMenuOpen(false); // 모바일 UX 고려
        }
    };

    const handleSearchIconClick = () => {
        // 🔍 검색 아이콘 클릭 시 동일한 검색 로직 수행
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setSearchQuery('');
        } else {
            navigate('/search');
        }
        setMobileMenuOpen(false);
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
            <div className="navbar-container">
                <div className="navbar-left">
                    <h1
                        className="navbar-logo"
                        onClick={() => navigate('/')}
                        role="button"
                        tabIndex={0}
                        onKeyPress={(e) => e.key === 'Enter' && navigate('/')}
                    >
                        JFLIX
                    </h1>
                    {/* ✅ 모바일 전용 배지 (과제 확인용) */}
                    <span className="mobile-badge">MOBILE</span>

                    {/* 💻 PC 전용 네비게이션 메뉴 */}
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
                    {/* 📱 모바일 전용 햄버거 버튼 */}
                    {/* 과제 포인트: 반응형 UI 대응 */}
                    <button
                        className="navbar-hamburger"
                        onClick={() => setMobileMenuOpen(prev => !prev)}
                        aria-label="메뉴 열기"
                    >
                        ☰
                    </button>

                    {/* 💻 PC 전용 검색창 */}
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

                    {/* 🔐 로그인 상태에 따른 UI 분기 */}
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

            {/* 📱 모바일 전용 메뉴 영역 */}
            {mobileMenuOpen && (
                <div className="mobile-menu">
                    <form className="mobile-search" onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="영화 검색..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit">🔍</button>
                    </form>

                    <button
                        onClick={() => {
                            navigate('/');
                            setMobileMenuOpen(false);
                        }}
                    >
                        🏠 홈
                    </button>

                    <button
                        onClick={() => {
                            navigate('/popular');
                            setMobileMenuOpen(false);
                        }}
                    >
                        🔥 대세 콘텐츠
                    </button>

                    <button
                        onClick={() => {
                            navigate('/wishlist');
                            setMobileMenuOpen(false);
                        }}
                    >
                        ❤️ 내가 찜한 콘텐츠
                    </button>

                    {/* ✅ 로그아웃 버튼 추가 */}
                    {currentUser && (
                        <button
                            onClick={() => {
                                handleLogout();
                                setMobileMenuOpen(false);
                            }}
                            style={{
                                background: '#e50914',
                                marginTop: '8px'
                            }}
                        >
                            🚪 로그아웃
                        </button>
                    )}
                </div>
            )}
        </nav>
    );
}

export default Navbar;
