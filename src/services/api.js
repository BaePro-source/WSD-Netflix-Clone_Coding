// src/services/api.js
import axios from 'axios';
import { getCachedData, setCachedData } from '../utils/localStorage';

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

// ✅ 캐시 적용 래퍼 함수
const withCache = async (cacheKey, apiCall) => {
    // 1. 캐시 확인
    const cached = getCachedData(cacheKey);
    if (cached) {
        console.log(`✅ 캐시 사용: ${cacheKey}`);
        return { data: cached };
    }

    // 2. 캐시 없으면 API 호출
    console.log(`🌐 API 호출: ${cacheKey}`);
    const response = await apiCall();

    // 3. 결과를 캐시에 저장
    setCachedData(cacheKey, response.data);

    return response;
};

// TMDB API 엔드포인트들
export const movieAPI = {
    // 인기 영화 (✅ 캐싱 적용)
    getPopular: (page = 1) =>
        withCache(
            `popular_${page}`,
            () => tmdbApi.get('/movie/popular', { params: { page } })
        ),

    // 현재 상영중 (✅ 캐싱 적용)
    getNowPlaying: (page = 1) =>
        withCache(
            `now_playing_${page}`,
            () => tmdbApi.get('/movie/now_playing', { params: { page } })
        ),

    // 개봉 예정 (✅ 캐싱 적용)
    getUpcoming: (page = 1) =>
        withCache(
            `upcoming_${page}`,
            () => tmdbApi.get('/movie/upcoming', { params: { page } })
        ),

    // 높은 평점 (✅ 캐싱 적용)
    getTopRated: (page = 1) =>
        withCache(
            `top_rated_${page}`,
            () => tmdbApi.get('/movie/top_rated', { params: { page } })
        ),

    // 트렌딩 (✅ 캐싱 적용)
    getTrending: (page = 1) =>
        withCache(
            `trending_${page}`,
            () => tmdbApi.get('/trending/movie/week', { params: { page } })
        ),

    // 영화 검색 (✅ 캐싱 적용)
    searchMovies: (query, page = 1) =>
        withCache(
            `search_${query}_${page}`,
            () => tmdbApi.get('/search/movie', { params: { query, page } })
        ),

    // 영화 상세 정보 (✅ 캐싱 적용)
    getMovieDetails: (movieId) =>
        withCache(
            `movie_${movieId}`,
            () => tmdbApi.get(`/movie/${movieId}`)
        ),

    // 장르 목록 (✅ 캐싱 적용)
    getGenres: () =>
        withCache(
            'genres',
            () => tmdbApi.get('/genre/movie/list')
        ),

    // 장르별 영화 검색 (✅ 캐싱 적용)
    getMoviesByGenre: (genreId, page = 1) =>
        withCache(
            `genre_${genreId}_${page}`,
            () => tmdbApi.get('/discover/movie', { params: { with_genres: genreId, page } })
        ),
};

// 이미지 URL 생성 함수
export const getImageUrl = (path, size = 'w500') => {
    if (!path) return '/placeholder.jpg'; // 이미지 없을 때
    return `https://image.tmdb.org/t/p/${size}${path}`;
};

export default tmdbApi;
