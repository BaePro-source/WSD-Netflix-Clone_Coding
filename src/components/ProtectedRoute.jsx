// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { isLoggedIn } from '../services/auth';

function ProtectedRoute({ children }) {
    // 로그인 여부 확인
    if (!isLoggedIn()) {
        // 로그인되지 않았다면 /signin으로 리다이렉트
        return <Navigate to="/signin" replace />;
    }

    // 로그인되었다면 요청한 페이지 렌더링
    return children;
}

export default ProtectedRoute;