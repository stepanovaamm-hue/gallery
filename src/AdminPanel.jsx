import { useEffect, useRef, useState } from 'react';
import { contests, DEFAULT_CONTEST_ID } from './data/contests.js';

const ADMIN_PASSWORD = '@6140134KMS';

const ANIMATION_OPTIONS = [
  { id: 'drawing', label: '✦ Световые линии (рисунок)', description: 'Горизонтальные блески' },
  { id: 'comic', label: '▦ Комикс-полосы', description: 'Вертикальные переходы' },
  { id: 'story', label: '◉ Мягкое свечение (рассказ)', description: 'Радиальный пульс' },
  { id: 'sparkle', label: '✦ Искры', description: 'Точечные вспышки' },
  { id: 'none', label: '○ Без анимации', description: 'Статичный вид' },
];

const VISUAL_OPTIONS = ['city', 'robot', 'eco', 'space', 'law', 'dream'];

const DEFAULT_SECTIONS = {
  hero: { visible: true, eyebrow: 'Будущее с ПравоТех глазами детей', title: 'Виртуальная галерея будущего', subtitle: 'Добро пожаловать в виртуальную галерею, где детские мечты о будущем становятся цифровыми историями.', primaryBtn: 'Смотреть работы', secondaryBtn: 'О проекте', metric: 'День защиты детей' },
  about: { visible: true, eyebrow: 'О проекте', title: 'Праздничная цифровая выставка', text: 'Ко Дню защиты детей мы собрали творческие работы детей сотрудников ПравоТех. Ребята представили, каким может быть будущее вместе с технологиями, ИИ и ПравоТех. Каждая работа — это маленький портал в мир фантазии, открытий и смелых идей.' },
  nominations: { visible: true, eyebrow: 'Номинации', title: 'Три способа оживить мечту', items: [
    { title: 'Рисунок', marker: '01', description: 'Нарисованные сюжеты превращаются в живые сцены будущего: города загораются, роботы двигаются, технологии оживают' },
    { title: 'Комикс', marker: '02', description: 'Комиксы становятся движущимися историями с анимацией, переходами и эффектом мини-мультфильма' },
    { title: 'Рассказ', marker: '03', description: 'Рассказы превращаются в цифровые истории: текст сопровождается атмосферными иллюстрациями, анимацией и ощущением погружения' },
  ] },
  gallery: { visible: true, eyebrow: 'Галерея работ', title: 'Порталы детских историй', description: 'Каждая карточка открывает отдельную цифровую сцену с автором, историей и небольшим анимационным эффектом.' },
  zones: { visible: true, eyebrow: 'Зоны будущего', title: 'Маршруты по цифровому городу', items: ['Города будущего', 'ИИ и роботы', 'Экологичный мир', 'Технологии и право', 'Космос и открытия', 'Мир глазами детей'] },
  final: { visible: true, text: 'Будущее создают не только технологии. Его создают мечты, фантазия и смелость детей смотреть дальше.', button: 'Вернуться в начало' },
};

