// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { isLoggedIn, logout } from './services/auth';
import ProtectedRoute from './components/ProtectedRoute';
import SignIn from './pages/SignIn';
import './App.css';

// 임시 홈 페이지 (나중에 제대로 만들 예정)
function Home() {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/signin');
    };

    return (
        <div className="App">
            <h1>🎬 Netflix 클론 - 메인 페이지</h1>
            <p>로그인 성공! 메인 페이지입니다.</p>
            <button onClick={handleLogout}>
                로그아웃
            </button>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter basename={process.env.PUBLIC_URL}>
            <Routes>
                {/* 로그인 페이지 - 이미 로그인되어 있으면 홈으로 리다이렉트 */}
                <Route
                    path="/signin"
                    element={
                        isLoggedIn() ? <Navigate to="/" replace /> : <SignIn />
                    }
                />

                {/* 메인 페이지 (로그인 필요) */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                />

                {/* 그 외 경로는 메인으로 (로그인 안 되어있으면 자동으로 /signin으로) */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;