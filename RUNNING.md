실행 방법

- 파일 구조: `index.html`, `styles.css`, `app.js` (정적 파일)
- 로컬에서 바로 실행: 파일을 더블클릭하여 브라우저로 열거나 간단한 HTTP 서버를 사용

권장: Python 간이 서버
```bash
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 열기
```

외부 리소스(CDN)
- Google Fonts: Inter (fonts.googleapis.com)
- Font Awesome: cdnjs.cloudflare.com
- Chart.js: https://cdn.jsdelivr.net/npm/chart.js

주의사항
- `index.html`의 Hero 및 Contact 섹션에 이름/이메일/링크를 실제 값으로 교체해주세요.
- 모든 차트의 데이터는 README 기반의 데모(가상 데이터)입니다. 실제 분석 결과와는 다릅니다.

접근성 및 기능 요약
- 다크/라이트 테마: 시스템 설정을 따르며 사용자가 변경하면 로컬스토리지에 저장됩니다.
- 프로젝트 카드: 탭으로 필터링 가능, '자세히 보기'에서 모달과 아코디언으로 상세 확인 가능.
- 모달은 키보드로 닫거나 탭으로 포커스가 순환됩니다.
