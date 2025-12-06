// src/pages/Home.jsx
import React, { useCallback } from 'react';
import Navbar from '../components/Navbar';
import MovieList from '../components/MovieList';
import { movieAPI } from '../services/api';
import '../styles/Home.css';

function Home() {
    // useCallback으로 함수 메모이제이션
    const fetchPopular = useCallback(() => movieAPI.getPopular(), []);
    const fetchNowPlaying = useCallback(() => movieAPI.getNowPlaying(), []);
    const fetchUpcoming = useCallback(() => movieAPI.getUpcoming(), []);
    const fetchTopRated = useCallback(() => movieAPI.getTopRated(), []);

    return (
        <div className="home">
            <Navbar />

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