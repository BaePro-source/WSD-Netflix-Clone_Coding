// src/components/MovieList.jsx
import React, { useState, useEffect, useRef } from 'react';
import MovieCard from './MovieCard';
import { toggleWishlist } from '../utils/localStorage';
import '../styles/MovieList.css';

function MovieList({ title, fetchMovies }) {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [wishlistUpdate, setWishlistUpdate] = useState(0);
    const scrollRef = useRef(null);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    useEffect(() => {
        const loadMovies = async () => {
            try {
                setLoading(true);
                const response = await fetchMovies();
                setMovies(response.data.results);
                setError(null);
            } catch (err) {
                console.error('영화 로딩 실패:', err);
                setError('영화를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        loadMovies();
    }, [fetchMovies]);

    // 스크롤 위치에 따라 화살표 표시/숨김
    useEffect(() => {
        const handleScroll = () => {
            if (scrollRef.current) {
                const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
                setShowLeftArrow(scrollLeft > 0);
                setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
            }
        };

        const scrollElement = scrollRef.current;
        if (scrollElement) {
            handleScroll(); // 초기 실행
            scrollElement.addEventListener('scroll', handleScroll);
            return () => scrollElement.removeEventListener('scroll', handleScroll);
        }
    }, [movies]);

    const handleWishlistToggle = (movie) => {
        console.log('MovieList에서 찜하기 이벤트 받음:', movie.title);
        toggleWishlist(movie);
        setWishlistUpdate(prev => prev + 1);
    };

    const scroll = (direction) => {
        if (scrollRef.current) {
            const scrollAmount = direction === 'left' ? -600 : 600;
            scrollRef.current.scrollBy({
                left: scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (loading) {
        return (
            <div className="movie-list-section">
                <h2 className="movie-list-title">{title}</h2>
                <div className="movie-list-loading">로딩 중...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="movie-list-section">
                <h2 className="movie-list-title">{title}</h2>
                <div className="movie-list-error">{error}</div>
            </div>
        );
    }

    return (
        <div className="movie-list-section">
            <h2 className="movie-list-title">{title}</h2>
            <div className="movie-list-container">
                {/* 왼쪽 스크롤 버튼 */}
                {showLeftArrow && (
                    <button
                        className="scroll-arrow scroll-arrow-left"
                        onClick={() => scroll('left')}
                        aria-label="왼쪽으로 스크롤"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                        </svg>
                    </button>
                )}

                {/* 영화 카드 스크롤 영역 */}
                <div className="movie-list" ref={scrollRef}>
                    {movies.map((movie) => (
                        <MovieCard
                            key={movie.id}
                            movie={movie}
                            onWishlistToggle={handleWishlistToggle}
                        />
                    ))}
                </div>

                {/* 오른쪽 스크롤 버튼 */}
                {showRightArrow && (
                    <button
                        className="scroll-arrow scroll-arrow-right"
                        onClick={() => scroll('right')}
                        aria-label="오른쪽으로 스크롤"
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
}

export default MovieList;