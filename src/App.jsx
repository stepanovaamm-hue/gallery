import { useEffect, useRef, useState } from 'react';
import * as worksData from './data/works.js';
import AdminPanel, { useAdminData } from './AdminPanel.jsx';
import { contests, DEFAULT_CONTEST_ID } from './data/contests.js';

  const { works: defaultWorks, sectionsConfig: exportedSections, DATA_VERSION: dataVersion } = worksData;

const assetPath = (path) => {
  if (!path) return null;
  if (path.startsWith('data:')) return path; // base64 uploaded
  return `${import.meta.env.BASE_URL}${path}`;
};

const getVisualAsset = (key) => `${import.meta.env.BASE_URL}images/${key === 'hero' ? 'hero-gallery' : key === 'gallery' ? 'gallery-exhibition' : key === 'comic' ? 'comic-zone' : 'story-zone'}-future.png`;

function isYandexPublicVideoLink(url) {
  return typeof url === 'string' && /^https:\/\/disk\.360\.yandex\.ru\/i\//.test(url);
}

async function resolveAnimationUrl(animation) {
  if (!animation) return null;
  if (animation.startsWith('data:')) return animation;
  if (animation.startsWith('http')) {
    if (!isYandexPublicVideoLink(animation)) return animation;
    const apiUrl = `https://cloud-api.yandex.net/v1/disk/public/resources/download?public_key=${encodeURIComponent(animation)}`;
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Yandex API ${response.status}`);
    }
    const data = await response.json();
    return data?.href || null;
  }
  return assetPath(animation);
}

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

function useRevealOnScroll(routeKey) {
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
  }, [routeKey]);
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
    </div>
  );
}

function WorkMedia({ work }) {
  const videoRef = useRef(null);
  const [animState, setAnimState] = useState(work.animation ? 'waiting' : 'idle');
  const [mediaRatio, setMediaRatio] = useState(null);
  const [animSrc, setAnimSrc] = useState(null);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    setMediaRatio(null);
    setIsMuted(true);
  }, [work.id, work.image, work.animation]);

  useEffect(() => {
    let cancelled = false;
    setAnimSrc(null);
    if (!work.animation) return undefined;

    resolveAnimationUrl(work.animation)
      .then((url) => {
        if (!cancelled) setAnimSrc(url);
      })
      .catch(() => {
        if (!cancelled) setAnimSrc(null);
      });

    return () => {
      cancelled = true;
    };
  }, [work.animation, work.id]);

  useEffect(() => {
    if (!work.animation || !animSrc) return undefined;
    const video = videoRef.current;
    setAnimState('waiting');
    if (video) video.pause();
    const timer = window.setTimeout(() => setAnimState('playing'), 3000);
    return () => { window.clearTimeout(timer); if (videoRef.current) videoRef.current.pause(); };
  }, [animSrc, work.id, work.animation]);

  useEffect(() => {
    if (!work.animation || !animSrc || animState !== 'playing') return undefined;
    const video = videoRef.current;
    if (!video) return undefined;
    video.currentTime = 0;
    video.play().catch(() => setAnimState('stopped'));
    return () => { video.pause(); };
  }, [animSrc, animState, work.animation]);

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
  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    const nextMuted = !isMuted;
    video.muted = nextMuted;
    setIsMuted(nextMuted);
    if (!nextMuted && video.paused) {
      video.play().catch(() => setAnimState('stopped'));
    }
  };

  if (work.animation) {
    const isWaiting = animState === 'waiting';
    const isPlaying = animState === 'playing';
    const mediaLabel = isWaiting ? 'Старт через 3 секунды' : isPlaying ? 'Анимированная версия' : 'Анимация остановлена';
    return (
      <div className={`work-media work-media-video ${isPlaying ? 'is-playing' : 'is-static'}`} style={mediaStyle}>
        {posterSrc ? <img className="work-static-image work-poster-inline" src={posterSrc} alt="" onLoad={updateImageRatio} /> : null}
        {isPlaying ? <video ref={videoRef} src={animSrc} poster={posterSrc} autoPlay muted={isMuted} loop playsInline preload="auto" onLoadedMetadata={updateVideoRatio} /> : null}
        {isPlaying ? <ModalEffect work={work} /> : null}
        <div className="media-controls">
          <span className="media-label">{mediaLabel}</span>
          <div className="media-actions">
            {isPlaying ? (
              <button className="animation-toggle sound-toggle" type="button" onClick={toggleSound} aria-pressed={!isMuted}>
                {isMuted ? 'Включить звук' : 'Выключить звук'}
              </button>
            ) : null}
            <button className="animation-toggle" type="button" onClick={() => isPlaying ? setAnimState('stopped') : setAnimState('playing')}>
              {isPlaying ? 'Остановить анимацию' : isWaiting ? 'Запустить сейчас' : 'Запустить анимацию'}
            </button>
          </div>
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

function PlaceholderCard({ index }) {
  return (
    <article className="gallery-card placeholder-card" data-reveal aria-label={`Место для будущей работы ${index}`}>
      <div className="placeholder-visual" aria-hidden="true">
        <span className="placeholder-number">{String(index).padStart(2, '0')}</span>
        <span className="placeholder-orbit" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className="badge w-fit">Место для работы</span>
        <h3 className="mt-4 text-xl font-semibold leading-snug text-white">Изобретение № {index}</h3>
        <p className="mt-2 text-sm leading-6 text-white/[.62]">Изображение, описание и анимация будут добавлены позже.</p>
        <span className="placeholder-state mt-auto pt-6">Ожидает загрузки</span>
      </div>
    </article>
  );
}
function ModalEffect({ work }) {
  const fallback = work.nomination === 'Комикс' ? 'comic' : work.nomination === 'Рассказ' ? 'story' : 'drawing';
  return <CardAnimation type={work.cardAnimation || fallback} />;
}

function WorkModal({ work, onClose }) {

  useEffect(() => {
    if (!work) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.classList.add('overflow-hidden');
    return () => { document.removeEventListener('keydown', onKey); document.body.classList.remove('overflow-hidden'); };
  }, [work, onClose]);


  if (!work) return null;

  return (
    <div className="modal-shell" role="dialog" aria-modal="true" aria-labelledby="modal-title">
      <button className="modal-backdrop" type="button" aria-label="Закрыть работу" onClick={onClose} />
      <div className="modal-panel">
        <button className="icon-button absolute right-4 top-4 z-10" type="button" onClick={onClose}>
          <span aria-hidden="true">×</span>
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

          <div className="modal-work-full">
            <WorkMedia work={work} />
          </div>
        </div>
      </div>
    </div>
  );
}

function goToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function ContestCard({ contest, worksCount, index }) {
  const isUpcoming = contest.workLimit && worksCount === 0;
  return (
    <article className={`contest-card contest-card-${contest.accent}`} data-reveal>
      <a className="contest-card-link" href={`#/contest/${contest.id}`} aria-label={`Открыть конкурс «${contest.title}»`}>
        <div className="contest-cover">
          <img src={getVisualAsset(contest.cover)} alt="" />
          {isUpcoming ? <div className="contest-cover-grid" aria-hidden="true">{Array.from({ length: 15 }).map((_, i) => <span key={i} />)}</div> : null}
          <span className="contest-index">{String(index + 1).padStart(2, '0')}</span>
        </div>
        <div className="contest-card-body">
          <div className="contest-card-meta">
            <span className="badge">{contest.eyebrow}</span>
            <span>{isUpcoming ? `${contest.workLimit} мест` : `${worksCount} работ`}</span>
          </div>
          <h2>{contest.title}</h2>
          <p>{contest.description}</p>
          <span className="contest-open">Открыть галерею <span aria-hidden="true">→</span></span>
        </div>
      </a>
    </article>
  );
}

