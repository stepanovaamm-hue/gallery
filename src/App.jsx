import { useEffect, useMemo, useRef, useState } from 'react';
import * as worksData from './data/works.js';
import AdminPanel, { useAdminData } from './AdminPanel.jsx';

  const { works: defaultWorks, sectionsConfig: exportedSections, DATA_VERSION: dataVersion } = worksData;

const assetPath = (path) => {
  if (!path) return null;
  if (path.startsWith('data:')) return path; // base64 uploaded
  return `${import.meta.env.BASE_URL}${path}`;
};

const getVisualAsset = (key) => `${import.meta.env.BASE_URL}images/${key === 'hero' ? 'hero-gallery' : key === 'gallery' ? 'gallery-exhibition' : key === 'comic' ? 'comic-zone' : 'story-zone'}-future.png`;

function formatAuthorName(author) {
  if (!author) return '';
  const parts = author.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0];
  const firstName = parts[1] || parts[0];
  const lastInitial = parts[0]?.[0] ? `${parts[0][0]}.` : '';
  return lastInitial ? `${firstName} ${lastInitial}` : firstName;
}

const nominationStyles = {
  Рисунок: 'from-aurora/25 via-mint/[.15] to-transparent',
  Комикс: 'from-violet/25 via-coral/[.15] to-transparent',
  Рассказ: 'from-sun/25 via-aurora/[.15] to-transparent',
};

const nominationImages = {
  Рисунок: getVisualAsset('gallery'),
  Комикс: getVisualAsset('comic'),
  Рассказ: getVisualAsset('story'),
};

const workImages = {
  Рисунок: getVisualAsset('gallery'),
  Комикс: getVisualAsset('comic'),
  Рассказ: getVisualAsset('story'),
};

function useRevealOnScroll() {
  useEffect(() => {
    const elements = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16 },
    );
    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);
}

function HeroScene() {
  return (
    <div className="hero-scene" aria-hidden="true">
      <img className="hero-illustration" src={getVisualAsset('hero')} alt="" />
      <div className="hero-aurora" />
      <div className="hero-pathways"><span /><span /><span /></div>
      <div className="hero-particles">
        {Array.from({ length: 16 }).map((_, i) => <span key={i} />)}
      </div>
    </div>
  );
}

function HeroShowcase() {
  return (
    <div className="hero-showcase" data-reveal aria-hidden="true">
      <div className="hero-portal-shell">
        <div className="hero-portal-rim" />
        <div className="hero-portal-window">
          <img src={getVisualAsset('gallery')} alt="" />
          <div className="hero-portal-sheen" />
        </div>
        <div className="hero-art-card hero-art-card-one"><img src={getVisualAsset('comic')} alt="" /></div>
        <div className="hero-art-card hero-art-card-two"><img src={getVisualAsset('story')} alt="" /></div>
        <div className="hero-art-card hero-art-card-three"><img src={getVisualAsset('gallery')} alt="" /></div>
      </div>
      <div className="hero-holo-panel"><span /><span /><span /></div>
    </div>
  );
}

function CardAnimation({ type }) {
  if (!type || type === 'none') return null;
  if (type === 'comic') return (
    <div className="comic-strip" aria-hidden="true"><span /><span /><span /></div>
  );
  if (type === 'story') return (
    <div className="story-glow" aria-hidden="true"><span /><span /><span /></div>
  );
  if (type === 'sparkle') return (
    <div className="art-sparks sparkle-effect" aria-hidden="true">
      {Array.from({ length: 9 }).map((_, i) => <i key={i} />)}
    </div>
  );
  // default: drawing
  return (
    <div className="drawing-motion" aria-hidden="true"><span /><span /><span /></div>
  );
}

