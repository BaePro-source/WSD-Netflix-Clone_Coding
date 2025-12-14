// src/pages/Search.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { movieAPI, getImageUrl } from '../services/api';
import { toggleWishlist, isInWishlist } from '../utils/localStorage';
import '../styles/Search.css';

function Search() {
    const location = useLocation();
    const [movies, setMovies] = useState([]);
    const [filteredMovies, setFilteredMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('scroll');

    // 필터링 상태
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState('');
    const [selectedRating, setSelectedRating] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [sortBy, setSortBy] = useState('popularity.desc');

    // 무한 스크롤 상태
    const [scrollPage, setScrollPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const lastMovieRef = useRef(null);
    const [showTopButton, setShowTopButton] = useState(false);

    // 테이블 뷰 상태
    const [tablePage, setTablePage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    const isInitialMount = useRef(true);

    // 장르 목록 가져오기
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await movieAPI.getGenres();
                setGenres(response.data.genres);
            } catch (error) {
                console.error('장르 목록 가져오기 실패:', error);
            }
        };
        fetchGenres();
    }, []);

    // URL 쿼리 파라미터에서 검색어 가져오기
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const query = params.get('q');
        if (query) {
            setSearchQuery(query);
        }
    }, [location.search]);

    // 필터 적용 (클라이언트 사이드)
    const applyFilters = useCallback((movieList) => {
        let filtered = [...movieList];

        // 장르 필터
        if (selectedGenre) {
            filtered = filtered.filter(movie =>
                movie.genre_ids?.includes(parseInt(selectedGenre))
            );
        }

        // 평점 필터
        if (selectedRating) {
            const minRating = parseFloat(selectedRating);
            filtered = filtered.filter(movie =>
                movie.vote_average >= minRating
            );
        }

        // 개봉년도 필터
        if (selectedYear) {
            filtered = filtered.filter(movie =>
                movie.release_date?.startsWith(selectedYear)
            );
        }

        // 정렬
        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'popularity.desc':
                    return b.popularity - a.popularity;
                case 'popularity.asc':
                    return a.popularity - b.popularity;
                case 'vote_average.desc':
                    return b.vote_average - a.vote_average;
                case 'vote_average.asc':
                    return a.vote_average - b.vote_average;
                case 'release_date.desc':
                    return new Date(b.release_date || 0) - new Date(a.release_date || 0);
                case 'release_date.asc':
                    return new Date(a.release_date || 0) - new Date(b.release_date || 0);
                case 'title.asc':
                    return a.title.localeCompare(b.title);
                case 'title.desc':
                    return b.title.localeCompare(a.title);
                default:
                    return 0;
            }
        });

        setFilteredMovies(filtered);
    }, [selectedGenre, selectedRating, selectedYear, sortBy]);

    // 영화 검색/필터링
    const fetchMovies = useCallback(async (page = 1, append = false) => {
        if (page === 1) {
            setLoading(true);
        } else {
            setIsLoadingMore(true);
        }

        try {
            let response;

            if (searchQuery.trim()) {
                response = await movieAPI.searchMovies(searchQuery, page);
            } else {
                response = await movieAPI.getPopular(page);
            }

            const results = response.data.results;
            let newMovies;

            if (append) {
                newMovies = [...movies, ...results];
                setMovies(newMovies);
            } else {
                newMovies = results;
                setMovies(results);
            }

            setTotalPages(response.data.total_pages);
            setHasMore(page < response.data.total_pages);

            applyFilters(newMovies);
        } catch (error) {
            console.error('영화 가져오기 실패:', error);
        } finally {
            setLoading(false);
            setIsLoadingMore(false);
        }
    }, [searchQuery, movies, applyFilters]);

    // 초기 로드
    useEffect(() => {
        fetchMovies(1, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // View 모드 변경 시
    useEffect(() => {
        setScrollPage(1);
        setTablePage(1);
        setMovies([]);
        setFilteredMovies([]);
        setHasMore(true);
        setIsLoadingMore(false);
        fetchMovies(1, false);
        window.scrollTo(0, 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [viewMode]);

    // 검색어 변경 시 (초기 마운트는 제외)
    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }

        setScrollPage(1);
        setTablePage(1);
        setMovies([]);
        setFilteredMovies([]);
        setHasMore(true);
        fetchMovies(1, false);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchQuery]);

    // 테이블 뷰 페이지 변경
    useEffect(() => {
        if (viewMode === 'table' && tablePage > 1) {
            fetchMovies(tablePage, false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tablePage, viewMode]);

    // 무한 스크롤 - 더 많은 영화 로드
    const loadMoreMovies = useCallback(async () => {
        if (isLoadingMore || !hasMore || viewMode === 'table') return;

        const nextPage = scrollPage + 1;
        setScrollPage(nextPage);
        await fetchMovies(nextPage, true);
    }, [isLoadingMore, hasMore, viewMode, scrollPage, fetchMovies]);

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
    }, [viewMode, hasMore, isLoadingMore, loadMoreMovies]);

    // 스크롤 감지 (맨 위로 버튼)
    useEffect(() => {
        const handleScroll = () => {
            setShowTopButton(window.scrollY > 500);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // 필터 변경 시 재적용
    useEffect(() => {
        applyFilters(movies);
    }, [selectedGenre, selectedRating, selectedYear, sortBy, movies, applyFilters]);

    // 검색 실행
    const handleSearch = (e) => {
        e.preventDefault();
        setScrollPage(1);
        setTablePage(1);
        setMovies([]);
        setFilteredMovies([]);
        fetchMovies(1, false);
    };

    // 필터 초기화
    const handleResetFilters = () => {
        setSelectedGenre('');
        setSelectedRating('');
        setSelectedYear('');
        setSortBy('popularity.desc');
        setSearchQuery('');
        setScrollPage(1);
        setTablePage(1);
        setMovies([]);
        setFilteredMovies([]);
        setHasMore(true);
    };

    // 찜하기 토글
    const handleWishlistToggle = (movie) => {
        toggleWishlist(movie);
        setFilteredMovies([...filteredMovies]);
    };

    // 테이블 페이지 변경
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setTablePage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // 맨 위로 스크롤
    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // 년도 옵션 생성
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: currentYear - 1899 }, (_, i) => currentYear - i);

    return (
        <div className="search">
            <Navbar />
            <div className="search-container">
                <h1 className="search-title">🔍 찾아보기 (search/filtering)</h1>

                {/* 검색 바 */}
                <form className="search-bar" onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="영화 제목을 검색하세요..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input-main"
                    />
                    <button type="submit" className="search-button-main">
                        🔍 검색
                    </button>
                </form>

                {/* 필터 섹션 */}
                <div className="filter-section">
                    <div className="filter-controls">
                        <div className="filter-group">
                            <label>장르</label>
                            <select
                                value={selectedGenre}
                                onChange={(e) => setSelectedGenre(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">전체 장르</option>
                                {genres.map(genre => (
                                    <option key={genre.id} value={genre.id}>
                                        {genre.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>평점</label>
                            <select
                                value={selectedRating}
                                onChange={(e) => setSelectedRating(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">전체</option>
                                <option value="8">⭐ 8.0 이상</option>
                                <option value="7">⭐ 7.0 이상</option>
                                <option value="6">⭐ 6.0 이상</option>
                                <option value="5">⭐ 5.0 이상</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>개봉년도</label>
                            <select
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(e.target.value)}
                                className="filter-select"
                            >
                                <option value="">전체</option>
                                {years.map(year => (
                                    <option key={year} value={year}>
                                        {year}년
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>정렬</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="filter-select"
                            >
                                <option value="popularity.desc">인기순 (높은순)</option>
                                <option value="popularity.asc">인기순 (낮은순)</option>
                                <option value="vote_average.desc">평점순 (높은순)</option>
                                <option value="vote_average.asc">평점순 (낮은순)</option>
                                <option value="release_date.desc">최신순</option>
                                <option value="release_date.asc">오래된순</option>
                                <option value="title.asc">제목순 (가나다)</option>
                                <option value="title.desc">제목순 (역순)</option>
                            </select>
                        </div>

                        <button
                            className="reset-button"
                            onClick={handleResetFilters}
                        >
                            🔄 초기화
                        </button>
                    </div>

                    <div className="view-controls">
                        <span className="result-count">
                            총 {filteredMovies.length}개 영화
                        </span>
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
                                📋 테이블 뷰
                            </button>
                        </div>
                    </div>
                </div>

                {/* 로딩 */}
                {loading && filteredMovies.length === 0 && (
                    <div className="loading">
                        <div className="spinner"></div>
                        <p>영화를 불러오는 중...</p>
                    </div>
                )}

                {/* 검색 결과 없음 */}
                {!loading && filteredMovies.length === 0 && (
                    <div className="no-results">
                        <p className="no-results-icon">🎬</p>
                        <p className="no-results-text">검색 결과가 없습니다.</p>
                        <p className="no-results-subtext">다른 검색어나 필터를 시도해보세요.</p>
                    </div>
                )}

                {/* 무한 스크롤 뷰 */}
                {viewMode === 'scroll' && filteredMovies.length > 0 && (
                    <>
                        <div className="movie-grid">
                            {filteredMovies.map((movie, index) => (
                                <div
                                    key={`${movie.id}-${index}`}
                                    ref={index === filteredMovies.length - 1 ? lastMovieRef : null}
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

                        {!hasMore && !isLoadingMore && filteredMovies.length > 0 && (
                            <div className="no-more">
                                모든 영화를 불러왔습니다! 🎉
                            </div>
                        )}
                    </>
                )}

                {/* 테이블 뷰 */}
                {viewMode === 'table' && filteredMovies.length > 0 && (
                    <div className="table-view-wrapper">
                        <div className="movie-table">
                            <div className="table-header">
                                <div className="header-poster">포스터</div>
                                <div className="header-title">제목</div>
                                <div className="header-rating">평점</div>
                                <div className="header-date">개봉일</div>
                                <div className="header-overview">줄거리</div>
                                <div className="header-wishlist">찜</div>
                            </div>

                            <div className="table-body">
                                {filteredMovies.map((movie) => (
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
                                        <div className="cell-wishlist">
                                            <button
                                                className={`wishlist-table-btn ${isInWishlist(movie.id) ? 'active' : ''}`}
                                                onClick={() => handleWishlistToggle(movie)}
                                            >
                                                {isInWishlist(movie.id) ? '❤️' : '🤍'}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Table View 페이지네이션 */}
                        <div className="pagination">
                            <button
                                className="page-button"
                                onClick={() => handlePageChange(tablePage - 1)}
                                disabled={tablePage === 1}
                            >
                                ← 이전
                            </button>

                            <div className="page-numbers">
                                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                                    const pageNum = tablePage - 2 + i;
                                    if (pageNum < 1 || pageNum > totalPages) return null;
                                    return (
                                        <button
                                            key={pageNum}
                                            className={`page-number ${tablePage === pageNum ? 'active' : ''}`}
                                            onClick={() => handlePageChange(pageNum)}
                                        >
                                            {pageNum}
                                        </button>
                                    );
                                })}
                            </div>

                            <span className="page-info">
                                {tablePage} / {totalPages}
                            </span>

                            <button
                                className="page-button"
                                onClick={() => handlePageChange(tablePage + 1)}
                                disabled={tablePage === totalPages}
                            >
                                다음 →
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* 맨 위로 버튼 (무한 스크롤에서만) */}
            {showTopButton && viewMode === 'scroll' && (
                <button className="scroll-to-top" onClick={scrollToTop}>
                    ⬆️
                    <span>TOP</span>
                </button>
            )}
        </div>
    );
}

export default Search;