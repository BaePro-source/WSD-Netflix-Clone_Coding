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

// ==================== 추가 기능들 ====================

// 스토리지 키 상수
const STORAGE_KEYS = {
    WISHLIST: 'wishlist',
    SEARCH_HISTORY: 'searchHistory',
    USER_PREFERENCES: 'userPreferences',
    CACHE: 'jflix_cache',
    VERSION: 'jflix_version'
};

const CURRENT_VERSION = '1.0.0';
const CACHE_EXPIRY = 1000 * 60 * 30; // 30분

// ==================== 1. 데이터 버전 관리 ====================
export const checkStorageVersion = () => {
    try {
        const version = localStorage.getItem(STORAGE_KEYS.VERSION);

        if (!version) {
            // 첫 사용 - 버전 설정
            localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
            console.log('Storage initialized with version:', CURRENT_VERSION);
        } else if (version !== CURRENT_VERSION) {
            // 버전 업데이트 필요
            console.log('Migrating storage from', version, 'to', CURRENT_VERSION);
            migrateStorageData(version, CURRENT_VERSION);
            localStorage.setItem(STORAGE_KEYS.VERSION, CURRENT_VERSION);
        }
    } catch (error) {
        console.error('버전 체크 실패:', error);
    }
};

const migrateStorageData = (oldVersion, newVersion) => {
    // 필요시 데이터 구조 변경 처리
    console.log('데이터 마이그레이션 완료');
};

// ==================== 2. 출시예정일 영화 목록 관리 (Wishlist 개선) ====================
// 기존 toggleWishlist를 개선
export const addToWishlistWithMetadata = (movie) => {
    try {
        const wishlist = getWishlist();
        const exists = wishlist.some(item => item.id === movie.id);

        if (!exists) {
            const movieWithMetadata = {
                ...movie,
                addedAt: new Date().toISOString(),
                addedDate: new Date().toLocaleDateString('ko-KR'),
                timestamp: Date.now()
            };
            wishlist.push(movieWithMetadata);
            localStorage.setItem(STORAGE_KEYS.WISHLIST, JSON.stringify(wishlist));
            return true;
        }
        return false;
    } catch (error) {
        console.error('위시리스트 추가 실패:', error);
        handleStorageError(error);
        return false;
    }
};

// 추가된 날짜별로 정렬된 위시리스트
export const getWishlistByDate = (sortOrder = 'desc') => {
    const wishlist = getWishlist();
    return wishlist.sort((a, b) => {
        const timeA = a.timestamp || 0;
        const timeB = b.timestamp || 0;
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
    });
};

// ==================== 3. API 데이터 캐싱 ====================
export const getCachedData = (key) => {
    try {
        const cache = localStorage.getItem(STORAGE_KEYS.CACHE);
        if (!cache) return null;

        const cacheData = JSON.parse(cache);
        const item = cacheData[key];

        if (!item) return null;

        // 만료 시간 체크
        const now = Date.now();
        if (now - item.timestamp > CACHE_EXPIRY) {
            // 만료된 캐시 삭제
            delete cacheData[key];
            localStorage.setItem(STORAGE_KEYS.CACHE, JSON.stringify(cacheData));
            return null;
        }

        return item.data;
    } catch (error) {
        console.error('캐시 불러오기 실패:', error);
        return null;
    }
};

export const setCachedData = (key, data) => {
    try {
        const cache = localStorage.getItem(STORAGE_KEYS.CACHE);
        const cacheData = cache ? JSON.parse(cache) : {};

        cacheData[key] = {
            data: data,
            timestamp: Date.now()
        };

        localStorage.setItem(STORAGE_KEYS.CACHE, JSON.stringify(cacheData));
    } catch (error) {
        console.error('캐시 저장 실패:', error);
        handleStorageError(error);
    }
};

// ==================== 4. 데이터 만료 시간 관리 ====================
export const clearExpiredCache = () => {
    try {
        const cache = localStorage.getItem(STORAGE_KEYS.CACHE);
        if (!cache) return;

        const cacheData = JSON.parse(cache);
        const now = Date.now();
        let cleaned = false;

        Object.keys(cacheData).forEach(key => {
            if (now - cacheData[key].timestamp > CACHE_EXPIRY) {
                delete cacheData[key];
                cleaned = true;
            }
        });

        if (cleaned) {
            localStorage.setItem(STORAGE_KEYS.CACHE, JSON.stringify(cacheData));
            console.log('만료된 캐시 정리 완료');
        }
    } catch (error) {
        console.error('캐시 정리 실패:', error);
    }
};

// 오래된 검색 기록 삭제 (7일 이상)
export const cleanOldSearchHistory = () => {
    try {
        const history = getSearchHistory();
        const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

        const filtered = history.filter(item => {
            if (typeof item === 'object' && item.timestamp) {
                return item.timestamp > sevenDaysAgo;
            }
            return true; // 기존 형식 유지
        });

        localStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(filtered));
    } catch (error) {
        console.error('검색 기록 정리 실패:', error);
    }
};

// ==================== 5. 스토리지 용량 초과 처리 (폴백) ====================
export const handleStorageError = (error) => {
    if (error.name === 'QuotaExceededError' || error.code === 22) {
        console.warn('로컬 스토리지 용량 초과! 오래된 데이터 정리 중...');

        // 1. 만료된 캐시 삭제
        clearExpiredCache();

        // 2. 오래된 검색 기록 삭제
        cleanOldSearchHistory();

        // 3. 캐시 전체 삭제 (최후의 수단)
        localStorage.removeItem(STORAGE_KEYS.CACHE);

        alert('저장 공간이 부족하여 오래된 데이터를 정리했습니다.');
    }
};

// 스토리지 사용량 체크
export const getStorageInfo = () => {
    try {
        let totalSize = 0;
        const details = {};

        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                const size = (localStorage[key].length * 2) / 1024; // KB
                details[key] = size.toFixed(2) + ' KB';
                totalSize += size;
            }
        }

        return {
            total: totalSize.toFixed(2) + ' KB',
            details: details,
            limit: '5-10 MB (브라우저마다 다름)'
        };
    } catch (error) {
        console.error('스토리지 정보 조회 실패:', error);
        return null;
    }
};

// 전체 스토리지 초기화 (개발용)
export const clearAllStorage = () => {
    if (window.confirm('모든 저장된 데이터를 삭제하시겠습니까?')) {
        localStorage.clear();
        console.log('모든 스토리지 데이터 삭제 완료');
        window.location.reload();
    }
};

// ==================== 초기화 ====================
// 앱 시작 시 자동 실행
checkStorageVersion();
clearExpiredCache();