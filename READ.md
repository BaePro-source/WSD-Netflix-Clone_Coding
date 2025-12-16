# JFLIX 🎬

Netflix 스타일의 영화 정보 웹 애플리케이션

TMDB(The Movie Database) API를 활용하여 최신 영화 정보를 제공하는 반응형 웹사이트입니다.

![JFLIX](https://img.shields.io/badge/React-18.3.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)

## 📋 프로젝트 개요

- **프로젝트명**: JFLIX
- **개발 기간**: 2025.12
- **배포 URL**: [https://baepro-source.github.io/WSD-Netflix-Clone_Coding/](https://baepro-source.github.io/WSD-Netflix-Clone_Coding/)
- **GitHub Repository**: [https://github.com/BaePro-source/WSD-Netflix-Clone_Coding](https://github.com/BaePro-source/WSD-Netflix-Clone_Coding)

## ✨ 주요 기능

### 1. 사용자 인증
- 로그인/회원가입 기능
- localStorage 기반 인증 관리
- 보호된 라우트 (Private Route)

### 2. 영화 정보 제공
- **홈 페이지**: Hero 배너 캐러셀, 7개 카테고리별 영화 목록
- **대세 콘텐츠**: 인기 영화 무한 스크롤 & 테이블 뷰
- **검색 기능**: 실시간 영화 검색 및 무한 스크롤
- **찜 목록**: 사용자가 찜한 영화 관리

### 3. 반응형 디자인
- 모바일, 태블릿, 데스크톱 대응
- 햄버거 메뉴 (모바일)
- 미디어 쿼리 기반 레이아웃 최적화

### 4. UX/UI 개선
- Lazy Loading & Skeleton UI
- 스크롤 기반 Navbar 스타일 변경
- 부드러운 애니메이션 및 트랜지션
- Netflix 스타일 다크 테마

## 🛠 기술 스택

### Frontend
- **React** 18.3.1
- **React Router DOM** 7.1.1
- **Axios** 1.7.9

### Styling
- CSS3 (Grid, Flexbox)
- 반응형 디자인 (Media Queries)

### API
- TMDB (The Movie Database) API
- 한국어(ko-KR) 응답 설정

### 배포
- GitHub Pages
- gh-pages 패키지

### 개발 도구
- WebStorm IDE
- Git & GitHub (Gitflow 전략)
- npm (패키지 관리)

## 📦 설치 및 실행

### 1. 저장소 클론
```bash
git clone https://github.com/BaePro-source/WSD-Netflix-Clone_Coding.git
cd WSD-Netflix-Clone_Coding
```

### 2. 의존성 설치
```bash
npm install
```

### 3. 환경 변수 설정
프로젝트 루트에 `.env` 파일 생성:
```env
REACT_APP_TMDB_API_KEY=your_api_key_here
```

### 4. 개발 서버 실행
```bash
npm start
```
- 브라우저에서 `http://localhost:3000` 자동 실행

### 5. 프로덕션 빌드
```bash
npm run build
```

### 6. 배포 (GitHub Pages)
```bash
npm run build
npx gh-pages -d build
```

## 📁 프로젝트 구조
```
WSD-Netflix-Clone_Coding/
├── public/
│   ├── index.html
│   └── favicon.ico
├── src/
│   ├── components/          # 재사용 가능한 컴포넌트
│   │   ├── Navbar.jsx
│   │   ├── MovieCard.jsx
│   │   ├── MovieList.jsx
│   │   └── PrivateRoute.jsx
│   ├── pages/              # 페이지 컴포넌트
│   │   ├── Home.jsx
│   │   ├── Popular.jsx
│   │   ├── Search.jsx
│   │   ├── Wishlist.jsx
│   │   └── SignIn.jsx
│   ├── services/           # API 및 인증 서비스
│   │   ├── api.js
│   │   └── auth.js
│   ├── utils/              # 유틸리티 함수
│   │   └── localStorage.js
│   ├── styles/             # CSS 파일
│   │   ├── Home.css
│   │   ├── Navbar.css
│   │   ├── Popular.css
│   │   ├── Search.css
│   │   ├── Wishlist.css
│   │   └── SignIn.css
│   ├── App.jsx
│   ├── App.css
│   └── index.js
├── package.json
├── .gitignore
└── README.md
```

## 🎯 주요 페이지

### 🏠 Home (`/`)
- Hero 배너 캐러셀 (5개 영화 자동 슬라이드)
- 7개 카테고리별 영화 목록
    - 🔥 인기 영화
    - 🎬 현재 상영중
    - 🎉 개봉 예정
    - ⭐ 높은 평점
    - 🎭 액션 & 스릴러
    - 💕 로맨스 & 드라마
    - 🌟 다시 보기 추천

### 🔥 Popular (`/popular`)
- 무한 스크롤 뷰 / 테이블 뷰 전환
- 페이지네이션 (테이블 뷰)
- 인기 영화 목록 제공

### 🔍 Search (`/search`)
- 실시간 영화 검색
- 무한 스크롤
- 검색 히스토리 저장 (localStorage)

### ❤️ Wishlist (`/wishlist`)
- 찜한 영화 목록
- 추가/삭제 기능
- localStorage 기반 데이터 저장

### 🔐 SignIn (`/signin`)
- 로그인 / 회원가입
- 간단한 유효성 검사
- localStorage 기반 인증

## 🔑 주요 기능 구현

### 1. TMDB API 연동
```javascript
// src/services/api.js
export const movieAPI = {
  getPopular: (page = 1) => api.get('/movie/popular', { params: { page } }),
  getNowPlaying: (page = 1) => api.get('/movie/now_playing', { params: { page } }),
  searchMovies: (query, page = 1) => api.get('/search/movie', { params: { query, page } }),
};
```

### 2. 찜 목록 관리 (localStorage)
```javascript
// src/utils/localStorage.js
export const toggleWishlist = (movie) => {
  let wishlist = getWishlist();
  const index = wishlist.findIndex(item => item.id === movie.id);
  
  if (index === -1) {
    wishlist.push(movie);
  } else {
    wishlist.splice(index, 1);
  }
  
  saveWishlist(wishlist);
  return wishlist;
};
```

### 3. 무한 스크롤
```javascript
useEffect(() => {
  const handleScroll = () => {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
      if (!loading && hasMore) {
        setPage(prev => prev + 1);
      }
    }
  };
  
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, [loading, hasMore]);
```

## 🎨 반응형 디자인

### 브레이크포인트
- **모바일**: 0 ~ 480px
- **태블릿**: 481px ~ 768px
- **데스크톱**: 769px ~ 1200px
- **대형 화면**: 1201px+

### 주요 반응형 요소
- Grid 레이아웃 (영화 카드)
- Flexbox (Navbar, 버튼 그룹)
- 미디어 쿼리 기반 폰트 크기 조정
- 모바일 햄버거 메뉴
- 터치 이벤트 지원

## 🚀 Git Workflow

### 브랜치 전략 (Gitflow)
- `main`: 프로덕션 배포 브랜치
- `develop`: 개발 통합 브랜치
- `feature/*`: 기능 개발 브랜치

### 커밋 메시지 컨벤션
```
Feat: 새로운 기능 추가
Fix: 버그 수정
Style: 코드 스타일 변경 (포매팅)
Refactor: 코드 리팩토링
Docs: 문서 수정
Chore: 기타 작업
```

## 📝 라이센스

This project is licensed under the MIT License.

## 👨‍💻 개발자

- **Name**: BaePro
- **GitHub**: [@BaePro-source](https://github.com/BaePro-source)

## 🙏 감사의 말

- [TMDB](https://www.themoviedb.org/) - 영화 데이터 제공
- [React](https://react.dev/) - 프론트엔드 프레임워크
- [GitHub Pages](https://pages.github.com/) - 무료 호스팅

---

⭐ 이 프로젝트가 도움이 되셨다면 Star를 눌러주세요!