function PortalHome({ works }) {
  const visibleWorks = works.filter((work) => !work.hidden);
  return (
    <>
      <section id="top" className="hero-section portal-hero">
        <HeroScene />
        <div className="hero-content">
          <div className="hero-copy" data-reveal>
            <p className="eyebrow">Постоянный портал детского творчества</p>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[1.04] text-white sm:text-6xl lg:text-7xl">Галерея будущего</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/[.76] sm:text-xl">Здесь живут разные конкурсы ПравоТех — новые идеи появляются рядом с уже собранными детскими историями.</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button className="primary-button" type="button" onClick={() => goToSection('contests')}>Выбрать конкурс</button>
            </div>
            <div className="hero-metrics" aria-label="Краткая информация о портале">
              <span>{contests.length} конкурса</span>
              <span>{visibleWorks.length} опубликованных работ</span>
            </div>
          </div>
          <HeroShowcase />
        </div>
      </section>

      <section id="contests" className="section-shell contest-showcase border-t border-white/[.08]">
        <div className="contest-heading" data-reveal>
          <div>
            <p className="eyebrow">Галереи конкурсов</p>
            <h2 className="section-title">Выберите портал</h2>
          </div>
          <p>Свежий конкурс всегда стоит первым. Завершённые коллекции остаются открытыми и сохраняют все работы.</p>
        </div>
        <div className="contest-grid">
          {contests.map((contest, index) => (
            <ContestCard
              key={contest.id}
              contest={contest}
              index={index}
              worksCount={visibleWorks.filter((work) => (work.contestId || DEFAULT_CONTEST_ID) === contest.id).length}
            />
          ))}
        </div>
      </section>
    </>
  );
}

