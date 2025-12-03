const API_TOKEN = process.env.REACT_APP_TMDB_API_KEY || '';
const BASE_URL = 'https://api.themoviedb.org/3';

export interface Movie {
    id: number;
    title: string;
    poster_path: string;
    backdrop_path: string;
    overview: string;
    vote_average: number;
    release_date: string;
}

// Bearer Token을 사용하는 fetch 함수
const fetchWithBearer = async (url: string) => {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${API_TOKEN}`,
            'accept': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
};

export const getNetflixMovies = async (page = 1): Promise<Movie[]> => {
    const url = `${BASE_URL}/discover/movie?include_adult=false&include_video=false&language=ko&page=${page}&sort_by=popularity.desc&with_watch_providers=8&watch_region=KR`;

    const data = await fetchWithBearer(url);

    return data.results || [];
};

export const getPopularMovies = async (): Promise<Movie[]> => {
    const url = `${BASE_URL}/movie/popular?include_adult=false&include_video=false&language=ko&page=1&sort_by=popularity.desc`;
    const data = await fetchWithBearer(url);
    return data.results || [];
};

export const getMovieDetails = async (movieId: number): Promise<Movie> => {
    const url = `${BASE_URL}/movie/${movieId}?language=ko`;
    const data = await fetchWithBearer(url);
    return data;
};