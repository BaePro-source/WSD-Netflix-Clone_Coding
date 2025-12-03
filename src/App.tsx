import React, { useEffect, useState } from 'react';
import { getNetflixMovies, Movie } from './api/tmdb';
import './App.css';

function App() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');

    useEffect(() => {
        const fetchMovies = async () => {
            try {
                console.log('🎬 영화 데이터 가져오는 중...');
                const data = await getNetflixMovies();
                console.log('✅ 영화 데이터 받음:', data);

                if (data && Array.isArray(data) && data.length > 0) {
                    setMovies(data);
                } else {
                    setError('영화 데이터가 없습니다');
                }
            } catch (err) {
                console.error('❌ 에러 발생:', err);
                setError('영화를 불러오는데 실패했습니다');
            } finally {
                setLoading(false);
            }
        };

        fetchMovies();
    }, []);

    if (loading) {
        return (
            <div className="App">
                <h1>Netflix 클론</h1>
                <p>로딩 중...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="App">
                <h1>Netflix 클론</h1>
                <p style={{ color: 'red' }}>에러: {error}</p>
                <p>콘솔(F12)을 확인해주세요.</p>
            </div>
        );
    }

    return (
        <div className="App">
            <header className="App-header">
                <h1>🎬 Netflix 클론</h1>
                <p>총 {movies.length}개의 영화</p>
            </header>

            <main className="movie-container">
                {movies.map((movie) => (
                    <div key={movie.id} className="movie-card">
                        {movie.poster_path ? (
                            <img
                                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                                alt={movie.title}
                                className="movie-poster"
                            />
                        ) : (
                            <div className="no-poster">이미지 없음</div>
                        )}
                        <div className="movie-info">
                            <h3>{movie.title}</h3>
                            <p>⭐ {movie.vote_average.toFixed(1)}</p>
                            <p className="release-date">{movie.release_date}</p>
                        </div>
                    </div>
                ))}
            </main>
        </div>
    );
}

export default App;