function ArtworkVisual({ work, large = false }) {
  const colors = work.palette || ['#6ee7f9', '#ffd166', '#8fffcb'];
  const style = { '--c1': colors[0], '--c2': colors[1], '--c3': colors[2] };
  const image = work.image ? (work.image.startsWith('data:') ? work.image : assetPath(work.image)) : workImages[work.nomination];

  return (
    <div
      className={`art-visual art-${work.visual || 'city'} ${work.image ? 'art-uploaded' : ''} ${large ? 'art-visual-large' : ''}`}
      style={style}
      aria-hidden="true"
    >
      <img className="art-image" src={image} alt="" />
      <div className="art-image-vignette" />
      <div className="art-grid" />
      <div className="art-skyline">
        {Array.from({ length: 8 }).map((_, i) => <span key={i} />)}
      </div>
      <div className="art-core" />
      <div className="art-path" />
      <div className="art-sparks">
        {Array.from({ length: 9 }).map((_, i) => <i key={i} />)}
      </div>
    </div>
  );
}

function WorkMedia({ work }) {
  const videoRef = useRef(null);
  const [animState, setAnimState] = useState(work.animation ? 'waiting' : 'idle');
  const [mediaRatio, setMediaRatio] = useState(null);

  useEffect(() => {
    setMediaRatio(null);
  }, [work.id, work.image, work.animation]);

  useEffect(() => {
    if (!work.animation) return undefined;
    const video = videoRef.current;
    setAnimState('waiting');
    if (video) video.pause();
    const timer = window.setTimeout(() => setAnimState('playing'), 3000);
    return () => { window.clearTimeout(timer); if (videoRef.current) videoRef.current.pause(); };
  }, [work.id, work.animation]);

  useEffect(() => {
    if (!work.animation || animState !== 'playing') return undefined;
    const video = videoRef.current;
    if (!video) return undefined;
    video.currentTime = 0;
    video.play().catch(() => setAnimState('stopped'));
    return () => { video.pause(); };
  }, [animState, work.animation]);

  const animSrc = work.animation?.startsWith('data:') ? work.animation : assetPath(work.animation);
  const posterSrc = work.image ? (work.image.startsWith('data:') ? work.image : assetPath(work.image)) : undefined;
  const mediaStyle = mediaRatio ? { '--work-ratio': mediaRatio } : undefined;
  const updateImageRatio = (event) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (naturalWidth && naturalHeight) {
      setMediaRatio(naturalWidth / naturalHeight);
    }
  };
  const updateVideoRatio = (event) => {
    const { videoWidth, videoHeight } = event.currentTarget;
    if (videoWidth && videoHeight) {
      setMediaRatio(videoWidth / videoHeight);
    }
  };

  if (work.animation) {
    const isWaiting = animState === 'waiting';
    const isPlaying = animState === 'playing';
    const mediaLabel = isWaiting ? 'Старт через 3 секунды' : isPlaying ? 'Анимированная версия' : 'Анимация остановлена';
    return (
      <div className={`work-media work-media-video ${isPlaying ? 'is-playing' : 'is-static'}`} style={mediaStyle}>
        {posterSrc ? <img className="work-static-image work-poster-inline" src={posterSrc} alt="" onLoad={updateImageRatio} /> : null}
        {isPlaying ? <video ref={videoRef} src={animSrc} poster={posterSrc} autoPlay muted loop playsInline preload="auto" onLoadedMetadata={updateVideoRatio} /> : null}
        {isPlaying ? <ModalEffect work={work} /> : null}
        <div className="media-controls">
          <span className="media-label">{mediaLabel}</span>
          <button className="animation-toggle" type="button" onClick={() => isPlaying ? setAnimState('stopped') : setAnimState('playing')} disabled={isWaiting}>
            {isPlaying || isWaiting ? 'Остановить анимацию' : 'Запустить анимацию'}
          </button>
        </div>
      </div>
    );
  }

  if (posterSrc) {
    return (
      <div className="work-media work-media-image" style={mediaStyle}>
        <img className="work-static-image" src={posterSrc} alt={work.title} onLoad={updateImageRatio} />
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-lg border border-white/[.12] bg-ink/60">
      <ArtworkVisual work={work} large />
      <ModalEffect work={work} />
    </div>
  );
}

