import { useEffect, useMemo, useState } from 'react';
import { futureZones, nominations, works } from './data/works.js';

const assetPath = (path) => `${import.meta.env.BASE_URL}${path}`;

const visualAssets = {
  hero: assetPath('images/hero-gallery-future.png'),
  gallery: assetPath('images/gallery-exhibition-future.png'),
  comic: assetPath('images/comic-zone-future.png'),
  story: assetPath('images/story-zone-future.png'),
};

const nominationStyles = {
  Рисунок: 'from-aurora/25 via-mint/[.15] to-transparent',
  Комикс: 'from-violet/25 via-coral/[.15] to-transparent',
  Рассказ: 'from-sun/25 via-aurora/[.15] to-transparent',
};

const nominationImages = {
  Рисунок: visualAssets.gallery,
  Комикс: visualAssets.comic,
  Рассказ: visualAssets.story,
};

const workImages = {
  Рисунок: visualAssets.gallery,
  Комикс: visualAssets.comic,
  Рассказ: visualAssets.story,
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
      <img className="hero-illustration" src={visualAssets.hero} alt="" />
      <div className="hero-aurora" />
      <div className="hero-pathways">
        <span />
        <span />
        <span />
      </div>
      <div className="hero-particles">
        {Array.from({ length: 16 }).map((_, index) => (
          <span key={index} />
        ))}
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
          <img src={visualAssets.gallery} alt="" />
          <div className="hero-portal-sheen" />
        </div>
        <div className="hero-art-card hero-art-card-one">
          <img src={visualAssets.comic} alt="" />
        </div>
        <div className="hero-art-card hero-art-card-two">
          <img src={visualAssets.story} alt="" />
        </div>
        <div className="hero-art-card hero-art-card-three">
          <img src={visualAssets.gallery} alt="" />
        </div>
      </div>
      <div className="hero-holo-panel">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}

function ArtworkVisual({ work, large = false }) {
  const colors = work.palette;
  const style = {
    '--c1': colors[0],
    '--c2': colors[1],
    '--c3': colors[2],
  };
  const image = workImages[work.nomination];

  return (
    <div
      className={`art-visual art-${work.visual} ${large ? 'art-visual-large' : ''}`}
      style={style}
      aria-hidden="true"
    >
      <img className="art-image" src={image} alt="" />
      <div className="art-image-vignette" />
      <div className="art-grid" />
      <div className="art-skyline">
        {Array.from({ length: 8 }).map((_, index) => (
          <span key={index} />
        ))}
      </div>
      <div className="art-core" />
      <div className="art-path" />
      <div className="art-sparks">
        {Array.from({ length: 9 }).map((_, index) => (
          <i key={index} />
        ))}
      </div>
    </div>
  );
}

function NominationCard({ nomination }) {
  return (
    <article
      className={`glass-card nomination-card min-h-[360px] bg-gradient-to-br ${nominationStyles[nomination.title]}`}
      data-reveal
    >
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
      <ArtworkVisual work={work} />
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="badge">{work.nomination}</span>
          <span className="text-sm text-white/[.52]">{work.age} лет</span>
        </div>
        <h3 className="text-xl font-semibold leading-snug text-white">{work.title}</h3>
        <p className="mt-2 text-sm text-white/[.62]">{work.author}</p>
        <button className="primary-button mt-6 w-full" type="button" onClick={() => onOpen(work)}>
          Открыть работу
        </button>
      </div>
    </article>
  );
}

function ModalEffect({ work }) {
  if (work.nomination === 'Комикс') {
    return (
      <div className="comic-strip" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    );
  }

  if (work.nomination === 'Рассказ') {
    return (
      <div className="story-glow" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    );
  }

  return (
    <div className="drawing-motion" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
  );
}

