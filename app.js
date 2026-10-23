(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const shots = [
    { file: 'warm-paper-search.png', theme: 'paper', name: 'Warm Paper', detail: 'File search', alt: 'Summon in the Warm Paper theme showing a file search for notes' },
    { file: 'midnight-search.png', theme: 'midnight', name: 'Midnight', detail: 'File search', alt: 'Summon in the Midnight theme showing a file search with a dark navy interface' },
    { file: 'dot-matrix-search-bar.png', theme: 'matrix', name: 'Dot Matrix', detail: 'Search bar', alt: 'Summon search bar in the Dot Matrix theme against a dotted background' },
    { file: 'dot-matrix-commands.png', theme: 'matrix', name: 'Dot Matrix', detail: 'Quick commands', alt: 'Summon in the Dot Matrix theme displaying its built-in slash commands' },
    { file: 'dot-matrix-ai-answer.png', theme: 'matrix', name: 'Dot Matrix', detail: 'AI answer', alt: 'Summon in the Dot Matrix theme showing an AI answer comparing TCP and UDP' },
    { file: 'dot-matrix-minimal-bar.png', theme: 'matrix', name: 'Dot Matrix', detail: 'Minimal bar', alt: 'A minimal Summon search bar in the Dot Matrix theme' }
  ];
  const byId = id => document.getElementById(id);
  const showcase = byId('looks');
  const image = byId('appearance-image');
  const card = byId('active-card');
  const dialog = byId('lightbox');
  const dots = [...document.querySelectorAll('[data-slide]')];
  const themes = [...document.querySelectorAll('[data-theme].theme-choice')];
  const path = shot => `assets/screenshots/${shot.file}`;
  const pad = value => String(value).padStart(2, '0');
  let index = 0;
  let pointerStart = null;
  let suppressClick = false;
  function updateDialog() {
    const shot = shots[index];
    byId('lightbox-image').src = path(shot);
    byId('lightbox-image').alt = shot.alt;
    byId('lightbox-title').textContent = `${shot.name} — ${shot.detail}`;
    byId('lightbox-count').textContent = `${pad(index + 1)} / ${pad(shots.length)}`;
  }
  function show(next) {
    index = (next + shots.length) % shots.length;
    const shot = shots[index];
    image.src = path(shot);
    image.alt = shot.alt;
    byId('previous-image').src = path(shots[(index + shots.length - 1) % shots.length]);
    byId('next-image').src = path(shots[(index + 1) % shots.length]);
    byId('card-theme').textContent = shot.name;
    byId('shot-title').textContent = shot.detail;
    byId('count').textContent = `${pad(index + 1)} / ${pad(shots.length)}`;
    byId('carousel-status').textContent = `Screenshot ${index + 1} of ${shots.length}: ${shot.name} — ${shot.detail}`;
    byId('expand').setAttribute('aria-label', `Enlarge screenshot: ${shot.name} ${shot.detail}`);
    showcase.dataset.theme = shot.theme;
    dots.forEach((dot, i) => { dot.classList.toggle('is-active', i === index); dot.setAttribute('aria-pressed', String(i === index)); });
    themes.forEach(button => { const selected = button.dataset.theme === shot.theme; button.classList.toggle('is-selected', selected); button.setAttribute('aria-pressed', String(selected)); });
    card.classList.remove('is-changing');
    void card.offsetWidth;
    card.classList.add('is-changing');
    if (dialog.open) updateDialog();
  }
  ['prev', 'preview-prev', 'lightbox-prev'].forEach(id => byId(id).addEventListener('click', () => show(index - 1)));
  ['next', 'preview-next', 'lightbox-next'].forEach(id => byId(id).addEventListener('click', () => show(index + 1)));
  dots.forEach(dot => dot.addEventListener('click', () => show(Number(dot.dataset.slide))));
  themes.forEach(button => button.addEventListener('click', () => show(shots.findIndex(shot => shot.theme === button.dataset.theme))));
  function onKeyboard(event) {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
    if (event.key === 'Home') { event.preventDefault(); show(0); }
    if (event.key === 'End') { event.preventDefault(); show(shots.length - 1); }
  }
  showcase.addEventListener('keydown', onKeyboard);
  dialog.addEventListener('keydown', onKeyboard);
  byId('expand').addEventListener('click', () => {
    if (suppressClick) return;
    updateDialog();
    dialog.showModal();
    document.body.classList.add('modal-open');
  });
  byId('close-lightbox').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
  dialog.addEventListener('click', event => {
    const bounds = dialog.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) dialog.close();
  });
  const stage = byId('carousel-stage');
  stage.querySelectorAll('img').forEach(screenshot => { screenshot.draggable = false; });
  stage.addEventListener('pointerdown', event => {
    if (!event.isPrimary || (event.pointerType === 'mouse' && event.button !== 0)) return;
    pointerStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
    suppressClick = false;
  });
  stage.addEventListener('pointerup', event => {
    if (!pointerStart || pointerStart.id !== event.pointerId) return;
    const dx = event.clientX - pointerStart.x;
    const dy = event.clientY - pointerStart.y;
    pointerStart = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) { suppressClick = true; show(index + (dx < 0 ? 1 : -1)); }
  });
  stage.addEventListener('pointercancel', () => { pointerStart = null; });
  stage.addEventListener('click', event => {
    if (suppressClick) { event.preventDefault(); event.stopPropagation(); suppressClick = false; }
  }, true);
  // Preload the small local images so the next screenshot is ready immediately.
  shots.slice(1).forEach(shot => { const preload = new Image(); preload.src = path(shot); });
})();
