// =============================================================
// Effets 3D — qualité avant quantité :
//  1. Tilt : les cartes s'inclinent en perspective en suivant le
//     curseur, avec un reflet (glare) qui glisse sur la surface.
//  2. Parallax : les halos et l'image du hero se déplacent à des
//     vitesses différentes selon la position de la souris → profondeur.
// Actif uniquement souris précise + hors prefers-reduced-motion.
// =============================================================

const TILT_SELECTOR = '.activity-card, .tarif-card';
const MAX_TILT = 7; // degrés

export function initEffects3D(root) {
  if (!root) return () => {};
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  if (!window.matchMedia('(pointer: fine)').matches) return () => {};

  let currentCard = null;
  let raf = 0;

  const onMove = (e) => {
    // --- Tilt des cartes (délégation : fonctionne même après re-render) ---
    const card = e.target.closest?.(TILT_SELECTOR);
    if (card !== currentCard) {
      if (currentCard) {
        currentCard.classList.remove('is-tilting');
        currentCard.style.removeProperty('--rx');
        currentCard.style.removeProperty('--ry');
      }
      currentCard = card;
      if (card) card.classList.add('is-tilting');
    }
    if (card) {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;   // 0 → 1
      const py = (e.clientY - r.top) / r.height;
      card.style.setProperty('--rx', `${((0.5 - py) * MAX_TILT * 2).toFixed(2)}deg`);
      card.style.setProperty('--ry', `${((px - 0.5) * MAX_TILT * 2).toFixed(2)}deg`);
      card.style.setProperty('--gx', `${(px * 100).toFixed(1)}%`);
      card.style.setProperty('--gy', `${(py * 100).toFixed(1)}%`);
    }

    // --- Parallax du hero ---
    const hero = root.querySelector('.hero');
    if (hero) {
      const hr = hero.getBoundingClientRect();
      if (hr.bottom > 0 && hr.top < window.innerHeight) {
        const nx = (e.clientX / window.innerWidth - 0.5).toFixed(3);
        const ny = (e.clientY / window.innerHeight - 0.5).toFixed(3);
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          hero.style.setProperty('--px', nx);
          hero.style.setProperty('--py', ny);
        });
      }
    }
  };

  const onLeave = () => {
    if (currentCard) {
      currentCard.classList.remove('is-tilting');
      currentCard.style.removeProperty('--rx');
      currentCard.style.removeProperty('--ry');
      currentCard = null;
    }
  };

  document.addEventListener('mousemove', onMove, { passive: true });
  document.addEventListener('mouseleave', onLeave);
  return () => {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseleave', onLeave);
    cancelAnimationFrame(raf);
  };
}