function WorkModal({ work, onClose }) {
  useEffect(() => {
    if (!work) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    document.body.classList.add('overflow-hidden');
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.classList.remove('overflow-hidden');
    };
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
        <div className="grid gap-7 md:grid-cols-[1.08fr_.92fr]">
          <div className="relative overflow-hidden rounded-lg border border-white/[.12] bg-ink/60">
            <ArtworkVisual work={work} large />
            <ModalEffect work={work} />
          </div>
          <div className="flex flex-col justify-center">
            <span className="badge mb-4 w-max">{work.nomination}</span>
            <h2 id="modal-title" className="text-3xl font-semibold leading-tight text-white">
              {work.title}
            </h2>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div className="info-line">
                <dt>Автор</dt>
                <dd>{work.author}</dd>
              </div>
              <div className="info-line">
                <dt>Возраст</dt>
                <dd>{work.age} лет</dd>
              </div>
            </dl>
            <p className="mt-6 text-base leading-7 text-white/[.72]">{work.description}</p>
          </div>
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
  const [selectedWork, setSelectedWork] = useState(null);
  const highlightedWorks = useMemo(() => works, []);

  useRevealOnScroll();

  return (
    <main className="min-h-screen overflow-hidden bg-ink text-white">
      <section id="top" className="hero-section">
        <HeroScene />
        <div className="hero-content">
          <div className="hero-copy" data-reveal>
            <p className="eyebrow">Будущее с ПравоТех глазами детей</p>
            <h1 className="mt-6 max-w-4xl text-5xl font-semibold leading-[1.04] text-white sm:text-6xl lg:text-7xl">
              Виртуальная галерея будущего
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/[.76] sm:text-xl">
              Добро пожаловать в виртуальную галерею, где детские мечты о будущем становятся
              цифровыми историями.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a className="primary-button" href="#gallery">
                Смотреть работы
              </a>
              <a className="secondary-button" href="#about">
                О проекте
              </a>
            </div>
            <div className="hero-metrics" aria-label="Краткая информация о выставке">
              <span>6 работ</span>
              <span>3 номинации</span>
              <span>День защиты детей</span>
            </div>
          </div>
          <HeroShowcase />
        </div>
      </section>

      <section id="about" className="section-shell border-t border-white/[.08]">
        <div className="about-layout">
          <div data-reveal>
            <p className="eyebrow">О проекте</p>
            <h2 className="section-title">Праздничная цифровая выставка</h2>
            <p className="section-text mt-7">
              Ко Дню защиты детей мы собрали творческие работы детей сотрудников ПравоТех. Ребята
              представили, каким может быть будущее вместе с технологиями, ИИ и ПравоТех. Каждая
              работа — это маленький портал в мир фантазии, открытий и смелых идей.
            </p>
          </div>
          <div className="feature-visual" data-reveal aria-hidden="true">
            <img src={visualAssets.gallery} alt="" />
            <span className="feature-orbit feature-orbit-one" />
            <span className="feature-orbit feature-orbit-two" />
          </div>
        </div>
      </section>

      <section className="section-shell">
        <div className="mb-10 max-w-3xl" data-reveal>
          <p className="eyebrow">Номинации</p>
          <h2 className="section-title">Три способа оживить мечту</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {nominations.map((nomination) => (
            <NominationCard key={nomination.title} nomination={nomination} />
          ))}
        </div>
      </section>

      <section id="gallery" className="section-shell gallery-band">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end" data-reveal>
          <div>
            <p className="eyebrow">Галерея работ</p>
            <h2 className="section-title">Порталы детских историй</h2>
          </div>
          <p className="max-w-md text-base leading-7 text-white/[.64]">
            Каждая карточка открывает отдельную цифровую сцену с автором, историей и небольшим
            анимационным эффектом.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {highlightedWorks.map((work) => (
            <WorkCard key={work.id} work={work} onOpen={setSelectedWork} />
          ))}
        </div>
      </section>

      <section className="section-shell">
        <div
          className="future-zone"
          style={{ '--zone-image': `url("${visualAssets.hero}")` }}
        >
          <div className="max-w-2xl" data-reveal>
            <p className="eyebrow">Зоны будущего</p>
            <h2 className="section-title">Маршруты по цифровому городу</h2>
          </div>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {futureZones.map((zone, index) => (
              <ZoneButton key={zone} zone={zone} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell pb-24">
        <div className="final-panel" data-reveal>
          <p className="mx-auto max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-4xl">
            Будущее создают не только технологии. Его создают мечты, фантазия и смелость детей
            смотреть дальше.
          </p>
          <a className="primary-button mt-9" href="#top">
            Вернуться в начало
          </a>
        </div>
      </section>

      <WorkModal work={selectedWork} onClose={() => setSelectedWork(null)} />
    </main>
  );
}
