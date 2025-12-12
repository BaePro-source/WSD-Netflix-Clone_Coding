// src/pages/SignIn.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login, register, getRememberedEmail } from '../services/auth';
import { movieAPI, getImageUrl } from '../services/api';
import Toast from '../components/Toast';
import { useToast } from '../hooks/useToast';
import '../styles/SignIn.css';

function SignIn() {
    const navigate = useNavigate();
    const { toasts, showToast, removeToast } = useToast();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        rememberMe: false,
        agreeTerms: false,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [backgroundPosters, setBackgroundPosters] = useState([]);
    const [isSwitching, setIsSwitching] = useState(false);

    // ✅ 배경 포스터 가져오기
    useEffect(() => {
        const fetchBackgroundPosters = async () => {
            try {
                const response = await movieAPI.getPopular(1);
                const posters = response.data.results
                    .slice(0, 20)
                    .map(movie => getImageUrl(movie.poster_path, 'w500'));
                setBackgroundPosters(posters);
            } catch (error) {
                console.error('배경 포스터 로딩 실패:', error);
            }
        };
        fetchBackgroundPosters();
    }, []);

    // Remember Me 확인
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

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
        setError('');
    };

    // ✅ 로그인/회원가입 전환 - Transition 방식
    const toggleMode = () => {
        setIsSwitching(true);

        setTimeout(() => {
            setIsLogin(!isLogin);
            setError('');
            setFormData(prev => ({
                ...prev,
                password: '',
                confirmPassword: '',
                agreeTerms: false,
            }));

            setTimeout(() => {
                setIsSwitching(false);
            }, 50);
        }, 300);
    };

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

            // ✅ alert 대신 Toast 사용
            showToast(result.message, 'success');

            // 약간의 딜레이 후 페이지 이동
            setTimeout(() => {
                navigate('/');
            }, 1000);
        } catch (err) {
            setError(err.message);
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            const errorMsg = '비밀번호가 일치하지 않습니다.';
            setError(errorMsg);
            showToast(errorMsg, 'error');
            return;
        }

        if (!formData.agreeTerms) {
            const errorMsg = '약관에 동의해주세요.';
            setError(errorMsg);
            showToast(errorMsg, 'error');
            return;
        }

        setLoading(true);

        try {
            const result = await register(formData.email, formData.password);

            // ✅ alert 대신 Toast 사용
            showToast(result.message, 'success');

            // 약간의 딜레이 후 로그인 모드로 전환
            setTimeout(() => {
                setIsLogin(true);
                setFormData(prev => ({
                    ...prev,
                    password: '',
                    confirmPassword: '',
                }));
            }, 1000);
        } catch (err) {
            setError(err.message);
            showToast(err.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="signin-container">
            {/* ✅ Toast 렌더링 */}
            {toasts.map(toast => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    type={toast.type}
                    duration={toast.duration}
                    onClose={() => removeToast(toast.id)}
                />
            ))}

            {/* ✅ 배경 포스터 그리드 */}
            <div className="signin-background">
                <div className="poster-grid">
                    {backgroundPosters.map((poster, index) => (
                        <div
                            key={index}
                            className="poster-item"
                            style={{
                                backgroundImage: `url(${poster})`,
                                animationDelay: `${index * 0.1}s`
                            }}
                        />
                    ))}
                </div>
            </div>

            <div className={`signin-box ${isLogin ? 'login-mode' : 'register-mode'} ${isSwitching ? 'mode-switching' : ''}`}>
                <div className="signin-header">
                    <h1>{isLogin ? '로그인' : '회원가입'}</h1>
                    <p>{isLogin ? '로그인하여 계속하기' : '회원가입하고 시작하기'}</p>
                </div>

                <form onSubmit={isLogin ? handleLogin : handleRegister} className="signin-form">
                    {/* ✅ Floating Label 적용 */}
                    <div className="input-group">
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder=" "
                            required
                            disabled={loading}
                        />
                        <label htmlFor="email">이메일</label>
                    </div>

                    <div className="input-group">
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder=" "
                            required
                            disabled={loading}
                            minLength="4"
                        />
                        <label htmlFor="password">비밀번호</label>
                    </div>

                    {!isLogin && (
                        <div className="input-group">
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder=" "
                                required
                                disabled={loading}
                                minLength="4"
                            />
                            <label htmlFor="confirmPassword">비밀번호 확인</label>
                        </div>
                    )}

                    {error && <div className="error-message">{error}</div>}

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

                    <button
                        type="submit"
                        className="submit-btn"
                        disabled={loading}
                    >
                        {loading ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
                    </button>
                </form>

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