function loadFromStorage(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function useAdminData(defaultWorks, defaultSections, dataVersion) {
  const [works, setWorks] = useState(() => {
    const storedVersion = Number(localStorage.getItem('admin_data_version') || 0);
    // Если в коде сайта данные новее, чем сохранённые в браузере — берём данные сайта
    if (dataVersion && dataVersion > storedVersion) {
      saveToStorage('admin_works', defaultWorks);
      if (defaultSections) saveToStorage('admin_sections', defaultSections);
      localStorage.setItem('admin_data_version', String(dataVersion));
      return defaultWorks;
    }
    return loadFromStorage('admin_works', defaultWorks);
  });
  const [sections, setSections] = useState(() => loadFromStorage('admin_sections', defaultSections || DEFAULT_SECTIONS));

  const updateWorks = (next) => { setWorks(next); saveToStorage('admin_works', next); };
  const updateSections = (next) => { setSections(next); saveToStorage('admin_sections', next); };

  return { works, updateWorks, sections, updateSections };
}

function mediaSrc(src) {
  if (!src) return null;
  if (src.startsWith('data:') || src.startsWith('http')) return src;
  return `${import.meta.env.BASE_URL}${src}`;
}

export default function AdminPanel({ works, onUpdateWorks, sections, onUpdateSections }) {
  const [open, setOpen] = useState(false);
  const [authenticated, setAuthenticated] = useState(() => sessionStorage.getItem('admin_auth') === '1');
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState(false);
  const [tab, setTab] = useState('works'); // works | sections
  const [editingWork, setEditingWork] = useState(null);
  const [addingWork, setAddingWork] = useState(false);
  const [toast, setToast] = useState(null);
  const fileInputRef = useRef(null);
  const animFileRef = useRef(null);
  const photoFileRef = useRef(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const handleLogin = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      sessionStorage.setItem('admin_auth', '1');
      setAuthenticated(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
      setPasswordInput('');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('admin_auth');
    setAuthenticated(false);
    setOpen(false);
  };

  const newWorkTemplate = () => ({
    id: Date.now(),
    contestId: contests[0].id,
    title: '',
    author: '',
    age: '',
    nomination: 'Рисунок',
    visual: 'city',
    palette: ['#6ee7f9', '#ffd166', '#8fffcb'],
    description: '',
    image: null,
    animation: null,
    authorPhoto: null,
    cardAnimation: 'drawing',
    hidden: false,
  });

  const startAdd = () => { setEditingWork(newWorkTemplate()); setAddingWork(true); };
  const startEdit = (work) => { setEditingWork({ ...work }); setAddingWork(false); };
  const cancelEdit = () => { setEditingWork(null); setAddingWork(false); };

  const handleFileToBase64 = (file) => new Promise((res) => {
    const reader = new FileReader();
    reader.onload = (e) => res(e.target.result);
    reader.readAsDataURL(file);
  });

  const handleImageUpload = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await handleFileToBase64(file);
    setEditingWork((prev) => ({ ...prev, [field]: base64 }));
  };

  const saveWork = () => {
    if (!editingWork.title || !editingWork.author) {
      showToast('⚠ Заполните название и автора');
      return;
    }
    let next;
    if (addingWork) {
      next = [editingWork, ...works];
    } else {
      next = works.map((w) => (w.id === editingWork.id ? editingWork : w));
    }
    onUpdateWorks(next);
    setEditingWork(null);
    setAddingWork(false);
    showToast('✓ Сохранено');
  };

  const deleteWork = (id) => {
    if (!confirm('Удалить эту работу?')) return;
    onUpdateWorks(works.filter((w) => w.id !== id));
    showToast('✓ Удалено');
  };

  const toggleHideWork = (id) => {
    onUpdateWorks(works.map((w) => w.id === id ? { ...w, hidden: !w.hidden } : w));
  };

  const updateSection = (key, field, value) => {
    const next = { ...sections, [key]: { ...sections[key], [field]: value } };
    onUpdateSections(next);
  };

  const updateNomination = (idx, field, value) => {
    const base = sections.nominations?.items || DEFAULT_SECTIONS.nominations.items;
    const items = base.map((it, i) => i === idx ? { ...it, [field]: value } : it);
    updateSection('nominations', 'items', items);
  };

  const updateZone = (idx, value) => {
    const base = sections.zones?.items || DEFAULT_SECTIONS.zones.items;
    const items = base.map((z, i) => i === idx ? value : z);
    updateSection('zones', 'items', items);
  };

  const addZone = () => {
    const base = sections.zones?.items || DEFAULT_SECTIONS.zones.items;
    updateSection('zones', 'items', [...base, 'Новая зона']);
  };

  const removeZone = (idx) => {
    const base = sections.zones?.items || DEFAULT_SECTIONS.zones.items;
    updateSection('zones', 'items', base.filter((_, i) => i !== idx));
  };

  const resetAll = () => {
    if (!confirm('Сбросить все данные к исходным? Это действие нельзя отменить.')) return;
    localStorage.removeItem('admin_works');
    localStorage.removeItem('admin_sections');
    window.location.reload();
  };

  const downloadFile = (filename, content) => {
    const blob = new Blob([content], { type: 'text/javascript;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportData = () => {
    const stamp = Date.now();
    // works.js — все работы как есть (с base64-картинками если загружены)
    const worksContent =
      '// Файл сгенерирован админкой. Замените им src/data/works.js и залейте на GitHub.\n' +
      'export const DATA_VERSION = ' + stamp + ';\n\n' +
      'export const works = ' + JSON.stringify(works, null, 2) + ';\n\n' +
      'export const nominations = [\n' +
      "  { title: 'Рисунок', marker: '01', description: 'Нарисованные сюжеты превращаются в живые сцены будущего: города загораются, роботы двигаются, технологии оживают' },\n" +
      "  { title: 'Комикс', marker: '02', description: 'Комиксы становятся движущимися историями с анимацией, переходами и эффектом мини-мультфильма' },\n" +
      "  { title: 'Рассказ', marker: '03', description: 'Рассказы превращаются в цифровые истории: текст сопровождается атмосферными иллюстрациями, анимацией и ощущением погружения' },\n" +
      '];\n\n' +
      'export const futureZones = [\n' +
      "  'Города будущего', 'ИИ и роботы', 'Экологичный мир', 'Технологии и право', 'Космос и открытия', 'Мир глазами детей',\n" +
      '];\n\n' +
      'export const sectionsConfig = ' + JSON.stringify(sections, null, 2) + ';\n';
    downloadFile('works.js', worksContent);
    showToast('✓ works.js скачан');
  };

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="admin-trigger"
        aria-label="Открыть панель администратора"
        title="Администратор"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
        </svg>
        Админ
      </button>

      {/* Toast */}
      {toast && <div className="admin-toast">{toast}</div>}

      {/* Panel */}
      {open && (
        <div className="admin-shell">
          <div className="admin-panel">
            {/* Header */}
            <div className="admin-header">
              <div className="admin-header-left">
                <span className="admin-logo">⬡</span>
                <span className="admin-title">Панель управления</span>
              </div>
              <div className="admin-header-right">
                {authenticated && (
                  <button onClick={handleLogout} className="admin-btn-ghost admin-btn-sm">Выйти</button>
                )}
                <button onClick={() => { setOpen(false); setEditingWork(null); }} className="admin-close">×</button>
              </div>
            </div>

            {!authenticated ? (
              /* Login form */
              <div className="admin-login">
                <div className="admin-login-box">
                  <p className="admin-login-title">Вход в панель управления</p>
                  <p className="admin-login-sub">Доступ только для администратора</p>
                  <div className="admin-field-group">
                    <input
                      type="password"
                      className={`admin-input ${passwordError ? 'admin-input-error' : ''}`}
                      placeholder="Пароль"
                      value={passwordInput}
                      onChange={(e) => { setPasswordInput(e.target.value); setPasswordError(false); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                      autoFocus
                    />
                    {passwordError && <p className="admin-error-text">Неверный пароль</p>}
                  </div>
                  <button onClick={handleLogin} className="admin-btn-primary w-full">Войти</button>
                </div>
              </div>
            ) : editingWork ? (
              /* Work editor */
              <div className="admin-editor">
                <div className="admin-editor-header">
                  <button onClick={cancelEdit} className="admin-btn-ghost admin-btn-sm">← Назад</button>
                  <span className="admin-editor-title">{addingWork ? 'Новая работа' : 'Редактирование'}</span>
                  <button onClick={saveWork} className="admin-btn-primary admin-btn-sm">Сохранить</button>
                </div>

                <div className="admin-editor-body">
                  {/* Basic info */}
                  <div className="admin-section-group">
                    <p className="admin-group-label">Основное</p>
                    <div className="admin-field mb-3">
                      <label className="admin-label">Конкурс</label>
                      <select className="admin-input" value={editingWork.contestId || DEFAULT_CONTEST_ID} onChange={(e) => setEditingWork(p => ({ ...p, contestId: e.target.value }))}>
                        {contests.map((contest) => <option key={contest.id} value={contest.id}>{contest.title}</option>)}
                      </select>
                    </div>
                    <div className="admin-grid-2">
                      <div className="admin-field">
                        <label className="admin-label">Название *</label>
                        <input className="admin-input" value={editingWork.title} onChange={(e) => setEditingWork(p => ({ ...p, title: e.target.value }))} placeholder="Название работы" />
                      </div>
                      <div className="admin-field">
                        <label className="admin-label">Автор *</label>
                        <input className="admin-input" value={editingWork.author} onChange={(e) => setEditingWork(p => ({ ...p, author: e.target.value }))} placeholder="Имя и фамилия" />
                      </div>
                      <div className="admin-field">
                        <label className="admin-label">Возраст</label>
                        <input className="admin-input" type="number" min="1" max="18" value={editingWork.age} onChange={(e) => setEditingWork(p => ({ ...p, age: e.target.value }))} placeholder="лет" />
                      </div>
                      <div className="admin-field">
                        <label className="admin-label">Номинация</label>
                        <select className="admin-input" value={editingWork.nomination} onChange={(e) => setEditingWork(p => ({ ...p, nomination: e.target.value }))}>
                          <option>Рисунок</option>
                          <option>Комикс</option>
                          <option>Рассказ</option>
                        </select>
                      </div>
                    </div>
                    <div className="admin-field mt-3">
                      <label className="admin-label">Описание</label>
                      <textarea className="admin-input admin-textarea" value={editingWork.description} onChange={(e) => setEditingWork(p => ({ ...p, description: e.target.value }))} placeholder="Описание работы..." rows={3} />
                    </div>
                  </div>

                  {/* Visual style */}
                  <div className="admin-section-group">
                    <p className="admin-group-label">Визуальный стиль карточки</p>
                    <div className="admin-field">
                      <label className="admin-label">Тип визуала (если нет загруженного изображения)</label>
                      <div className="admin-visual-grid">
                        {VISUAL_OPTIONS.map((v) => (
                          <button
                            key={v}
                            type="button"
                            className={`admin-visual-option ${editingWork.visual === v ? 'active' : ''}`}
                            onClick={() => setEditingWork(p => ({ ...p, visual: v }))}
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="admin-field mt-3">
                      <label className="admin-label">Цветовая палитра</label>
                      <div className="admin-palette-row">
                        {editingWork.palette.map((color, i) => (
                          <div key={i} className="admin-palette-item">
                            <input type="color" value={color} onChange={(e) => {
                              const p = [...editingWork.palette];
                              p[i] = e.target.value;
                              setEditingWork(prev => ({ ...prev, palette: p }));
                            }} className="admin-color-picker" />
                            <span className="admin-palette-label">{['C1', 'C2', 'C3'][i]}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Animation */}
                  <div className="admin-section-group">
                    <p className="admin-group-label">Анимация на карточке</p>
                    <div className="admin-anim-grid">
                      {ANIMATION_OPTIONS.map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          className={`admin-anim-option ${editingWork.cardAnimation === opt.id ? 'active' : ''}`}
                          onClick={() => setEditingWork(p => ({ ...p, cardAnimation: opt.id }))}
                        >
                          <span className="admin-anim-label">{opt.label}</span>
                          <span className="admin-anim-desc">{opt.description}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Files */}
                  <div className="admin-section-group">
                    <p className="admin-group-label">Медиафайлы</p>
                    <div className="admin-grid-2">
                      <div className="admin-field">
                        <label className="admin-label">Изображение работы</label>
                        <div className="admin-upload-zone" onClick={() => fileInputRef.current?.click()}>
                          {editingWork.image ? (
                            <img src={mediaSrc(editingWork.image)} alt="" className="admin-preview-img" />
                          ) : (
                            <span className="admin-upload-placeholder">↑ Загрузить PNG/JPG</span>
                          )}
                        </div>
                        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'image')} />
                        {editingWork.image && <button className="admin-btn-ghost admin-btn-sm mt-1" onClick={() => setEditingWork(p => ({ ...p, image: null }))}>Удалить изображение</button>}
                      </div>
                      <div className="admin-field">
                        <label className="admin-label">Фото автора</label>
                        <div className="admin-upload-zone" onClick={() => photoFileRef.current?.click()}>
                          {editingWork.authorPhoto ? (
                            <img src={mediaSrc(editingWork.authorPhoto)} alt="" className="admin-preview-img" />
                          ) : (
                            <span className="admin-upload-placeholder">↑ Загрузить фото</span>
                          )}
                        </div>
                        <input ref={photoFileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleImageUpload(e, 'authorPhoto')} />
                        {editingWork.authorPhoto && <button className="admin-btn-ghost admin-btn-sm mt-1" onClick={() => setEditingWork(p => ({ ...p, authorPhoto: null }))}>Удалить фото</button>}
                      </div>
                    </div>
                    <div className="admin-field mt-3">
                      <label className="admin-label">Видео-анимация (MP4)</label>
                      <div className="admin-upload-zone admin-upload-zone-wide" onClick={() => animFileRef.current?.click()}>
                        {editingWork.animation ? (
                          <div className="admin-video-preview">
                            <video src={mediaSrc(editingWork.animation)} className="admin-preview-video" muted />
                            <span className="admin-video-label">Видео загружено ✓</span>
                          </div>
                        ) : (
                          <span className="admin-upload-placeholder">↑ Загрузить MP4 (анимация работы)</span>
                        )}
                      </div>
                      <input ref={animFileRef} type="file" accept="video/mp4" className="hidden" onChange={(e) => handleImageUpload(e, 'animation')} />
                      {editingWork.animation && <button className="admin-btn-ghost admin-btn-sm mt-1" onClick={() => setEditingWork(p => ({ ...p, animation: null }))}>Удалить видео</button>}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Main panel */
              <div className="admin-main">
                {/* Tabs */}
                <div className="admin-tabs">
                  <button className={`admin-tab ${tab === 'works' ? 'active' : ''}`} onClick={() => setTab('works')}>Работы ({works.length})</button>
                  <button className={`admin-tab ${tab === 'sections' ? 'active' : ''}`} onClick={() => setTab('sections')}>Раздел «Будущее с ПравоТех»</button>
                </div>

                {tab === 'works' && (
                  <div className="admin-works-panel">
                    <div className="admin-works-toolbar">
                      <button onClick={startAdd} className="admin-btn-primary">+ Добавить работу</button>
                      <button onClick={exportData} className="admin-btn-export">↓ Экспорт для сайта</button>
                      <button onClick={resetAll} className="admin-btn-danger">Сброс</button>
                    </div>
                    <div className="admin-export-hint">
                      Чтобы изменения увидели <b>все посетители</b>: внесите правки → нажмите <b>«Экспорт для сайта»</b> → замените скачанным файлом <code>src/data/works.js</code> в репозитории → залейте на GitHub.
                    </div>
                    <div className="admin-works-list">
                      {works.map((work) => (
                        <div key={work.id} className={`admin-work-row ${work.hidden ? 'admin-work-hidden' : ''}`}>
                          <div className="admin-work-thumb">
                            {work.image ? (
                              <img src={mediaSrc(work.image)} alt="" />
                            ) : (
                              <div className="admin-work-thumb-placeholder" style={{ background: `linear-gradient(135deg, ${work.palette[0]}44, ${work.palette[1]}44)` }}>
                                {work.visual[0].toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="admin-work-info">
                            <p className="admin-work-title">{work.title || '—'}</p>
                            <p className="admin-work-meta">{work.author} · {work.age} лет · {work.nomination} · {contests.find((contest) => contest.id === (work.contestId || DEFAULT_CONTEST_ID))?.title}</p>
                            {work.hidden && <span className="admin-work-hidden-badge">Скрыта</span>}
                          </div>
                          <div className="admin-work-actions">
                            <button onClick={() => startEdit(work)} className="admin-btn-ghost admin-btn-sm">Изм.</button>
                            <button onClick={() => toggleHideWork(work.id)} className="admin-btn-ghost admin-btn-sm">{work.hidden ? 'Показать' : 'Скрыть'}</button>
                            <button onClick={() => deleteWork(work.id)} className="admin-btn-danger admin-btn-sm">Удалить</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tab === 'sections' && (
                  <div className="admin-sections-panel">
                    {[
                      { key: 'hero', name: 'Hero (главный экран)', fields: [
                        { f: 'eyebrow', label: 'Надпись над заголовком' },
                        { f: 'title', label: 'Заголовок' },
                        { f: 'subtitle', label: 'Подзаголовок', area: true },
                        { f: 'primaryBtn', label: 'Текст кнопки 1' },
                        { f: 'secondaryBtn', label: 'Текст кнопки 2' },
                        { f: 'metric', label: 'Подпись (например «День защиты детей»)' },
                      ] },
                      { key: 'about', name: 'О проекте', fields: [
                        { f: 'eyebrow', label: 'Надпись над заголовком' },
                        { f: 'title', label: 'Заголовок' },
                        { f: 'text', label: 'Текст', area: true },
                      ] },
                      { key: 'nominations', name: 'Номинации', fields: [
                        { f: 'eyebrow', label: 'Надпись над заголовком' },
                        { f: 'title', label: 'Заголовок' },
                      ], nominations: true },
                      { key: 'gallery', name: 'Галерея', fields: [
                        { f: 'eyebrow', label: 'Надпись над заголовком' },
                        { f: 'title', label: 'Заголовок' },
                        { f: 'description', label: 'Описание справа', area: true },
                      ] },
                      { key: 'zones', name: 'Зоны будущего', fields: [
                        { f: 'eyebrow', label: 'Надпись над заголовком' },
                        { f: 'title', label: 'Заголовок' },
                      ], zones: true },
                      { key: 'final', name: 'Финальный блок', fields: [
                        { f: 'text', label: 'Текст', area: true },
                        { f: 'button', label: 'Текст кнопки' },
                      ] },
                    ].map(({ key, name, fields, nominations: hasNoms, zones: hasZones }) => (
                      <div key={key} className="admin-section-editor">
                        <div className="admin-section-editor-header">
                          <span className="admin-section-name">{name}</span>
                          <label className="admin-toggle">
                            <input
                              type="checkbox"
                              checked={sections[key]?.visible !== false}
                              onChange={(e) => updateSection(key, 'visible', e.target.checked)}
                            />
                            <span className="admin-toggle-track">
                              <span className="admin-toggle-thumb" />
                            </span>
                            <span className="admin-toggle-label">{sections[key]?.visible !== false ? 'Показана' : 'Скрыта'}</span>
                          </label>
                        </div>
                        <div className="admin-section-fields">
                          {sections[key]?.visible === false && (
                            <p className="admin-section-hidden-note">Эта секция скрыта на сайте. Поля ниже можно редактировать — изменения применятся, когда вы снова включите показ.</p>
                          )}
                          {fields.map(({ f, label, area }) => (
                            <div key={f} className="admin-field">
                              <label className="admin-label">{label}</label>
                              {area ? (
                                <textarea
                                  className="admin-input admin-textarea"
                                  value={sections[key]?.[f] || ''}
                                  onChange={(e) => updateSection(key, f, e.target.value)}
                                  rows={3}
                                />
                              ) : (
                                <input
                                  className="admin-input"
                                  value={sections[key]?.[f] || ''}
                                  onChange={(e) => updateSection(key, f, e.target.value)}
                                />
                              )}
                            </div>
                          ))}

                          {hasNoms && (
                            <div className="admin-subgroup">
                              <p className="admin-subgroup-label">Карточки номинаций</p>
                              {(sections.nominations?.items || DEFAULT_SECTIONS.nominations.items).map((it, idx) => (
                                <div key={idx} className="admin-item-card">
                                  <div className="admin-field">
                                    <label className="admin-label">Название #{idx + 1}</label>
                                    <input className="admin-input" value={it.title} onChange={(e) => updateNomination(idx, 'title', e.target.value)} />
                                  </div>
                                  <div className="admin-field mt-1">
                                    <label className="admin-label">Описание</label>
                                    <textarea className="admin-input admin-textarea" rows={2} value={it.description} onChange={(e) => updateNomination(idx, 'description', e.target.value)} />
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {hasZones && (
                            <div className="admin-subgroup">
                              <p className="admin-subgroup-label">Список зон</p>
                              {(sections.zones?.items || DEFAULT_SECTIONS.zones.items).map((z, idx) => (
                                <div key={idx} className="admin-zone-row">
                                  <input className="admin-input" value={z} onChange={(e) => updateZone(idx, e.target.value)} />
                                  <button className="admin-btn-danger admin-btn-sm" onClick={() => removeZone(idx)}>×</button>
                                </div>
                              ))}
                              <button className="admin-btn-ghost admin-btn-sm mt-1" onClick={addZone}>+ Добавить зону</button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
