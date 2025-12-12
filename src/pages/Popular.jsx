// src/pages/Popular.jsx
import React, { useState, useEffect, useRef } from 'react';
import { movieAPI } from '../services/api';
import { getImageUrl } from '../services/api';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { toggleWishlist, isInWishlist } from '../utils/localStorage';
import '../styles/Popular.css';

function Popular() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [viewMode, setViewMode] = useState('scroll');
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const lastMovieRef = useRef(null);
    const [showTopButton, setShowTopButton] = useState(false);

    // ✅ Table View에서 body scroll 제어
    useEffect(() => {
        if (viewMode === 'table') {
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100vh';
        } else {
            document.body.style.overflow = 'auto';
            document.body.style.height = 'auto';
        }

        return () => {
            document.body.style.overflow = 'auto';
            document.body.style.height = 'auto';
        };
    }, [viewMode]);

    // Table View용 데이터 로딩
    const fetchPopularMovies = async (page) => {
        try {
            setLoading(true);
            const response = await movieAPI.getPopular(page);
            setMovies(response.data.results);
            setTotalPages(response.data.total_pages);
            setError(null);
        } catch (err) {
            console.error('인기 영화 로딩 실패:', err);
            setError('영화를 불러오는데 실패했습니다.');
        } finally {
            setLoading(false);
        }
    };

    // 무한 스크롤용 데이터 로딩
    const loadMoreMovies = async () => {
        if (isLoadingMore || !hasMore) return;

        try {
            setIsLoadingMore(true);
            const nextPage = currentPage + 1;

            const response = await movieAPI.getPopular(nextPage);
            const newMovies = response.data.results;

            setMovies(prev => [...prev, ...newMovies]);
            setCurrentPage(nextPage);
            setTotalPages(response.data.total_pages);

            if (nextPage >= response.data.total_pages || nextPage >= 20) {
                setHasMore(false);
            }

            setError(null);
        } catch (err) {
            console.error('로딩 실패:', err);
            setError('영화를 불러오는데 실패했습니다.');
        } finally {
            setIsLoadingMore(false);
        }
    };

    // View 모드 변경 시 초기화
    useEffect(() => {
        setCurrentPage(1);
        setMovies([]);
        setHasMore(true);
        setIsLoadingMore(false);

        if (viewMode === 'table') {
            fetchPopularMovies(1);
        } else {
            setLoading(true);
            movieAPI.getPopular(1)
                .then(response => {
                    setMovies(response.data.results);
                    setTotalPages(response.data.total_pages);
                    setLoading(false);
                })
                .catch(err => {
                    console.error('초기 로딩 실패:', err);
                    setError('영화를 불러오는데 실패했습니다.');
                    setLoading(false);
                });
        }

        window.scrollTo(0, 0);
    }, [viewMode]);

    // Table View 페이지 변경
    useEffect(() => {
        if (viewMode === 'table' && currentPage > 0) {
            fetchPopularMovies(currentPage);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentPage, viewMode]);

    // 무한 스크롤 Intersection Observer
    useEffect(() => {
        if (viewMode !== 'scroll' || !hasMore || isLoadingMore) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMoreMovies();
                }
            },
            { threshold: 0.5 }
        );

        if (lastMovieRef.current) {
            observer.observe(lastMovieRef.current);
        }

        return () => {
            if (observer) observer.disconnect();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewMode, hasMore, isLoadingMore]);

    // 스크롤 감지 (맨 위로 버튼)
    useEffect(() => {
        const handleScroll = () => {
            setShowTopButton(window.scrollY > 500);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleWishlistToggle = (movie) => {
        toggleWishlist(movie);
    };

    if (loading && movies.length === 0) {
        return (
            <div className="popular">
                <Navbar />
                <div className="popular-container">
                    <h1 className="popular-title">🔥 인기 영화</h1>
                    <div className="loading">로딩 중...</div>
                </div>
            </div>
        );
    }

    if (error && movies.length === 0) {
        return (
            <div className="popular">
                <Navbar />
                <div className="popular-container">
                    <h1 className="popular-title">🔥 인기 영화</h1>
                    <div className="error">{error}</div>
                </div>
            </div>
        );
    }

    return (
        <div className={`popular ${viewMode === 'table' ? 'table-mode' : ''}`}>
            <Navbar />
            <div className="popular-container">
                <div className="popular-header">
                    <h1 className="popular-title">🔥 인기 영화</h1>

                    <div className="view-toggle">
                        <button
                            className={`view-button ${viewMode === 'scroll' ? 'active' : ''}`}
                            onClick={() => setViewMode('scroll')}
                        >
                            📜 무한 스크롤
                        </button>
                        <button
                            className={`view-button ${viewMode === 'table' ? 'active' : ''}`}
                            onClick={() => setViewMode('table')}
                        >
                            📋 Table View
                        </button>
                    </div>
                </div>

                {viewMode === 'table' && (
                    <div className="table-view-wrapper">
                        <div className="movie-table">
                            <div className="table-header">
                                <div className="header-poster">포스터</div>
                                <div className="header-title">제목</div>
                                <div className="header-rating">평점</div>
                                <div className="header-date">개봉일</div>
                                <div className="header-overview">줄거리</div>
                                <div className="header-action">찜</div>
                            </div>

                            <div className="table-body">
                                {movies.map((movie) => (
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
                                        <div className="cell-overview">
                                            {movie.overview || '줄거리 정보가 없습니다.'}
                                        </div>
                                        <div className="cell-action">
                                            <button
                                                className={`table-wishlist-btn ${isInWishlist(movie.id) ? 'wished' : ''}`}
                                                onClick={() => handleWishlistToggle(movie)}
                                                title={isInWishlist(movie.id) ? '찜 해제' : '찜하기'}
                                            >
                                                {isInWishlist(movie.id) ? '❤️' : '🤍'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pagination">
                            <button
                                className="page-button"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                ← 이전
                            </button>

                            <div className="page-numbers">
                                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                    const pageNum = currentPage - 2 + i;
                                    if (pageNum < 1 || pageNum > totalPages) return null;
                                    return (
                                        <button
                                            key={pageNum}
                                            className={`page-number ${currentPage === pageNum ? 'active' : ''}`}
                                            onClick={() => handlePageChange(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <span className="page-info">
                                {currentPage} / {totalPages}
                            </span>

                            <button
                                className="page-button"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                다음 →
                            </button>
                        </div>
                    </div>
                )}

                {viewMode === 'scroll' && (
                    <>
                        <div className="movie-grid">
                            {movies.map((movie, index) => (
                                <div
                                    key={`${movie.id}-${index}`}
                                    ref={index === movies.length - 1 ? lastMovieRef : null}
                                >
                                    <MovieCard
                                        movie={movie}
                                        onWishlistToggle={handleWishlistToggle}
                                    />
                                </div>
                            ))}
                        </div>

                        {isLoadingMore && (
                            <div className="loading-more">
                                <div className="spinner"></div>
                                <p>더 많은 영화를 불러오는 중...</p>
                            </div>
                        )}

                        {!hasMore && !isLoadingMore && (
                            <div className="no-more">
                                모든 영화를 불러왔습니다! 🎉
                            </div>
                        )}
                    </>
                )}
            </div>

            {showTopButton && viewMode === 'scroll' && (
                <button className="scroll-to-top" onClick={scrollToTop}>
                    ⬆️
                    <span>TOP</span>
                </button>
            )}
        </div>
    );
}

export default Popular;