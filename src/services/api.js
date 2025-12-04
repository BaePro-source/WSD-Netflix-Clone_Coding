// src/services/api.js
import axios from 'axios';

const API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

// Axios 인스턴스 생성
const tmdbApi = axios.create({
    baseURL: BASE_URL,
    params: {
        api_key: API_KEY,
        language: 'ko-KR', // 한국어
    },
});

// TMDB API 엔드포인트들
export const movieAPI = {
    // 인기 영화
    getPopular: (page = 1) =>
        tmdbApi.get('/movie/popular', { params: { page } }),

    // 현재 상영중
    getNowPlaying: (page = 1) =>
        tmdbApi.get('/movie/now_playing', { params: { page } }),

    // 개봉 예정
    getUpcoming: (page = 1) =>
        tmdbApi.get('/movie/upcoming', { params: { page } }),

    // 높은 평점
    getTopRated: (page = 1) =>
        tmdbApi.get('/movie/top_rated', { params: { page } }),

    // 영화 검색
    searchMovies: (query, page = 1) =>
        tmdbApi.get('/search/movie', { params: { query, page } }),

    // 영화 상세 정보
    getMovieDetails: (movieId) =>
        tmdbApi.get(`/movie/${movieId}`),

    // 장르 목록
    getGenres: () =>
        tmdbApi.get('/genre/movie/list'),

    // 장르별 영화 검색
    getMoviesByGenre: (genreId, page = 1) =>
        tmdbApi.get('/discover/movie', { params: { with_genres: genreId, page } }),
};

// 이미지 URL 생성 함수
export const getImageUrl = (path, size = 'w500') => {
    if (!path) return '/placeholder.jpg'; // 이미지 없을 때
    return `https://image.tmdb.org/t/p/${size}${path}`;
};

export default tmdbApi;
