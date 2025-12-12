// src/pages/Home.jsx
import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '../components/Navbar';
import MovieList from '../components/MovieList';
import { movieAPI, getImageUrl } from '../services/api';
import { toggleWishlist, isInWishlist } from '../utils/localStorage';
import '../styles/Home.css';

function Home() {
    const [featuredMovies, setFeaturedMovies] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [nextIndex, setNextIndex] = useState(null);
    const [isWished, setIsWished] = useState(false);
    const [slideDirection, setSlideDirection] = useState('');
    const [isAnimating, setIsAnimating] = useState(false);

    // 메인 배너용 영화들 가져오기
    useEffect(() => {
        const fetchFeaturedMovies = async () => {
            try {
                const response = await movieAPI.getPopular();
                const movies = response.data.results;
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

    // 자동 슬라이드 (5초마다)
    useEffect(() => {
        if (featuredMovies.length === 0 || isAnimating) return;

        const autoSlide = setInterval(() => {
            handleNext();
        }, 5000);

        return () => clearInterval(autoSlide);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [featuredMovies.length, isAnimating, currentIndex]);

    // 현재 영화가 바뀔 때마다 찜 상태 업데이트
    useEffect(() => {
        if (featuredMovies.length > 0) {
            setIsWished(isInWishlist(featuredMovies[currentIndex].id));
        }
    }, [currentIndex, featuredMovies]);

    const fetchPopular = useCallback(() => movieAPI.getPopular(), []);
    const fetchNowPlaying = useCallback(() => movieAPI.getNowPlaying(), []);
    const fetchUpcoming = useCallback(() => movieAPI.getUpcoming(), []);
    const fetchTopRated = useCallback(() => movieAPI.getTopRated(), []);

    const handleNext = useCallback(() => {
        if (isAnimating) return;

        const newIndex = currentIndex === featuredMovies.length - 1 ? 0 : currentIndex + 1;
        setNextIndex(newIndex);
        setSlideDirection('left');
        setIsAnimating(true);

        setTimeout(() => {
            setCurrentIndex(newIndex);
            setNextIndex(null);
            setSlideDirection('');
            setIsAnimating(false);
        }, 600);
    }, [isAnimating, currentIndex, featuredMovies.length]);

    const goToSlide = (index) => {
        if (isAnimating || index === currentIndex) return;

        const direction = index > currentIndex ? 'left' : 'right';
        setNextIndex(index);
        setSlideDirection(direction);
        setIsAnimating(true);

        setTimeout(() => {
            setCurrentIndex(index);
            setNextIndex(null);
            setSlideDirection('');
            setIsAnimating(false);
        }, 600);
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
    const nextMovie = nextIndex !== null ? featuredMovies[nextIndex] : null;

    return (
        <div className="home">
            <Navbar />

            {/* 메인 배너 캐러셀 */}
            <div className="hero-banner">
                {/* 다음 영화 배경 */}
                {nextMovie && (
                    <div
                        className={`hero-background next-background slide-in-${slideDirection === 'left' ? 'right' : 'left'}`}
                        style={{
                            backgroundImage: `url(${getImageUrl(nextMovie.backdrop_path, 'original')})`
                        }}
                    >
                        <div className="hero-gradient"></div>
                    </div>
                )}

                {/* 현재 영화 배경 */}
                <div
                    className={`hero-background current-background ${slideDirection ? `slide-out-${slideDirection}` : ''}`}
                    style={{
                        backgroundImage: `url(${getImageUrl(currentMovie.backdrop_path, 'original')})`
                    }}
                >
                    <div className="hero-gradient"></div>
                </div>

                {/* 콘텐츠 */}
                <div className={`hero-content ${slideDirection ? `slide-out-${slideDirection}` : ''}`}>
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

                {/* 인디케이터 */}
                <div className="hero-indicators">
                    {featuredMovies.map((_, index) => (
                        <button
                            key={index}
                            className={`indicator ${index === currentIndex ? 'active' : ''}`}
                            onClick={() => goToSlide(index)}
                            aria-label={`${index + 1}번째 영화로 이동`}
                            disabled={isAnimating}
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