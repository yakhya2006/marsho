// Utilitaires partagés site public + admin

export const CAT_LABELS = {
  lutte: 'Lutte',
  ecole: 'École',
  culture: 'Culture',
  evenement: 'Événement',
};

export const uid = (prefix = 'id') => `${prefix}_${Math.random().toString(36).slice(2, 9)}`;

export const pathForPage = (page) => `/${page?.slug || ''}`;

export const findPage = (data, pageId) => (data?.pages || []).find((p) => p.id === pageId) || null;

export const pathForPageId = (data, pageId) => {
  const page = findPage(data, pageId);
  return page ? pathForPage(page) : '/';
};

// Cible d'un item de navigation (page directe, lien interne avec ancre, ou URL externe)
export const navItemHref = (data, item) => {
  if (item.url) return item.url;
  const base = pathForPageId(data, item.pageId);
  return item.anchor ? `${base}#${item.anchor}` : base;
};

export const parseLines = (text) =>
  String(text || '')
    .split('\n')
    .filter((l) => l.trim() !== '');

export const parsePairs = (text) =>
  parseLines(text).map((line) => {
    const parts = line.split('|').map((p) => p.trim());
    return { label: parts[0] || '', value: parts[1] || '' };
  });

// Toutes les sessions du site (blocs "calendrier de sessions", toutes pages confondues)
export const collectSessions = (data) => {
  for (const page of data?.pages || []) {
    for (const block of page.blocks || []) {
      if (block.type === 'sessions_calendrier') {
        return { sessions: block.props.sessions || [], page };
      }
    }
  }
  return { sessions: [], page: null };
};

// Ancres disponibles sur une page (blocs avec un champ anchor rempli)
export const collectAnchors = (page) =>
  (page?.blocks || [])
    .filter((b) => b.props?.anchor)
    .map((b) => b.props.anchor);
