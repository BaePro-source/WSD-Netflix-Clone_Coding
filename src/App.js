// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isLoggedIn } from './services/auth';
import SignIn from './pages/SignIn';
import './App.css';

// 로그인 필요한 페이지 보호
function ProtectedRoute({ children }) {
    if (!isLoggedIn()) {
        return <Navigate to="/signin" replace />;
    }
    return children;
}

// 임시 홈 페이지 (나중에 제대로 만들 예정)
function Home() {
    return (
        <div className="App">
            <h1>🎬 Netflix 클론 - 메인 페이지</h1>
            <p>로그인 성공! 메인 페이지입니다.</p>
            <button onClick={() => {
                localStorage.removeItem('currentUser');
                window.location.href = '/signin';
            }}>
                로그아웃
            </button>
        </div>
    );
}

function App() {
    return (
        <BrowserRouter basename={process.env.PUBLIC_URL}>
            <Routes>
                {/* 로그인 페이지 */}
                <Route path="/signin" element={<SignIn />} />

                {/* 메인 페이지 (로그인 필요) */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    }
                />

                {/* 그 외 경로는 로그인으로 */}
                <Route path="*" element={<Navigate to="/signin" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;