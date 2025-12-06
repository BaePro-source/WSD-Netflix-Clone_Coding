// src/utils/localStorage.js

// 찜한 영화 목록 가져오기
export const getWishlist = () => {
    const wishlist = localStorage.getItem('wishlist');
    return wishlist ? JSON.parse(wishlist) : [];
};

// 찜한 영화 목록 저장하기
export const saveWishlist = (wishlist) => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
};

// 영화를 찜 목록에 추가
export const addToWishlist = (movie) => {
    const wishlist = getWishlist();

    // 중복 체크
    const exists = wishlist.some(item => item.id === movie.id);
    if (exists) {
        return { success: false, message: '이미 찜한 영화입니다.' };
    }

    wishlist.push({
        id: movie.id,
        title: movie.title,
        poster_path: movie.poster_path,
        vote_average: movie.vote_average,
        release_date: movie.release_date,
        addedAt: new Date().toISOString(),
    });

    saveWishlist(wishlist);
    return { success: true, message: '찜 목록에 추가되었습니다!' };
};

// 영화를 찜 목록에서 제거
export const removeFromWishlist = (movieId) => {
    const wishlist = getWishlist();
    const filteredWishlist = wishlist.filter(item => item.id !== movieId);

    saveWishlist(filteredWishlist);
    return { success: true, message: '찜 목록에서 제거되었습니다.' };
};

// 영화가 찜 목록에 있는지 확인
export const isInWishlist = (movieId) => {
    const wishlist = getWishlist();
    return wishlist.some(item => item.id === movieId);
};

// 찜 목록 토글 (있으면 제거, 없으면 추가)
export const toggleWishlist = (movie) => {
    if (isInWishlist(movie.id)) {
        return removeFromWishlist(movie.id);
    } else {
        return addToWishlist(movie);
    }
};

// 최근 검색어 저장 (최대 10개)
export const saveSearchHistory = (query) => {
    if (!query || query.trim() === '') return;

    let history = getSearchHistory();

    // 중복 제거
    history = history.filter(item => item !== query);

    // 맨 앞에 추가
    history.unshift(query);

    // 최대 10개만 유지
    if (history.length > 10) {
        history = history.slice(0, 10);
    }

    localStorage.setItem('searchHistory', JSON.stringify(history));
};

// 검색 기록 가져오기
export const getSearchHistory = () => {
    const history = localStorage.getItem('searchHistory');
    return history ? JSON.parse(history) : [];
};

// 검색 기록 삭제
export const clearSearchHistory = () => {
    localStorage.removeItem('searchHistory');
};

// 사용자 선호 설정 저장
export const saveUserPreferences = (preferences) => {
    const current = getUserPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem('userPreferences', JSON.stringify(updated));
};

// 사용자 선호 설정 가져오기
export const getUserPreferences = () => {
    const prefs = localStorage.getItem('userPreferences');
    return prefs ? JSON.parse(prefs) : {
        theme: 'dark',
        language: 'ko',
        autoPlay: true,
    };
};