function NominationCard({ nomination }) {
  return (
    <article className={`glass-card nomination-card min-h-[360px] bg-gradient-to-br ${nominationStyles[nomination.title]}`} data-reveal>
      <div className="nomination-visual" aria-hidden="true">
        <img src={nominationImages[nomination.title]} alt="" />
      </div>
      <div className="mb-7 flex items-start justify-between gap-4">
        <span className="text-sm font-semibold text-mint">{nomination.marker}</span>
        <span className="h-12 w-12 rounded-lg border border-white/[.15] bg-white/[.08] text-center text-2xl leading-[3rem] text-white/[.85]">
          {nomination.title.slice(0, 1)}
        </span>
      </div>
      <h3 className="text-2xl font-semibold text-white">{nomination.title}</h3>
      <p className="mt-4 text-base leading-7 text-white/[.72]">{nomination.description}.</p>
    </article>
  );
}

function WorkCard({ work, onOpen }) {
  return (
    <article className="gallery-card group" data-reveal>
      <button className="work-preview-button" type="button" onClick={() => onOpen(work)} aria-label={"Открыть работу " + work.title}>
        <img
          className="work-card-image"
          src={work.image?.startsWith('data:') ? work.image : (work.image ? assetPath(work.image) : workImages[work.nomination])}
          alt={work.title}
        />
      </button>
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="badge">{work.nomination}</span>
        </div>
        <h3 className="text-xl font-semibold leading-snug text-white">{work.title}</h3>
        <p className="mt-2 text-sm text-white/[.62]">{formatAuthorName(work.author)}, {work.age} лет</p>
        <button className="primary-button mt-6 w-full" type="button" onClick={() => onOpen(work)}>
          Открыть работу
        </button>
      </div>
    </article>
  );
}
function ModalEffect({ work }) {
  const fallback = work.nomination === 'Комикс' ? 'comic' : work.nomination === 'Рассказ' ? 'story' : 'drawing';
  return <CardAnimation type={work.cardAnimation || fallback} />;
}

function WorkModal({ work, onClose }) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!work) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.classList.add('overflow-hidden');
    return () => { document.removeEventListener('keydown', onKey); document.body.classList.remove('overflow-hidden'); };
  }, [work, onClose]);

  useEffect(() => {
    setExpanded(false);
  }, [work?.id]);

  if (!work) return null;

  return (
    <div className="modal-shell" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button className="modal-backdrop" type="button" aria-label="Закрыть работу ??????" onClick={onClose} />
      <div className={"modal-panel " + (expanded ? "modal-panel-expanded" : "")}>
        <button className="icon-button absolute right-4 top-4 z-10" type="button" onClick={onClose}>
          <span aria-hidden="true">?</span>
          <span className="sr-only">Закрыть</span>
        </button>

        <div className="modal-top-header">
          <span className="badge">{work.nomination}</span>
          <h2 id="modal-title" className="modal-main-title">{work.title}</h2>
        </div>

        <div className="modal-info-layout">
          <div className="modal-author-info">
            <div className="modal-info-card">
              <p className="modal-author-name-label">имя</p>
              <p className="modal-author-name">{formatAuthorName(work.author)}</p>
            </div>
            <div className="modal-info-card">
              <p className="modal-author-age-label">возраст</p>
              <p className="modal-author-age">{work.age} лет</p>
            </div>
          </div>

          <div className="modal-description-block">
            <p className="modal-description-label">фантазийное описание</p>
            <p className="modal-description-text">{work.description}</p>
          </div>

          <button className="modal-work-full modal-work-button" type="button" onClick={() => setExpanded((value) => !value)} aria-label="Открыть работу ? ??????? ???????">
            <WorkMedia work={work} />
          </button>
        </div>
      </div>
    </div>
  );
}

