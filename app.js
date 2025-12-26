// app.js
// 주요 기능:
// - 테마 토글 (prefers-color-scheme + localStorage)
// - 프로젝트 렌더링, 필터(탭), '자세히 보기' 모달 + 아코디언
// - Chart.js 시각화 (데모 데이터 명시)
// - IntersectionObserver로 섹션 등장 애니메이션
// - Back to top 버튼

/* =====================
   프로젝트 데이터 (README 기반 요약)
   각 프로젝트는 채용 담당자 관점으로: 문제 정의→접근→결과→임팩트
   ===================== */
const projects = [
  {
    id: 'ecommerce-churn',
    title: 'E-commerce Customer Churn Analysis',
    tags: ['python','sql','tableau','excel'],
    goal: '다음 달 이탈 가능성이 높은 고객을 예측하고 매출 손실을 줄인다.',
    data: '고객 20만 명, 주문 150만 건 (Users, Orders, Payments)',
    method: 'SQL 집계 → Excel 빠른 검증 → Python으로 이탈 예측(Logistic/RandomForest) → Tableau 대시보드',
    results: '첫 구매 후 14일 무구매 시 이탈 확률 급증. 구매 빈도가 핵심 변수로 확인.',
    recommendation: '10일 무구매 고객에 자동 쿠폰 발송, 신규 고객 온보딩 메시지 강화',
    tech: ['Python','SQL','Excel','Tableau']
  },
  {
    id: 'realestate-signals',
    title: 'Real Estate Price Signal Detection',
    tags: ['python','sql','tableau'],
    goal: '가격 상승 전에 나타나는 거래 신호를 탐지하여 투자·의사결정 지원',
    data: '아파트 실거래 30만 건 (지역, 층, 면적, 거래일자)',
    method: '지역별 거래량·평단가 SQL 집계 → Python으로 거래량-가격 시차 분석 → Tableau 지도 시각화',
    results: '거래량 반등 후 1~2분기 내 가격 상승. 저층 거래 회복이 초기 신호.',
    recommendation: '거래량 반등 지역 우선 모니터링, 예측 알림 체계 도입',
    tech: ['Python','SQL','Tableau']
  },
  {
    id: 'user-funnel',
    title: 'User Behavior Funnel Analysis',
    tags: ['sql','excel','python'],
    goal: '가입 후 3일 이내 이탈 원인 분석 및 초기 리텐션 개선',
    data: '가입 로그, 메시지 수, 활동일수',
    method: '퍼널 분석 및 코호트 비교, 메시지 횟수와 잔존율 상관관계 분석',
    results: '첫 3일 메시지 5회 미만 사용자 이탈 확률 2배',
    recommendation: '초기 3일 미션형 UX 도입 및 대화 유도 알림 설계',
    tech: ['SQL','Excel','Python']
  }
];

// DOM 참조
const projectsList = document.getElementById('projects-list');
const tabs = Array.from(document.querySelectorAll('.tab'));
const themeToggle = document.getElementById('theme-toggle');
const backToTop = document.getElementById('backToTop');
const mobileMenuBtn = document.getElementById('mobile-menu');

// create mobile nav container
let mobileNav = null;

/* ========== Theme handling ========== */
function applyTheme(theme){
  if(theme==='light') document.documentElement.setAttribute('data-theme','light');
  else document.documentElement.removeAttribute('data-theme');
  localStorage.setItem('theme',theme);
}

function detectAndApplyTheme(){
  const saved = localStorage.getItem('theme');
  if(saved) return applyTheme(saved);
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(prefersDark ? 'dark' : 'light');
}

// initialize theme toggle icon and behavior
function updateThemeToggleIcon(){
  const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  themeToggle.textContent = current === 'light' ? '🌞' : '🌗';
}
themeToggle.addEventListener('click',()=>{
  const current = document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  const next = current==='light' ? 'dark' : 'light';
  applyTheme(next);
  updateThemeToggleIcon();
});

