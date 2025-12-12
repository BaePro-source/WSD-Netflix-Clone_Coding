// src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { isLoggedIn } from './services/auth';
import ProtectedRoute from './components/ProtectedRoute';
import SignIn from './pages/SignIn';
import Home from './pages/Home';
import Popular from './pages/Popular';
import Search from './pages/Search';
import Wishlist from './pages/Wishlist';
import './App.css';

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

                {/* Popular 페이지 (로그인 필요) */}
                <Route
                    path="/popular"
                    element={
                        <ProtectedRoute>
                            <Popular />
                        </ProtectedRoute>
                    }
                />

                {/* Search 페이지 (로그인 필요) */}
                <Route
                    path="/search"
                    element={
                        <ProtectedRoute>
                            <Search />
                        </ProtectedRoute>
                    }
                />

                {/* Wishlist 페이지 (로그인 필요) */}
                <Route
                    path="/wishlist"
                    element={
                        <ProtectedRoute>
                            <Wishlist />
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