function ZoneButton({ zone, index }) {
  return (
    <button className="zone-chip" type="button" style={{ '--zone-delay': `${index * 0.08}s` }} data-reveal>
      <span className="zone-icon" aria-hidden="true" />
      {zone}
    </button>
  );
}
export default function App() {
  const { works, updateWorks, sections, updateSections } = useAdminData(defaultWorks, exportedSections, dataVersion);
  const [selectedWork, setSelectedWork] = useState(null);

  const visibleWorks = useMemo(() => works.filter((w) => !w.hidden), [works]);
  useRevealOnScroll();

  const s = sections;
  const isVisible = (key) => s[key]?.visible !== false;

  return (
    <main className="min-h-screen overflow-hidden bg-ink text-white">
      {isVisible('hero') && (
        <section id="top" className="hero-section">
          <HeroScene />
          <div className="hero-content">
            <div className="hero-copy" data-reveal>
              <p className="eyebrow">{s.hero?.eyebrow || 'Будущее с ПравоТех глазами детей'}</p>
              <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[1.04] text-white sm:text-6xl lg:text-7xl">
                {s.hero?.title || 'Виртуальная галерея будущего'}
              </h1>
              <p className="mt-7 max-w-2xl text-lg leading-8 text-white/[.76] sm:text-xl">
                {s.hero?.subtitle || 'Добро пожаловать в виртуальную галерею, где детские мечты о будущем становятся цифровыми историями.'}
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row">
                <a className="primary-button" href="#gallery">{s.hero?.primaryBtn || 'Смотреть работы'}</a>
                <a className="secondary-button" href="#about">{s.hero?.secondaryBtn || 'О проекте'}</a>
              </div>
              <div className="hero-metrics" aria-label="Краткая информация о выставке">
                <span>{visibleWorks.length} работ</span>
                <span>{s.hero?.metric || 'День защиты детей'}</span>
              </div>
            </div>
            <HeroShowcase />
          </div>
        </section>
      )}

      {isVisible('about') && (
        <section id="about" className="section-shell border-t border-white/[.08]">
          <div className="about-layout">
            <div data-reveal>
              <p className="eyebrow">{s.about?.eyebrow || 'О проекте'}</p>
              <h2 className="section-title">{s.about?.title || 'Праздничная цифровая выставка'}</h2>
              <p className="section-text mt-7">{s.about?.text || ''}</p>
            </div>
            <div className="feature-visual" data-reveal aria-hidden="true">
              <img src={getVisualAsset('gallery')} alt="" />
              <span className="feature-orbit feature-orbit-one" />
              <span className="feature-orbit feature-orbit-two" />
            </div>
          </div>
        </section>
      )}

      {isVisible('gallery') && (
        <section id="gallery" className="section-shell gallery-band">
          <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end" data-reveal>
            <div>
              <p className="eyebrow">{s.gallery?.eyebrow || 'Галерея работ'}</p>
              <h2 className="section-title">{s.gallery?.title || 'Порталы детских историй'}</h2>
            </div>
            <p className="max-w-md text-base leading-7 text-white/[.64]">
              {s.gallery?.description || 'Каждая карточка открывает отдельную цифровую сцену с автором, историей и небольшим анимационным эффектом.'}
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleWorks.map((work) => <WorkCard key={work.id} work={work} onOpen={setSelectedWork} />)}
          </div>
        </section>
      )}

      {isVisible('final') && (
        <section className="section-shell pb-24">
          <div className="final-panel" data-reveal>
            <p className="mx-auto max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-4xl">
              {s.final?.text || 'Будущее создают не только технологии. Его создают мечты, фантазия и смелость детей смотреть дальше.'}
            </p>
            <a className="primary-button mt-9" href="#top">{s.final?.button || 'Вернуться в начало'}</a>
          </div>
        </section>
      )}

      <WorkModal work={selectedWork} onClose={() => setSelectedWork(null)} />

      <AdminPanel
        works={works}
        onUpdateWorks={updateWorks}
        sections={sections}
        onUpdateSections={updateSections}
      />
    </main>
  );
}