/* ========== Projects rendering & filtering ========== */
function renderProjectCard(p){
  const el = document.createElement('article');
  el.className = 'project-card fade-in';
  el.setAttribute('data-tags',p.tags.join(' '));
  el.innerHTML = `
    <h3>${p.title}</h3>
    <div class="project-meta small">${p.data}</div>
    <p class="small">${p.goal}</p>
    <div class="project-actions">
      <button class="btn ghost details-btn" data-id="${p.id}">자세히 보기</button>
      <div class="small">Tech: ${p.tech.join(', ')}</div>
    </div>
  `;
  return el;
}

function loadProjects(filter='all'){
  projectsList.innerHTML='';
  const filtered = projects.filter(p=> filter==='all' ? true : p.tags.includes(filter));
  filtered.forEach(p=> projectsList.appendChild(renderProjectCard(p)));
  // attach listeners
  document.querySelectorAll('.details-btn').forEach(btn=> btn.addEventListener('click', openProjectModal));
  // animate
  requestAnimationFrame(()=> document.querySelectorAll('.fade-in').forEach((n,i)=> setTimeout(()=> n.classList.add('show'), i*80)));
}

tabs.forEach(t=> t.addEventListener('click',()=>{
  tabs.forEach(x=> x.classList.remove('active'));
  t.classList.add('active');
  const filter = t.dataset.filter;
  loadProjects(filter);
}));

/* ========== Modal + Accordion for project details ========== */
let modalEl = null;
function openProjectModal(e){
  const id = e.currentTarget.dataset.id;
  const p = projects.find(x=>x.id===id);
  if(!p) return;
  // create modal
  modalEl = document.createElement('div');
  modalEl.className='project-modal';
  modalEl.innerHTML = `
    <div class="modal-backdrop" tabindex="-1"></div>
    <div class="modal-card" role="dialog" aria-modal="true" aria-label="Project details: ${p.title}">
      <button class="modal-close" aria-label="닫기">✕</button>
      <h3>${p.title}</h3>
      <p class="small"><strong>Goal:</strong> ${p.goal}</p>
      <p class="small"><strong>Data:</strong> ${p.data}</p>
      <div class="accordion">
        <button class="acc-btn">Method</button>
        <div class="acc-panel"><p>${p.method}</p></div>
        <button class="acc-btn">Results</button>
        <div class="acc-panel"><p>${p.results}</p></div>
        <button class="acc-btn">Recommendation</button>
        <div class="acc-panel"><p>${p.recommendation}</p></div>
        <div class="small"><strong>Tech:</strong> ${p.tech.join(', ')}</div>
      </div>
    </div>
  `;
  document.body.appendChild(modalEl);
  document.body.style.overflow='hidden';
  // focus trap: focus first interactive element
  const closeBtn = modalEl.querySelector('.modal-close');
  if(closeBtn) closeBtn.focus();
  modalEl.querySelector('.modal-close').addEventListener('click', closeModal);
  modalEl.querySelector('.modal-backdrop').addEventListener('click', closeModal);
  modalEl.addEventListener('keydown', (ev)=>{ if(ev.key==='Escape') closeModal(); });

  // trap tab focus inside modal
  (function(){
    const focusableSelector = 'a[href], button, textarea, input, select, [tabindex]:not([tabindex="-1"])';
    const focusables = Array.from(modalEl.querySelectorAll(focusableSelector)).filter(el => !el.hasAttribute('disabled'));
    if(focusables.length === 0) return;
    const firstFocusable = focusables[0];
    const lastFocusable = focusables[focusables.length - 1];
    modalEl.addEventListener('keydown', function(e){
      if(e.key !== 'Tab') return;
      if(e.shiftKey){ // shift + tab
        if(document.activeElement === firstFocusable){ e.preventDefault(); lastFocusable.focus(); }
      } else {
        if(document.activeElement === lastFocusable){ e.preventDefault(); firstFocusable.focus(); }
      }
    });
  })();

  // accordion behavior with aria-expanded and keyboard support
  modalEl.querySelectorAll('.acc-btn').forEach(btn=>{
    btn.setAttribute('aria-expanded','false');
    btn.addEventListener('click', ()=>{
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      btn.classList.toggle('open');
      const panel = btn.nextElementSibling;
      if(panel.style.maxHeight){ panel.style.maxHeight = null; }
      else{ panel.style.maxHeight = panel.scrollHeight + 'px'; }
    });
    btn.addEventListener('keydown', (ev)=>{ if(ev.key==='Enter' || ev.key===' ') { ev.preventDefault(); btn.click(); } });
  });
}

