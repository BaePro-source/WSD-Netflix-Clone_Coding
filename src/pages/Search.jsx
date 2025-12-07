// src/pages/Search.jsx
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard'; // ✅ MovieCard import
import { movieAPI, getImageUrl } from '../services/api';
import { toggleWishlist, isInWishlist } from '../utils/localStorage';
import '../styles/Search.css';

function Search() {
    const location = useLocation();
    const [movies, setMovies] = useState([]);
    const [filteredMovies, setFilteredMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState('grid');

    // 필터링 상태
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState('');
    const [selectedRating, setSelectedRating] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [sortBy, setSortBy] = useState('popularity.desc');

    // 페이지네이션
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [wishlistUpdate, setWishlistUpdate] = useState(0); // ✅ 찜 상태 업데이트용

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

    // 초기 인기 영화 로드 및 검색어 변경 시 재검색
    useEffect(() => {
        fetchMovies();
    }, [currentPage, searchQuery]);

    // 영화 검색/필터링
    const fetchMovies = async () => {
        setLoading(true);
        try {
            let response;

            if (searchQuery.trim()) {
                // 검색어가 있으면 검색 API 사용
                response = await movieAPI.searchMovies(searchQuery, currentPage);
            } else {
                // 검색어가 없으면 인기 영화 가져오기
                response = await movieAPI.getPopular(currentPage);
            }

            setMovies(response.data.results);
            setTotalPages(response.data.total_pages);
            applyFilters(response.data.results);
        } catch (error) {
            console.error('영화 가져오기 실패:', error);
        } finally {
            setLoading(false);
        }
    };

    // 필터 적용 (클라이언트 사이드)
    const applyFilters = (movieList) => {
        let filtered = [...movieList];

        // 장르 필터
        if (selectedGenre) {
            filtered = filtered.filter(movie =>
                movie.genre_ids.includes(parseInt(selectedGenre))
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
                    return new Date(b.release_date) - new Date(a.release_date);
                case 'release_date.asc':
                    return new Date(a.release_date) - new Date(b.release_date);
                case 'title.asc':
                    return a.title.localeCompare(b.title);
                case 'title.desc':
                    return b.title.localeCompare(a.title);
                default:
                    return 0;
            }
        });

        setFilteredMovies(filtered);
    };

    // 필터 변경 시 재적용
    useEffect(() => {
        applyFilters(movies);
    }, [selectedGenre, selectedRating, selectedYear, sortBy, movies]);

    // 검색 실행
    const handleSearch = (e) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchMovies();
    };

    // 필터 초기화
    const handleResetFilters = () => {
        setSelectedGenre('');
        setSelectedRating('');
        setSelectedYear('');
        setSortBy('popularity.desc');
        setSearchQuery('');
        setCurrentPage(1);
    };

    // ✅ Bottom-Up: 자식(MovieCard)으로부터 받은 이벤트 처리
    const handleWishlistToggle = (movie) => {
        console.log('부모에서 찜하기 이벤트 받음:', movie.title);
        toggleWishlist(movie);
        setWishlistUpdate(prev => prev + 1); // 강제 리렌더링
    };

    // 페이지 변경
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // 년도 옵션 생성 (현재 년도부터 1900년까지)
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
                        검색
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
                                className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                            >
                                📜 그리드 뷰
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
                {loading && (
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

                {/* 그리드 뷰 */}
                {!loading && viewMode === 'grid' && filteredMovies.length > 0 && (
                    <div className="movie-grid">
                        {filteredMovies.map((movie) => (
                            /* ✅ MovieCard 사용 + Bottom-Up 콜백 전달 */
                            <MovieCard
                                key={movie.id}
                                movie={movie}
                                onWishlistToggle={handleWishlistToggle}
                            />
                        ))}
                    </div>
                )}

                {/* 테이블 뷰 */}
                {!loading && viewMode === 'table' && filteredMovies.length > 0 && (
                    <div className="movie-table">
                        <div className="table-header">
                            <div className="header-poster">포스터</div>
                            <div className="header-title">제목</div>
                            <div className="header-rating">평점</div>
                            <div className="header-date">개봉일</div>
                            <div className="header-overview">줄거리</div>
                            <div className="header-wishlist">찜</div>
                        </div>

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
                                        {isInWishlist(movie.id) ? '💖' : '🤍'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 페이지네이션 */}
                {!loading && filteredMovies.length > 0 && (
                    <div className="pagination">
                        <button
                            className="page-button"
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            ← 이전
                        </button>

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
                )}
            </div>
        </div>
    );
}

export default Search;