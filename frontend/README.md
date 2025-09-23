# Frontend

이 폴더는 프로젝트의 **React + TypeScript 기반 프론트엔드** 코드가 위치한 공간입니다.

## 실행 방법

1. 폴더 이동

   ```bash
   cd frontend
   ```

2. 패키지 설치

   ```bash
   npm install
   ```

3. 개발 서버 실행

   ```bash
   npm run dev
   ```

   실행 후 브라우저에서 [http://localhost:5173](http://localhost:5173) 으로 접속하면 프론트엔드를 확인할 수 있습니다.

---

## 폴더 구조

```plaintext
src/
├── api/        # 외부 서비스 연동 api 요청 함수
├── assets/     # 폰트, 이미지
├── components/ # 재사용 가능한 컴포넌트
├── pages/      # 라우팅되는 페이지 컴포넌트
├── hooks/      # 커스텀 훅
├── store/      # 전역 상태 관리
├── styles/     # css 파일
├── utils/      # 공통 유틸 함수들
├── types/      # 타입스크립트의 타입 정의
├── App.tsx     # 루트 컴포넌트
└── main.tsx    # 진입 파일
```

---

## 기술 스택

* **React 18**
* **TypeScript**
* **Vite**
