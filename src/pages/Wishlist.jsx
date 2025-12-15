// src/pages/Wishlist.jsx
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard'; // ✅ MovieCard import
import { getWishlist, removeFromWishlist, toggleWishlist } from '../utils/localStorage';
import { getImageUrl } from '../services/api';
import '../styles/Wishlist.css';

function Wishlist() {
    const [wishlistMovies, setWishlistMovies] = useState([]);
    const [viewMode, setViewMode] = useState('scroll');
    const [wishlistUpdate, setWishlistUpdate] = useState(0); // ✅ 찜 상태 업데이트용

    useEffect(() => {
        // localStorage에서 찜한 영화 목록 불러오기
        const movies = getWishlist();
        setWishlistMovies(movies);
    }, [wishlistUpdate]); // ✅ wishlistUpdate 의존성 추가

    const handleRemoveFromWishlist = (movieId) => {
        removeFromWishlist(movieId);
        // 상태 업데이트
        const updatedMovies = getWishlist();
        setWishlistMovies(updatedMovies);
    };

    // ✅ Bottom-Up: 자식(MovieCard)으로부터 받은 이벤트 처리
    const handleWishlistToggle = (movie) => {
        console.log('Wishlist에서 찜 해제 이벤트 받음:', movie.title);
        toggleWishlist(movie); // 찜 해제
        setWishlistUpdate(prev => prev + 1); // 강제 리렌더링
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
                            📜 Infinite Scroll
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
                            /* ✅ MovieCard 사용 + Bottom-Up 콜백 전달 */
                            <MovieCard
                                key={movie.id}
                                movie={movie}
                                onWishlistToggle={handleWishlistToggle}
                            />
                        ))}
                    </div>
                )}

                {/* Table 뷰 */}
                {/* Table 뷰 */}
                {viewMode === 'table' && (
                    <div className="movie-table">
                        <div className="table-header">
                            <div className="header-poster">포스터</div>
                            <div className="header-title">제목</div>
                            <div className="header-rating">평점</div>
                            <div className="header-date">개봉일</div>
                            <div className="header-added">추가한 날짜</div> {/* ✅ 새로 추가 */}
                            <div className="header-overview">줄거리</div>
                            <div className="header-action">삭제</div>
                        </div>

                        {wishlistMovies.map((movie) => (
                            <div key={movie.id} className="table-row">
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
                                <div className="cell-added"> {/* ✅ 새로 추가 */}
                                    {movie.addedDate || '날짜 정보 없음'}
                                </div>
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