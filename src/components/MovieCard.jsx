// src/components/MovieCard.jsx
import React from 'react';
import { getImageUrl } from '../services/api';
import '../styles/MovieCard.css';

function MovieCard({ movie }) {
    const { title, poster_path, vote_average, release_date } = movie;

    return (
        <div className="movie-card">
            <img
                src={getImageUrl(poster_path)}
                alt={title}
                className="movie-poster"
            />
            <div className="movie-info">
                <h3 className="movie-title">{title}</h3>
                <div className="movie-details">
                    <span className="movie-rating">⭐ {vote_average?.toFixed(1)}</span>
                    <span className="movie-year">
                        {release_date?.split('-')[0]}
                    </span>
                </div>
            </div>
        </div>
    );
}

export default MovieCard;