function ContestInformation({ contest }) {
  return (
    <section id="about" className="section-shell contest-information border-t border-white/[.08]">
      <div className="contest-summary">
        <div data-reveal>
          <p className="eyebrow">О конкурсе</p>
          <h2 className="section-title">{contest.aboutTitle}</h2>
          <p className="section-text mt-7">{contest.description}</p>
        </div>
        <div className="contest-result" data-reveal>
          <span className="contest-result-number" aria-hidden="true">15</span>
          <div>
            <p className="contest-info-label">Результаты конкурса</p>
            <h3>{contest.resultsTitle}</h3>
            <p>{contest.resultsText}</p>
          </div>
        </div>
      </div>
    </section>
  );
}

function ContestPage({ contest, works, sections, onOpenWork }) {
  const contestWorks = works.filter((work) => !work.hidden && (work.contestId || DEFAULT_CONTEST_ID) === contest.id);
  const placeholderCount = Math.max(0, (contest.workLimit || contestWorks.length) - contestWorks.length);
  const isLegacy = contest.id === DEFAULT_CONTEST_ID;

  return (
    <>
      <section id="top" className="hero-section contest-hero">
        <HeroScene />
        <a className="contest-back" href="#/">← Все конкурсы</a>
        <div className="hero-content">
          <div className="hero-copy" data-reveal>
            <p className="eyebrow">{contest.eyebrow}</p>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[1.04] text-white sm:text-6xl lg:text-7xl">{contest.title}</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/[.76] sm:text-xl">{isLegacy ? sections.hero?.subtitle : contest.description}</p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <button className="primary-button" type="button" onClick={() => goToSection('gallery')}>{contestWorks.length ? 'Смотреть работы' : 'Посмотреть будущую галерею'}</button>
              <a className="secondary-button" href="#/">Все конкурсы</a>
            </div>
            <div className="hero-metrics" aria-label="Краткая информация о конкурсе">
              <span>{contest.workLimit ? `${contest.workLimit} мест` : `${contestWorks.length} работ`}</span>
              <span>{contest.status}</span>
            </div>
          </div>
          <HeroShowcase />
        </div>
      </section>

      {isLegacy ? (
        <section id="about" className="section-shell border-t border-white/[.08]">
          <div className="about-layout">
            <div data-reveal>
              <p className="eyebrow">{sections.about?.eyebrow || 'О проекте'}</p>
              <h2 className="section-title">{sections.about?.title || 'Праздничная цифровая выставка'}</h2>
              <p className="section-text mt-7">{sections.about?.text}</p>
            </div>
            <div className="feature-visual" data-reveal aria-hidden="true">
              <img src={getVisualAsset(contest.cover)} alt="" />
              <span className="feature-orbit feature-orbit-one" />
              <span className="feature-orbit feature-orbit-two" />
            </div>
          </div>
        </section>
      ) : <ContestInformation contest={contest} />}

      <section id="gallery" className="section-shell gallery-band">
        <div className="gallery-heading mb-10" data-reveal>
          <div>
            <p className="eyebrow">Галерея работ</p>
            <h2 className="section-title">{isLegacy ? (sections.gallery?.title || contest.galleryTitle) : contest.galleryTitle}</h2>
          </div>
          <p className="max-w-md text-base leading-7 text-white/[.64]">{isLegacy ? (sections.gallery?.description || contest.galleryDescription) : contest.galleryDescription}</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {contestWorks.map((work) => <WorkCard key={work.id} work={work} onOpen={onOpenWork} />)}
          {Array.from({ length: placeholderCount }).map((_, index) => <PlaceholderCard key={`placeholder-${index + 1}`} index={contestWorks.length + index + 1} />)}
        </div>
      </section>

      <section className="section-shell pb-24">
        <div className="final-panel" data-reveal>
          <p className="mx-auto max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-4xl">{isLegacy ? sections.final?.text : contest.finalText}</p>
          <a className="secondary-button mt-9" href="#/">Вернуться к конкурсам</a>
        </div>
      </section>
    </>
  );
}

export default function App() {
  const { works, updateWorks, sections, updateSections } = useAdminData(defaultWorks, exportedSections, dataVersion);
  const [selectedWork, setSelectedWork] = useState(null);

  const getContestFromHash = () => {
    const match = window.location.hash.match(/^#\/contest\/([^/]+)/);
    return match ? contests.find((contest) => contest.id === match[1]) || null : null;
  };
  const [activeContest, setActiveContest] = useState(getContestFromHash);

  useEffect(() => {
    const onHashChange = () => {
      setSelectedWork(null);
      setActiveContest(getContestFromHash());
      window.scrollTo({ top: 0, behavior: 'auto' });
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useRevealOnScroll(activeContest?.id || 'home');

  return (
    <main className="min-h-screen overflow-hidden bg-ink text-white">
      {activeContest
        ? <ContestPage contest={activeContest} works={works} sections={sections} onOpenWork={setSelectedWork} />
        : <PortalHome works={works} />}

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
