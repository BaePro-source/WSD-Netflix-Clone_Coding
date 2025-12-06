// src/components/MovieList.jsx
import React, { useState, useEffect } from 'react';
import MovieCard from './MovieCard';
import '../styles/MovieList.css';

function MovieList({ title, fetchMovies }) {
    const [movies, setMovies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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
    }, [fetchMovies]); // ✅ fetchMovies 추가

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
                        <MovieCard key={movie.id} movie={movie} />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default MovieList;