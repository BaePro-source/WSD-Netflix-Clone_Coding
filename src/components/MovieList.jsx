// src/components/MovieList.jsx
import React, { useState, useEffect } from 'react';
import MovieCard from './MovieCard';
import { toggleWishlist } from '../utils/localStorage'; // ✅ import 추가
import '../styles/MovieList.css';

function MovieList({ title, fetchMovies }) {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [wishlistUpdate, setWishlistUpdate] = useState(0); // ✅ 찜 상태 업데이트용

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

    // ✅ Bottom-Up: 자식(MovieCard)으로부터 받은 이벤트 처리
    const handleWishlistToggle = (movie) => {
        console.log('MovieList에서 찜하기 이벤트 받음:', movie.title);
        toggleWishlist(movie);
        setWishlistUpdate(prev => prev + 1); // 강제 리렌더링
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
                <div className="movie-list">
                    {movies.map((movie) => (
                        /* ✅ Bottom-Up: 콜백 prop 전달 */
                        <MovieCard
                            key={movie.id}
                            movie={movie}
                            onWishlistToggle={handleWishlistToggle}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MovieList;