// src/pages/Popular.jsx
import React, { useState, useEffect } from 'react';
import { movieAPI } from '../services/api';
import { getImageUrl } from '../services/api';
import Navbar from '../components/Navbar';
import '../styles/Popular.css';

function Popular() {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const fetchPopularMovies = async () => {
            try {
                setLoading(true);
                const response = await movieAPI.getPopular(currentPage);
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

        fetchPopularMovies();
        window.scrollTo(0, 0); // 페이지 변경 시 스크롤 맨 위로
    }, [currentPage]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    if (loading) {
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

    if (error) {
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
        <div className="popular">
            <Navbar />
            <div className="popular-container">
                <h1 className="popular-title">🔥 인기 영화</h1>

                {/* Table View */}
                <div className="movie-table">
                    <div className="table-header">
                        <div className="header-poster">포스터</div>
                        <div className="header-title">제목</div>
                        <div className="header-rating">평점</div>
                        <div className="header-date">개봉일</div>
                        <div className="header-overview">줄거리</div>
                    </div>

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
                        </div>
                    ))}
                </div>

                {/* Pagination */}
                <div className="pagination">
                    <button
                        className="page-button"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                    >
                        ← 이전
                    </button>

                    <div className="page-numbers">
                        {/* 현재 페이지 기준 ±2 페이지만 표시 */}
                        {[...Array(5)].map((_, i) => {
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

                    <button
                        className="page-button"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                    >
                        다음 →
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Popular;