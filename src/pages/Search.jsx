// src/pages/Search.jsx
import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import MovieCard from '../components/MovieCard';
import { movieAPI, getImageUrl } from '../services/api';
import '../styles/Search.css';

function Search() {
    const [searchParams] = useSearchParams();
    const initialQuery = searchParams.get('q') || '';

    const [movies, setMovies] = useState([]);
    const [filteredMovies, setFilteredMovies] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [viewMode, setViewMode] = useState('grid');

    // 검색 및 필터 상태
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [genres, setGenres] = useState([]);
    const [selectedGenre, setSelectedGenre] = useState('');
    const [selectedRating, setSelectedRating] = useState('');
    const [selectedYear, setSelectedYear] = useState('');
    const [sortBy, setSortBy] = useState('popularity.desc');

    // 페이지네이션
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);

    // 장르 목록 가져오기
    useEffect(() => {
        const fetchGenres = async () => {
            try {
                const response = await movieAPI.getGenres();
                setGenres(response.data.genres);
            } catch (err) {
                console.error('장르 로드 실패:', err);
            }
        };
        fetchGenres();
    }, []);

    // 초기 검색어가 있으면 검색 실행
    useEffect(() => {
        if (initialQuery) {
            handleSearch();
        }
    }, [initialQuery]);

    // 영화 검색 함수
    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            fetchDiscoverMovies();
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await movieAPI.searchMovies(searchQuery, currentPage);
            setMovies(response.data.results);
            setFilteredMovies(response.data.results);
            setTotalPages(response.data.total_pages);
        } catch (err) {
            setError('검색 중 오류가 발생했습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Discover API로 필터링된 영화 가져오기
    const fetchDiscoverMovies = async () => {
        setLoading(true);
        setError(null);

        try {
            const params = {
                page: currentPage,
                sort_by: sortBy,
            };

            if (selectedGenre) params.with_genres = selectedGenre;
            if (selectedRating) params['vote_average.gte'] = selectedRating;
            if (selectedYear) params.primary_release_year = selectedYear;

            const response = await movieAPI.getMoviesByGenre(selectedGenre || '', currentPage);

            // 추가 파라미터가 있으면 수동으로 요청
            if (selectedRating || selectedYear || sortBy !== 'popularity.desc') {
                const customResponse = await fetch(
                    `https://api.themoviedb.org/3/discover/movie?api_key=${process.env.REACT_APP_TMDB_API_KEY}&language=ko-KR&${new URLSearchParams(params)}`
                );
                const data = await customResponse.json();
                setMovies(data.results);
                setFilteredMovies(data.results);
                setTotalPages(data.total_pages);
            } else {
                setMovies(response.data.results);
                setFilteredMovies(response.data.results);
                setTotalPages(response.data.total_pages);
            }
        } catch (err) {
            setError('영화를 불러오는 중 오류가 발생했습니다.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // 필터 적용 (클라이언트 사이드)
    const applyFilters = () => {
        let filtered = [...movies];

        // 장르 필터
        if (selectedGenre && searchQuery) {
            filtered = filtered.filter(movie =>
                movie.genre_ids?.includes(parseInt(selectedGenre))
            );
        }

        // 평점 필터
        if (selectedRating) {
            filtered = filtered.filter(movie =>
                movie.vote_average >= parseFloat(selectedRating)
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
                case 'vote_average.desc':
                    return b.vote_average - a.vote_average;
                case 'release_date.desc':
                    return new Date(b.release_date) - new Date(a.release_date);
                case 'title.asc':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });

        setFilteredMovies(filtered);
    };

    // 필터 변경 시 적용
    useEffect(() => {
        if (searchQuery) {
            applyFilters();
        } else {
            fetchDiscoverMovies();
        }
    }, [selectedGenre, selectedRating, selectedYear, sortBy, currentPage]);

    // 페이지 변경
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // 필터 초기화
    const resetFilters = () => {
        setSearchQuery('');
        setSelectedGenre('');
        setSelectedRating('');
        setSelectedYear('');
        setSortBy('popularity.desc');
        setCurrentPage(1);
        fetchDiscoverMovies();
    };

    // 연도 목록 생성
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 50 }, (_, i) => currentYear - i);

    return (
        <div className="search-page">
            <Navbar />
            <div className="search-container">
                {/* 검색 헤더 */}
                <div className="search-header">
                    <h1 className="search-title">🔍 영화 찾아보기</h1>

                    {/* 검색창 */}
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="영화 제목을 검색하세요..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            className="search-input-main"
                        />
                        <button onClick={handleSearch} className="search-btn">
                            검색
                        </button>
                    </div>
                </div>

                {/* 필터 및 정렬 섹션 */}
                <div className="filter-section">
                    <div className="filters">
                        {/* 장르 필터 */}
                        <select
                            value={selectedGenre}
                            onChange={(e) => setSelectedGenre(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">모든 장르</option>
                            {genres.map(genre => (
                                <option key={genre.id} value={genre.id}>
                                    {genre.name}
                                </option>
                            ))}
                        </select>

                        {/* 평점 필터 */}
                        <select
                            value={selectedRating}
                            onChange={(e) => setSelectedRating(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">모든 평점</option>
                            <option value="8">⭐ 8.0 이상</option>
                            <option value="7">⭐ 7.0 이상</option>
                            <option value="6">⭐ 6.0 이상</option>
                            <option value="5">⭐ 5.0 이상</option>
                        </select>

                        {/* 개봉년도 필터 */}
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">모든 연도</option>
                            {years.map(year => (
                                <option key={year} value={year}>
                                    {year}년
                                </option>
                            ))}
                        </select>

                        {/* 정렬 */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="filter-select"
                        >
                            <option value="popularity.desc">인기순</option>
                            <option value="vote_average.desc">평점순</option>
                            <option value="release_date.desc">최신순</option>
                            <option value="title.asc">제목순</option>
                        </select>

                        <button onClick={resetFilters} className="reset-btn">
                            초기화
                        </button>
                    </div>

                    {/* 뷰 모드 전환 */}
                    <div className="view-toggle">
                        <button
                            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            📜 그리드 뷰
                        </button>
                        <button
                            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                            onClick={() => setViewMode('table')}
                        >
                            📋 테이블 뷰
                        </button>
                    </div>
                </div>

                {/* 검색 결과 개수 */}
                {filteredMovies.length > 0 && (
                    <div className="result-info">
                        총 <strong>{filteredMovies.length}</strong>개의 영화
                    </div>
                )}

                {/* 로딩 */}
                {loading && (
                    <div className="loading">
                        <div className="spinner"></div>
                        <p>영화를 불러오는 중...</p>
                    </div>
                )}

                {/* 에러 */}
                {error && (
                    <div className="error-message">
                        <p>❌ {error}</p>
                    </div>
                )}

                {/* 결과 없음 */}
                {!loading && !error && filteredMovies.length === 0 && (
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
                            <MovieCard key={movie.id} movie={movie} />
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
                            <div className="header-genre">장르</div>
                            <div className="header-overview">줄거리</div>
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
                                <div className="cell-date">
                                    {movie.release_date || '미정'}
                                </div>
                                <div className="cell-genre">
                                    {movie.genre_ids
                                        ?.map(id => genres.find(g => g.id === id)?.name)
                                        .filter(Boolean)
                                        .slice(0, 2)
                                        .join(', ') || '-'}
                                </div>
                                <div className="cell-overview">
                                    {movie.overview || '줄거리 정보가 없습니다.'}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* 페이지네이션 */}
                {!loading && filteredMovies.length > 0 && totalPages > 1 && (
                    <div className="pagination">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="page-btn"
                        >
                            ← 이전
                        </button>

                        <span className="page-info">
                            {currentPage} / {totalPages}
                        </span>

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="page-btn"
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