function closeModal(){
  if(!modalEl) return;
  modalEl.remove(); modalEl = null; document.body.style.overflow='';
}

/* ========== Chart.js visualizations (데모 가상 데이터) ========== */
function initCharts(){
  // KPI 매출 추이 (가상 데이터)
  const kpiCtx = document.getElementById('kpiChart').getContext('2d');
  new Chart(kpiCtx,{
    type:'line',
    data:{
      labels:['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
      datasets:[{label:'Monthly Revenue (k)',data:[120,140,135,160,170,165,180,190,200,210,220,230],borderColor:getComputedStyle(document.documentElement).getPropertyValue('--accent')||'#7cf7ff',backgroundColor:'rgba(124,247,255,0.08)',tension:0.3}]
    },
    options:{responsive:true,plugins:{tooltip:{mode:'index',intersect:false}}}
  });

  // Churn rate by month (가상 데이터)
  const churnCtx = document.getElementById('churnChart').getContext('2d');
  new Chart(churnCtx,{type:'bar',data:{labels:['Q1','Q2','Q3','Q4'],datasets:[{label:'Churn Rate %',data:[4.2,3.8,4.5,3.9],backgroundColor:'rgba(255,99,132,0.5)'}]},options:{responsive:true,plugins:{tooltip:{callbacks:{label:ctx=> ctx.dataset.label+': '+ctx.parsed.y+'%'}}}}});
}

/* ========== IntersectionObserver for reveal animations ========== */
function setupObservers(){
  const io = new IntersectionObserver(entries=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){ entry.target.classList.add('show'); io.unobserve(entry.target); }
    });
  },{threshold:0.12});
  document.querySelectorAll('.fade-in').forEach(el=> io.observe(el));
}

/* ========== Back to top & smooth scroll ========== */
window.addEventListener('scroll', ()=>{
  if(window.scrollY>300) backToTop.style.display='block'; else backToTop.style.display='none';
});
backToTop.addEventListener('click', ()=> window.scrollTo({top:0,behavior:'smooth'}));

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(a=> a.addEventListener('click', (e)=>{
  const target = document.querySelector(a.getAttribute('href'));
  if(target){ e.preventDefault(); target.scrollIntoView({behavior:'smooth',block:'start'}); }
}));

/* ========== Mobile menu toggle ========== */
mobileMenuBtn.addEventListener('click', ()=>{
  if(!mobileNav){
    mobileNav = document.createElement('div');
    mobileNav.className='mobile-nav';
    mobileNav.setAttribute('role','menu');
    mobileNav.innerHTML = `
      <a href="#about">About</a>
      <a href="#skills">Skills</a>
      <a href="#projects">Projects</a>
      <a href="#viz">Visualization</a>
      <a href="#contact">Contact</a>
    `;
    document.body.appendChild(mobileNav);
  }
  const isShown = getComputedStyle(mobileNav).display !== 'none';
  mobileNav.style.display = isShown ? 'none' : 'flex';
  // close mobile nav when a link is clicked
  mobileNav.querySelectorAll('a').forEach(a=> a.addEventListener('click', ()=> mobileNav.style.display = 'none'));
});

/* ========== Init on DOMContentLoaded ========== */
document.addEventListener('DOMContentLoaded', ()=>{
  detectAndApplyTheme();
  loadProjects('all');
  initCharts();
  setupObservers();
  // make project cards observable for animation
  document.querySelectorAll('.project-card').forEach(el=> el.classList.add('fade-in'));
});
