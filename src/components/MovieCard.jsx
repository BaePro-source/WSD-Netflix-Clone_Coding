// src/components/MovieCard.jsx
import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../services/api';
import { isInWishlist, toggleWishlist } from '../utils/localStorage';
import '../styles/MovieCard.css';

function MovieCard({ movie }) {
    const { title, poster_path, vote_average, release_date } = movie;
    const [isWished, setIsWished] = useState(false);

    useEffect(() => {
        setIsWished(isInWishlist(movie.id));
    }, [movie.id]);

    const handleWishlistClick = (e) => {
        e.stopPropagation(); // 카드 클릭 이벤트 방지
        toggleWishlist(movie);
        setIsWished(!isWished);
    };

    return (
        <div className="movie-card">
            <button
                className={`wishlist-btn ${isWished ? 'wished' : ''}`}
                onClick={handleWishlistClick}
                title={isWished ? '찜 해제' : '찜하기'}
            >
                {isWished ? '❤️' : '🤍'}
            </button>
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