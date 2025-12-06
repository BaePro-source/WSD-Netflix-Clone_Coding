// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isLoggedIn } from './services/auth';
import SignIn from './pages/SignIn';
import Home from './pages/Home';
import Popular from './pages/Popular';
import Wishlist from './pages/Wishlist';  // ✅ Wishlist import
import './App.css';

// 로그인 필요한 페이지 보호
function ProtectedRoute({ children }) {
    if (!isLoggedIn()) {
        return <Navigate to="/signin" replace />;
    }
    return children;
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

                {/* 인기 영화 페이지 (로그인 필요) */}
                <Route
                    path="/popular"
                    element={
                        <ProtectedRoute>
                            <Popular />
                        </ProtectedRoute>
                    }
                />

                {/* 찜한 콘텐츠 페이지 (로그인 필요) */}
                <Route
                    path="/wishlist"
                    element={
                        <ProtectedRoute>
                            <Wishlist />
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