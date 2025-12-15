// src/services/auth.js
import { movieAPI } from './api';

// 사용자 데이터를 localStorage에서 가져오기
const getUsersFromStorage = () => {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
};

// 사용자 데이터를 localStorage에 저장하기
const saveUsersToStorage = (users) => {
    localStorage.setItem('users', JSON.stringify(users));
};

// 이메일 형식 검증
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// 회원가입
export const register = async (email, password) => {
    // 이메일 형식 검증
    if (!isValidEmail(email)) {
        throw new Error('올바른 이메일 형식이 아닙니다.');
    }

    // 비밀번호 길이 검증
    if (password.length < 4) {
        throw new Error('비밀번호는 최소 4자 이상이어야 합니다.');
    }

    const users = getUsersFromStorage();

    // 중복 이메일 체크
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
        throw new Error('이미 존재하는 이메일입니다.');
    }

    // 실제로는 API 호출 테스트
    try {
        await movieAPI.getPopular();

        // 새 사용자 추가
        const newUser = {
            email,
            password, // 실제로는 암호화해야 하지만 과제이므로 평문 저장
            createdAt: new Date().toISOString(),
        };

        users.push(newUser);
        saveUsersToStorage(users);

        return { success: true, message: '회원가입이 완료되었습니다!' };
    } catch (error) {
        throw new Error('API Key가 유효하지 않습니다.');
    }
};

// 로그인
export const login = async (email, password, rememberMe = false) => {
    // 이메일 형식 검증
    if (!isValidEmail(email)) {
        throw new Error('올바른 이메일 형식이 아닙니다.');
    }

    const users = getUsersFromStorage();

    // 사용자 찾기
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
        throw new Error('이메일 또는 비밀번호가 일치하지 않습니다.');
    }

    // 로그인 정보 저장
    const loginData = {
        email: user.email,
        isLoggedIn: true,
        loginTime: new Date().toISOString(),
    };

    localStorage.setItem('currentUser', JSON.stringify(loginData));

    // Remember Me 처리
    if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('savedEmail', email);
    } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('savedEmail');
    }

    return { success: true, message: '로그인 성공!', user: loginData };
};

// 로그아웃
export const logout = () => {
    localStorage.removeItem('currentUser');
    return { success: true, message: '로그아웃되었습니다.' };
};

// 현재 로그인된 사용자 확인
export const getCurrentUser = () => {
    const currentUser = localStorage.getItem('currentUser');
    return currentUser ? JSON.parse(currentUser) : null;
};

// 로그인 여부 확인
export const isLoggedIn = () => {
    return getCurrentUser() !== null;
};

// Remember Me 정보 가져오기
export const getRememberedEmail = () => {
    const rememberMe = localStorage.getItem('rememberMe');
    const savedEmail = localStorage.getItem('savedEmail');

    if (rememberMe === 'true' && savedEmail) {
        return savedEmail;
    }
    return '';
};
