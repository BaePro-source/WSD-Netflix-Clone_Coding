// src/utils/localStorage.js

// 위시리스트 관리
export const getWishlist = () => {
    try {
        const wishlist = localStorage.getItem('wishlist');
        return wishlist ? JSON.parse(wishlist) : [];
    } catch (error) {
        console.error('위시리스트 불러오기 실패:', error);
        return [];
    }
};

export const toggleWishlist = (movieOrId) => {
    // ✅ movie 객체 또는 ID 처리
    if (!movieOrId) {
        console.error('유효하지 않은 영화 데이터:', movieOrId);
        return;
    }

    const wishlist = getWishlist();

    // ✅ movieOrId가 숫자면 ID로, 객체면 movie로 처리
    const movieId = typeof movieOrId === 'number' ? movieOrId : movieOrId.id;
    const movieData = typeof movieOrId === 'object' ? movieOrId : null;

    const existingIndex = wishlist.findIndex(item => item.id === movieId);

    if (existingIndex !== -1) {
        // 이미 있으면 제거
        wishlist.splice(existingIndex, 1);
    } else {
        // 없으면 추가 (객체인 경우만)
        if (movieData) {
            wishlist.push(movieData);
        }
    }

    localStorage.setItem('wishlist', JSON.stringify(wishlist));
};

export const isInWishlist = (movieId) => {
    const wishlist = getWishlist();
    return wishlist.some(movie => movie.id === movieId);
};

export const removeFromWishlist = (movieId) => {
    const wishlist = getWishlist();
    const filtered = wishlist.filter(movie => movie.id !== movieId);
    localStorage.setItem('wishlist', JSON.stringify(filtered));
};

// 검색 기록 관리
export const getSearchHistory = () => {
    try {
        const history = localStorage.getItem('searchHistory');
        return history ? JSON.parse(history) : [];
    } catch (error) {
        console.error('검색 기록 불러오기 실패:', error);
        return [];
    }
};

export const addToSearchHistory = (query) => {
    const history = getSearchHistory();

    // 중복 제거
    const filtered = history.filter(item => item !== query);

    // 최신 검색어를 맨 앞에 추가
    filtered.unshift(query);

    // 최대 10개까지만 저장
    const limited = filtered.slice(0, 10);

    localStorage.setItem('searchHistory', JSON.stringify(limited));
};

export const clearSearchHistory = () => {
    localStorage.removeItem('searchHistory');
};

// 사용자 설정 관리
export const getUserPreferences = () => {
    try {
        const prefs = localStorage.getItem('userPreferences');
        return prefs ? JSON.parse(prefs) : {};
    } catch (error) {
        console.error('사용자 설정 불러오기 실패:', error);
        return {};
    }
};

export const setUserPreference = (key, value) => {
    const prefs = getUserPreferences();
    prefs[key] = value;
    localStorage.setItem('userPreferences', JSON.stringify(prefs));
};