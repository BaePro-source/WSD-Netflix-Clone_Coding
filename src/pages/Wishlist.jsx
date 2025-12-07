// src/pages/Wishlist.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getWishlist, removeFromWishlist } from '../utils/localStorage'; // ✅ removeFromWishlist 사용
import { getImageUrl } from '../services/api';
import '../styles/Wishlist.css';

function Wishlist() {
    const [wishlistMovies, setWishlistMovies] = useState([]);
    const [viewMode, setViewMode] = useState('scroll');

    useEffect(() => {
        // localStorage에서 찜한 영화 목록 불러오기
        const movies = getWishlist();
        setWishlistMovies(movies);
    }, []);

    const handleRemoveFromWishlist = (movieId) => {
        removeFromWishlist(movieId); // ✅ removeFromWishlist 사용
        // 상태 업데이트
        const updatedMovies = getWishlist();
        setWishlistMovies(updatedMovies);
    };

    if (wishlistMovies.length === 0) {
        return (
            <div className="wishlist">
                <Navbar />
                <div className="wishlist-container">
                    <h1 className="wishlist-title">💖 내가 찜한 콘텐츠</h1>
                    <div className="empty-wishlist">
                        <p className="empty-icon">📭</p>
                        <p className="empty-text">찜한 영화가 없습니다.</p>
                        <p className="empty-subtext">마음에 드는 영화를 찜해보세요!</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="wishlist">
            <Navbar />
            <div className="wishlist-container">
                <div className="wishlist-header">
                    <h1 className="wishlist-title">💖 내가 찜한 콘텐츠</h1>
                    <p className="wishlist-count">총 {wishlistMovies.length}개</p>

                    <div className="view-toggle">
                        <button
                            className={`view-button ${viewMode === 'scroll' ? 'active' : ''}`}
                            onClick={() => setViewMode('scroll')}
                        >
                            📜 그리드 뷰
                        </button>
                        <button
                            className={`view-button ${viewMode === 'table' ? 'active' : ''}`}
                            onClick={() => setViewMode('table')}
                        >
                            📋 Table View
                        </button>
                    </div>
                </div>

                {/* 그리드 뷰 */}
                {viewMode === 'scroll' && (
                    <div className="movie-grid">
                        {wishlistMovies.map((movie) => (
                            <div key={movie.id} className="movie-card-wishlist"> {/* ✅ key 추가 */}
                                <button
                                    className="remove-wishlist-btn"
                                    onClick={() => handleRemoveFromWishlist(movie.id)}
                                    title="찜 해제"
                                >
                                    ❌
                                </button>
                                <img
                                    src={getImageUrl(movie.poster_path)}
                                    alt={movie.title}
                                    className="wishlist-poster"
                                />
                                <div className="wishlist-info">
                                    <h3 className="wishlist-movie-title">{movie.title}</h3>
                                    <div className="wishlist-details">
                                        <span className="wishlist-rating">
                                            ⭐ {movie.vote_average?.toFixed(1)}
                                        </span>
                                        <span className="wishlist-year">
                                            {movie.release_date?.split('-')[0]}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Table 뷰 */}
                {viewMode === 'table' && (
                    <div className="movie-table">
                        <div className="table-header">
                            <div className="header-poster">포스터</div>
                            <div className="header-title">제목</div>
                            <div className="header-rating">평점</div>
                            <div className="header-date">개봉일</div>
                            <div className="header-overview">줄거리</div>
                            <div className="header-action">삭제</div>
                        </div>

                        {wishlistMovies.map((movie) => (
                            <div key={movie.id} className="table-row"> {/* ✅ key 추가 */}
                                <div className="cell-poster">
                                    <img
                                        src={getImageUrl(movie.poster_path, 'w200')}
                                        alt={movie.title}
                                    />
                                </div>
                                <div className="cell-title">{movie.title}</div>
                                <div className="cell-rating">
                                    ⭐ {movie.vote_average?.toFixed(1)}
                                </div>
                                <div className="cell-date">{movie.release_date}</div>
                                <div className="cell-overview">
                                    {movie.overview || '줄거리 정보가 없습니다.'}
                                </div>
                                <div className="cell-action">
                                    <button
                                        className="remove-btn"
                                        onClick={() => handleRemoveFromWishlist(movie.id)}
                                    >
                                        삭제
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Wishlist;