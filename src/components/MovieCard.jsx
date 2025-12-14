// src/components/MovieCard.jsx
import React, { useState, useEffect } from 'react';
import { getImageUrl } from '../services/api';
import { isInWishlist } from '../utils/localStorage';
import '../styles/MovieCard.css';

// 장르 ID to 이름 매핑 (TMDB 공식)
const GENRES = {
    28: '액션',
    12: '모험',
    16: '애니메이션',
    35: '코미디',
    80: '범죄',
    99: '다큐멘터리',
    18: '드라마',
    10751: '가족',
    14: '판타지',
    36: '역사',
    27: '공포',
    10402: '음악',
    9648: '미스터리',
    10749: '로맨스',
    878: 'SF',
    10770: 'TV 영화',
    53: '스릴러',
    10752: '전쟁',
    37: '서부'
};

function MovieCard({ movie, onWishlistToggle }) {
    const { title, poster_path, vote_average, release_date, overview, genre_ids } = movie;
    const [isWished, setIsWished] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false); // ✅ 이미지 로딩 상태 추가

    useEffect(() => {
        setIsWished(isInWishlist(movie.id));
    }, [movie.id]);

    const handleWishlistClick = (e) => {
        e.stopPropagation();

        if (onWishlistToggle) {
            onWishlistToggle(movie);
        }

        setIsWished(!isWished);
    };

    // 장르 이름 가져오기 (최대 2개)
    const getGenreNames = () => {
        if (!genre_ids || genre_ids.length === 0) return null;
        return genre_ids
            .slice(0, 2)
            .map(id => GENRES[id])
            .filter(Boolean)
            .join(', ');
    };

    const genreNames = getGenreNames();

    return (
        <div className="movie-card">
            {/* 포스터 영역 */}
            <div className="movie-poster-wrapper">
                {/* ✅ 로딩 중일 때 스켈레톤 표시 */}
                {!imageLoaded && (
                    <div className="movie-poster-skeleton">
                        <div className="skeleton-shimmer"></div>
                    </div>
                )}

                {/* ✅ 이미지 로드 완료 시 loaded 클래스 추가 + lazy loading */}
                <img
                    src={getImageUrl(poster_path, 'w500')}
                    alt={title}
                    className={`movie-poster ${imageLoaded ? 'loaded' : 'loading'}`}
                    onLoad={() => setImageLoaded(true)} // ✅ 로드 완료 시 상태 변경
                    loading="lazy" // ✅ 브라우저 네이티브 lazy loading
                    onError={(e) => {
                        e.target.src = '/placeholder.png';
                        setImageLoaded(true); // 에러여도 스켈레톤 숨김
                    }}
                />

                {/* 찜하기 버튼 - 항상 표시 */}
                <button
                    className={`wishlist-btn ${isWished ? 'wished' : ''}`}
                    onClick={handleWishlistClick}
                    title={isWished ? '찜 해제' : '찜하기'}
                    aria-label={isWished ? '찜 목록에서 제거' : '찜 목록에 추가'} // ✅ 접근성 개선
                >
                    {isWished ? '❤️' : '🤍'}
                </button>
            </div>

            {/* Hover 시 나타나는 영화 정보 오버레이 */}
            <div className="movie-info-overlay">
                <div className="movie-info-content">
                    <h3 className="movie-title">{title}</h3>

                    <div className="movie-meta">
                        <span className="movie-rating">⭐ {vote_average?.toFixed(1)}</span>
                        <span className="movie-year">
                            {release_date ? new Date(release_date).getFullYear() : 'N/A'}
                        </span>
                    </div>

                    {/* 장르 배지 */}
                    {genreNames && (
                        <div className="movie-genres">
                            <span className="genre-badge">{genreNames}</span>
                        </div>
                    )}

                    {/* 줄거리 */}
                    {overview && (
                        <p className="movie-overview">
                            {overview.length > 120
                                ? `${overview.substring(0, 120)}...`
                                : overview}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

export default React.memo(MovieCard); // ✅ 성능 최적화