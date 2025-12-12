// src/pages/Home.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import MovieList from '../components/MovieList';
import { movieAPI, getImageUrl } from '../services/api';
import { toggleWishlist, isInWishlist } from '../utils/localStorage';
import '../styles/Home.css';

function Home() {
    const [featuredMovies, setFeaturedMovies] = useState([]); // ✅ 여러 영화 저장
    const [currentIndex, setCurrentIndex] = useState(0); // ✅ 현재 인덱스
    const [isWished, setIsWished] = useState(false);
    const [isTransitioning, setIsTransitioning] = useState(false);

    // 메인 배너용 영화들 가져오기 (3-5개)
    useEffect(() => {
        const fetchFeaturedMovies = async () => {
            try {
                const response = await movieAPI.getPopular();
                const movies = response.data.results;
                // 평점 높은 영화 5개 선택
                const topMovies = movies
                    .filter(m => m.vote_average > 7 && m.backdrop_path)
                    .slice(0, 5);
                setFeaturedMovies(topMovies);
                if (topMovies.length > 0) {
                    setIsWished(isInWishlist(topMovies[0].id));
                }
            } catch (error) {
                console.error('Featured 영화 로딩 실패:', error);
            }
        };

        fetchFeaturedMovies();
    }, []);

    // 현재 영화가 바뀔 때마다 찜 상태 업데이트
    useEffect(() => {
        if (featuredMovies.length > 0) {
            setIsWished(isInWishlist(featuredMovies[currentIndex].id));
        }
    }, [currentIndex, featuredMovies]);

    // 영화 리스트 fetch 함수들
    const fetchPopular = useCallback(() => movieAPI.getPopular(), []);
    const fetchNowPlaying = useCallback(() => movieAPI.getNowPlaying(), []);
    const fetchUpcoming = useCallback(() => movieAPI.getUpcoming(), []);
    const fetchTopRated = useCallback(() => movieAPI.getTopRated(), []);

    // ✅ 이전 영화
    const handlePrev = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev === 0 ? featuredMovies.length - 1 : prev - 1));
        setTimeout(() => setIsTransitioning(false), 500);
    };

    // ✅ 다음 영화
    const handleNext = () => {
        if (isTransitioning) return;
        setIsTransitioning(true);
        setCurrentIndex((prev) => (prev === featuredMovies.length - 1 ? 0 : prev + 1));
        setTimeout(() => setIsTransitioning(false), 500);
    };

    // ✅ 특정 영화로 이동 (인디케이터 클릭)
    const goToSlide = (index) => {
        if (isTransitioning || index === currentIndex) return;
        setIsTransitioning(true);
        setCurrentIndex(index);
        setTimeout(() => setIsTransitioning(false), 500);
    };

    const handleWishlistToggle = () => {
        const currentMovie = featuredMovies[currentIndex];
        if (currentMovie) {
            toggleWishlist(currentMovie);
            setIsWished(!isWished);
        }
    };

    const handlePlayClick = () => {
        alert('재생 기능은 준비중입니다.');
    };

    if (featuredMovies.length === 0) {
        return (
            <div className="home">
                <Navbar />
                <div className="home-loading">로딩 중...</div>
            </div>
        );
    }

    const currentMovie = featuredMovies[currentIndex];

    return (
        <div className="home">
            <Navbar />

            {/* 메인 배너 캐러셀 */}
            <div className="hero-banner">
                {/* 배경 이미지 */}
                <div
                    className={`hero-background ${isTransitioning ? 'transitioning' : ''}`}
                    style={{
                        backgroundImage: `url(${getImageUrl(currentMovie.backdrop_path, 'original')})`
                    }}
                >
                    <div className="hero-gradient"></div>
                </div>

                {/* 이전 버튼 */}
                <button
                    className="hero-nav-btn prev-btn"
                    onClick={handlePrev}
                    disabled={isTransitioning}
                    aria-label="이전 영화"
                >
                    ‹
                </button>

                {/* 다음 버튼 */}
                <button
                    className="hero-nav-btn next-btn"
                    onClick={handleNext}
                    disabled={isTransitioning}
                    aria-label="다음 영화"
                >
                    ›
                </button>

                {/* 콘텐츠 */}
                <div className={`hero-content ${isTransitioning ? 'transitioning' : ''}`}>
                    <h1 className="hero-title">{currentMovie.title || currentMovie.name}</h1>

                    <div className="hero-info">
                        <span className="hero-rating">⭐ {currentMovie.vote_average?.toFixed(1)}</span>
                        <span className="hero-year">
                            {(currentMovie.release_date || currentMovie.first_air_date)?.split('-')[0]}
                        </span>
                    </div>

                    <p className="hero-overview">
                        {currentMovie.overview?.length > 200
                            ? `${currentMovie.overview.substring(0, 200)}...`
                            : currentMovie.overview}
                    </p>

                    <div className="hero-buttons">
                        <button className="hero-btn play-btn" onClick={handlePlayClick}>
                            <span className="btn-icon">▶</span>
                            재생
                        </button>
                        <button
                            className={`hero-btn info-btn ${isWished ? 'wished' : ''}`}
                            onClick={handleWishlistToggle}
                        >
                            <span className="btn-icon">{isWished ? '✓' : '+'}</span>
                            {isWished ? '찜 완료' : '내가 찜한 콘텐츠'}
                        </button>
                    </div>
                </div>

                {/* ✅ 인디케이터 (점) */}
                <div className="hero-indicators">
                    {featuredMovies.map((_, index) => (
                        <button
                            key={index}
                            className={`indicator ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => goToSlide(index)}
                            aria-label={`${index + 1}번째 영화로 이동`}
                        />
                    ))}
                </div>
            </div>

            {/* 영화 리스트 섹션 */}
            <div className="home-content">
                <MovieList title="🔥 인기 영화" fetchMovies={fetchPopular} />
                <MovieList title="🎬 현재 상영중" fetchMovies={fetchNowPlaying} />
                <MovieList title="🎉 개봉 예정" fetchMovies={fetchUpcoming} />
                <MovieList title="⭐ 높은 평점" fetchMovies={fetchTopRated} />
            </div>
        </div>
    );
}

export default Home;