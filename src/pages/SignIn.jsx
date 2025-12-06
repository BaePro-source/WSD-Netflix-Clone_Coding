// src/pages/SignIn.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, getRememberedEmail } from '../services/auth';
import '../styles/SignIn.css';

function SignIn() {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true); // true: 로그인, false: 회원가입
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        rememberMe: false,
        agreeTerms: false,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // 컴포넌트 마운트 시 Remember Me 확인
    useEffect(() => {
        const rememberedEmail = getRememberedEmail();
        if (rememberedEmail) {
            setFormData(prev => ({
                ...prev,
                email: rememberedEmail,
                rememberMe: true,
            }));
        }
    }, []);

    // 입력 변경 핸들러
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        setError(''); // 에러 초기화
    };

    // 로그인/회원가입 전환
    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError('');
        setFormData(prev => ({
            ...prev,
            password: '',
            confirmPassword: '',
            agreeTerms: false,
        }));
    };

    // 로그인 처리
    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(
                formData.email,
                formData.password,
                formData.rememberMe
            );

            alert(result.message);
            navigate('/'); // 메인 페이지로 이동
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // 회원가입 처리
    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        // 비밀번호 확인
        if (formData.password !== formData.confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        // 약관 동의 확인
        if (!formData.agreeTerms) {
            setError('약관에 동의해주세요.');
            return;
        }

        setLoading(true);

        try {
            const result = await register(formData.email, formData.password);
            alert(result.message);

            // 회원가입 성공 시 로그인 모드로 전환
            setIsLogin(true);
            setFormData(prev => ({
                ...prev,
                password: '',
                confirmPassword: '',
            }));
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signin-container">
            <div className="signin-background"></div>

            <div className={`signin-box ${isLogin ? 'login-mode' : 'register-mode'}`}>
                <div className="signin-header">
                    <h1>🎬 Netflix 클론</h1>
                    <p>{isLogin ? '로그인하여 계속하기' : '회원가입하고 시작하기'}</p>
                </div>

                <form onSubmit={isLogin ? handleLogin : handleRegister} className="signin-form">
                    {/* 이메일 입력 */}
                    <div className="input-group">
                        <label htmlFor="email">이메일</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="example@email.com"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* 비밀번호 입력 */}
                    <div className="input-group">
                        <label htmlFor="password">비밀번호</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="비밀번호를 입력하세요"
                            required
                            disabled={loading}
                            minLength="4"
                        />
                    </div>

                    {/* 회원가입 모드: 비밀번호 확인 */}
                    {!isLogin && (
                        <div className="input-group">
                            <label htmlFor="confirmPassword">비밀번호 확인</label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder="비밀번호를 다시 입력하세요"
                                required
                                disabled={loading}
                                minLength="4"
                            />
                        </div>
                    )}

                    {/* 에러 메시지 */}
                    {error && <div className="error-message">{error}</div>}

                    {/* 로그인 모드: Remember Me */}
                    {isLogin && (
                        <div className="checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                    disabled={loading}
                                />
                                <span>로그인 상태 유지</span>
                            </label>
                        </div>
                    )}

                    {/* 회원가입 모드: 약관 동의 */}
                    {!isLogin && (
                        <div className="checkbox-group">
                            <label>
                                <input
                                    type="checkbox"
                                    name="agreeTerms"
                                    checked={formData.agreeTerms}
                                    onChange={handleChange}
                                    disabled={loading}
                                    required
                                />
                                <span>이용약관 및 개인정보 처리방침에 동의합니다 (필수)</span>
                            </label>
                        </div>
                    )}

                    {/* 제출 버튼 */}
                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
                    </button>
                </form>

                {/* 모드 전환 버튼 */}
                <div className="toggle-mode">
                    <p>
                        {isLogin ? '아직 회원이 아니신가요?' : '이미 계정이 있으신가요?'}
                    </p>
                    <button
                        type="button"
                        onClick={toggleMode}
                        className="toggle-btn"
                        disabled={loading}
                    >
                        {isLogin ? '회원가입' : '로그인'}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default SignIn;