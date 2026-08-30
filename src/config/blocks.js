// =============================================================
// Registre des blocs — la source de vérité unique.
//
// Chaque type de bloc déclare :
//  - label / description / group : pour la modal d'ajout côté admin
//  - schema : les champs éditables (l'admin génère le formulaire)
//  - defaults() : props d'un bloc fraîchement ajouté
//
// Types de champs supportés par l'éditeur générique :
//  text, textarea, richtext (HTML), date, checkbox, select,
//  image ({src, lien}) — sélecteur médiathèque + lien optionnel,
//  buttons (liste de boutons {label, href, style}),
//  list (liste répétable d'objets, `fields` décrit chaque item).
// =============================================================
import { uid } from './helpers';

const bouton = (label = 'Bouton', href = '/', style = 'primary') => ({ id: uid('btn'), label, href, style });

// Champs d'en-tête de section communs (étiquette dorée + titre + description)
const headerFields = [
  { key: 'tag', label: 'Étiquette (petit texte doré)', type: 'text' },
  { key: 'titre', label: 'Titre', type: 'text' },
  { key: 'desc', label: 'Description', type: 'textarea' },
];

// Champ avancé, replié par défaut : invisible sur le site, sert uniquement
// de point d'arrivée aux raccourcis du menu et aux liens en #.
const anchorField = {
  key: 'anchor',
  label: 'Identifiant de section — invisible sur le site. Sert de point d’arrivée quand un bouton ou un raccourci du menu doit faire défiler jusqu’à cette section (ex : « tarifs »).',
  type: 'text',
  advanced: true,
};

const imageField = (key, label, opts = {}) => ({ key, label, type: 'image', ...opts });

export const BUTTON_STYLES = [
  { value: 'primary', label: 'Doré (principal)' },
  { value: 'outline', label: 'Contour' },
];

export const BLOCKS = {
  // ---------------- EN-TÊTES ----------------
  hero: {
    label: 'Hero — grand bandeau',
    description: 'Plein écran : badge, titre 3 lignes, description, boutons, chiffres clés',
    group: 'En-têtes',
    schema: [
      { key: 'badge', label: 'Badge', type: 'text' },
      { key: 'titre_1', label: 'Titre — ligne 1', type: 'text' },
      { key: 'titre_2', label: 'Titre — ligne 2 (dorée)', type: 'text' },
      { key: 'titre_3', label: 'Titre — ligne 3', type: 'text' },
      { key: 'desc', label: 'Description', type: 'textarea' },
      imageField('image', 'Image de fond', { noLink: true }),
      { key: 'boutons', label: 'Boutons', type: 'buttons' },
      {
        key: 'stats', label: 'Chiffres clés (bandeau bas)', type: 'list', itemLabel: 'Chiffre',
        fields: [
          { key: 'valeur', label: 'Valeur (nombre)', type: 'text' },
          { key: 'unite', label: 'Unité (ha, +, j…)', type: 'text' },
          { key: 'label', label: 'Légende', type: 'text' },
        ],
        newItem: () => ({ id: uid('st'), valeur: '0', unite: '', label: '' }),
      },
      anchorField,
    ],
    defaults: () => ({
      badge: 'Association loi 1901', titre_1: 'Association', titre_2: 'Marsho', titre_3: '',
      desc: '', image: { src: '', lien: '' }, boutons: [bouton('Découvrir', '#activites')], stats: [], anchor: '',
    }),
  },

  activite_hero: {
    label: 'Hero d’activité',
    description: 'Bandeau visuel avec titre et phrase d’introduction',
    group: 'En-têtes',
    schema: [
      { key: 'titre', label: 'Titre', type: 'text' },
      { key: 'intro', label: 'Introduction', type: 'textarea' },
      imageField('image', 'Image de fond', { noLink: true }),
    ],
    defaults: () => ({ titre: 'Titre', intro: '', image: { src: '', lien: '' } }),
  },

  titre_page: {
    label: 'Titre de page',
    description: 'Étiquette + grand titre + introduction (haut de page simple)',
    group: 'En-têtes',
    schema: [...headerFields],
    defaults: () => ({ tag: '', titre: 'Titre de la page', desc: '' }),
  },

  // ---------------- CONTENU ----------------
  texte: {
    label: 'Texte',
    description: 'Titre + paragraphes + liste à puces optionnelle — sans code',
    group: 'Contenu',
    schema: [
      { key: 'titre', label: 'Titre', type: 'text' },
      {
        key: 'corps',
        label: 'Texte (laissez une ligne vide entre deux paragraphes)',
        type: 'simpletext',
      },
      {
        key: 'puces',
        label: 'Liste à puces (optionnel — une puce par ligne)',
        type: 'textarea',
      },
      { key: 'boutons', label: 'Boutons en bas de section (optionnel — vers une page /slug, une section #ancre ou un site https://…)', type: 'buttons' },
      anchorField,
    ],
    defaults: () => ({ boutons: [], titre: '', corps: '', puces: '', anchor: '' }),
  },

  colonnes: {
    label: 'Cartes de texte (colonnes)',
    description: 'Encadrés côte à côte : titre, sous-titre en gras, texte — sans code',
    group: 'Contenu',
    schema: [
      { key: 'titre', label: 'Titre de la section', type: 'text' },
      { key: 'intro', label: 'Texte d’introduction (optionnel)', type: 'simpletext' },
      {
        key: 'colonnes', label: 'Encadrés', type: 'list', itemLabel: 'Encadré',
        fields: [
          { key: 'titre', label: 'Titre', type: 'text' },
          { key: 'sous_titre', label: 'Sous-titre (en gras)', type: 'text' },
          { key: 'texte', label: 'Texte', type: 'simpletext' },
        ],
        newItem: () => ({ id: uid('col'), titre: 'Titre', sous_titre: '', texte: '' }),
      },
      { key: 'boutons', label: 'Boutons en bas de section (optionnel — vers une page /slug, une section #ancre ou un site https://…)', type: 'buttons' },
      anchorField,
    ],
    defaults: () => ({ boutons: [], titre: '', intro: '', colonnes: [], anchor: '' }),
  },

  apropos: {
    label: 'Texte + image latérale',
    description: 'Texte riche à gauche, image (avec badge) et liste de valeurs à droite',
    group: 'Contenu',
    schema: [
      { key: 'tag', label: 'Étiquette', type: 'text' },
      { key: 'titre', label: 'Titre', type: 'text' },
      { key: 'corps', label: 'Texte (laissez une ligne vide entre deux paragraphes)', type: 'simpletext' },
      imageField('image', 'Image'),
      { key: 'image_badge', label: 'Badge sur l’image (texte court, la 1re ligne en gras)', type: 'textarea' },
      { key: 'boutons', label: 'Boutons', type: 'buttons' },
      {
        key: 'valeurs', label: 'Valeurs (liste à icônes)', type: 'list', itemLabel: 'Valeur',
        fields: [
          { key: 'icon', label: 'Icône (emoji)', type: 'text' },
          { key: 'titre', label: 'Titre', type: 'text' },
          { key: 'texte', label: 'Texte', type: 'text' },
        ],
        newItem: () => ({ id: uid('v'), icon: '✨', titre: '', texte: '' }),
      },
      anchorField,
    ],
    defaults: () => ({
      tag: '', titre: '', corps: '', image: { src: '', lien: '' },
      image_badge: '', boutons: [], valeurs: [], anchor: '',
    }),
  },

  icones: {
    label: 'Grille d’icônes',
    description: 'Cartes compactes icône + titre + texte (infos pratiques, formats…)',
    group: 'Contenu',
    schema: [
      { key: 'titre', label: 'Titre de la section', type: 'text' },
      {
        key: 'items', label: 'Cartes', type: 'list', itemLabel: 'Carte',
        fields: [
          { key: 'icon', label: 'Icône (emoji)', type: 'text' },
          { key: 'titre', label: 'Titre', type: 'text' },
          { key: 'texte', label: 'Texte', type: 'text' },
        ],
        newItem: () => ({ id: uid('ic'), icon: '🎯', titre: '', texte: '' }),
      },
      { key: 'boutons', label: 'Boutons en bas de section (optionnel — vers une page /slug, une section #ancre ou un site https://…)', type: 'buttons' },
      anchorField,
    ],
    defaults: () => ({ boutons: [], titre: '', items: [], anchor: '' }),
  },

  html: {
    label: 'HTML libre (avancé)',
    description: 'Réservé aux cas spéciaux nécessitant du code (grands tableaux…) — les autres gabarits n’en demandent jamais',
    group: 'Contenu',
    schema: [
      { key: 'titre', label: 'Titre (optionnel)', type: 'text' },
      { key: 'corps', label: 'HTML', type: 'richtext' },
      { key: 'boutons', label: 'Boutons en bas de section (optionnel — vers une page /slug, une section #ancre ou un site https://…)', type: 'buttons' },
      anchorField,
    ],
    defaults: () => ({ boutons: [], titre: '', corps: '', anchor: '' }),
  },

  // ---------------- LISTES & GRILLES ----------------
  activites: {
    label: 'Cartes d’activités',
    description: 'Grille de grandes cartes image + badge + points forts + lien',
    group: 'Listes & grilles',
    schema: [
      ...headerFields,
      {
        key: 'cartes', label: 'Cartes', type: 'list', itemLabel: 'Activité',
        fields: [
          { key: 'titre', label: 'Titre', type: 'text' },
          { key: 'texte', label: 'Description', type: 'textarea' },
          { key: 'badge', label: 'Badge', type: 'text' },
          {
            key: 'badgeColor', label: 'Couleur du badge', type: 'select',
            options: [
              { value: '', label: 'Standard' },
              { value: 'accent-red', label: 'Rouge' },
              { value: 'accent-gold', label: 'Doré' },
            ],
          },
          { key: 'features', label: 'Points forts (un par ligne)', type: 'textarea' },
          imageField('image', 'Image'),
          { key: 'lien', label: 'Lien « Voir plus » (ex : /airsoft)', type: 'text' },
          { key: 'featured', label: 'Carte mise en avant (large)', type: 'checkbox' },
        ],
        newItem: () => ({
          id: uid('act'), titre: 'Activité', texte: '', badge: '', badgeColor: '',
          features: '', image: { src: '', lien: '' }, lien: '', featured: false,
        }),
      },
      { key: 'boutons', label: 'Boutons en bas de section (optionnel — vers une page /slug, une section #ancre ou un site https://…)', type: 'buttons' },
      anchorField,
    ],
    defaults: () => ({ boutons: [], tag: '', titre: 'Nos Activités', desc: '', cartes: [], anchor: 'activites' }),
  },

  terrains: {
    label: 'Cartes de terrains',
    description: 'Grille de cartes lieu : image, badge, localisation, tags',
    group: 'Listes & grilles',
    schema: [
      ...headerFields,
      {
        key: 'terrains', label: 'Terrains', type: 'list', itemLabel: 'Terrain',
        fields: [
          { key: 'nom', label: 'Nom', type: 'text' },
          { key: 'lieu', label: 'Localisation', type: 'text' },
          { key: 'texte', label: 'Description', type: 'textarea' },
          { key: 'badge', label: 'Badge', type: 'text' },
          { key: 'badgeAlt', label: 'Badge de couleur alternative', type: 'checkbox' },
          { key: 'tags', label: 'Tags (un par ligne)', type: 'textarea' },
          imageField('image', 'Image'),
        ],
        newItem: () => ({
          id: uid('ter'), nom: 'Terrain', lieu: '', texte: '', badge: '', badgeAlt: false,
          tags: '', image: { src: '', lien: '' },
        }),
      },
      { key: 'boutons', label: 'Boutons en bas de section (optionnel — vers une page /slug, une section #ancre ou un site https://…)', type: 'buttons' },
      anchorField,
    ],
    defaults: () => ({ boutons: [], tag: '', titre: 'Les Terrains', desc: '', terrains: [], anchor: 'terrains' }),
  },

  galerie: {
    label: 'Galerie photos',
    description: 'Grille d’images (la première en grand format)',
    group: 'Listes & grilles',
    schema: [
      ...headerFields,
      {
        key: 'images', label: 'Images', type: 'list', itemLabel: 'Image',
        fields: [imageField('image', 'Image')],
        newItem: () => ({ id: uid('img'), image: { src: '', lien: '' } }),
      },
      { key: 'boutons', label: 'Boutons en bas de section (optionnel — vers une page /slug, une section #ancre ou un site https://…)', type: 'buttons' },
      anchorField,
    ],
    defaults: () => ({ boutons: [], tag: '', titre: 'Galerie', desc: '', images: [], anchor: 'galerie' }),
  },

  tarifs: {
    label: 'Grille de tarifs',
    description: 'Colonnes de tarifs avec icône, lignes « prestation | prix » et mise en avant',
    group: 'Listes & grilles',
    schema: [
      ...headerFields,
      {
        key: 'colonnes', label: 'Colonnes', type: 'list', itemLabel: 'Colonne',
        fields: [
          { key: 'icon', label: 'Icône (emoji)', type: 'text' },
          { key: 'nom', label: 'Nom', type: 'text' },
          { key: 'lignes', label: 'Lignes « prestation | prix » (une par ligne)', type: 'textarea' },
          { key: 'lien', label: 'Lien « Détails » (ex : /airsoft)', type: 'text' },
          { key: 'highlight', label: 'Mise en avant', type: 'checkbox' },
          { key: 'badge', label: 'Badge (si mise en avant)', type: 'text' },
        ],
        newItem: () => ({ id: uid('tar'), icon: '🎯', nom: '', lignes: '', lien: '', highlight: false, badge: '' }),
      },
      { key: 'note_paiement', label: 'Afficher les moyens de paiement (paramètres du site)', type: 'checkbox' },
      { key: 'boutons', label: 'Boutons en bas de section (optionnel — vers une page /slug, une section #ancre ou un site https://…)', type: 'buttons' },
      anchorField,
    ],
    defaults: () => ({ boutons: [], tag: '', titre: 'Tarifs', desc: '', colonnes: [], note_paiement: true, anchor: 'tarifs' }),
  },

  tarifs_table: {
    label: 'Tableau de tarifs simple',
    description: 'Une seule carte de lignes « prestation | prix » + note',
    group: 'Listes & grilles',
    schema: [
      { key: 'titre', label: 'Titre', type: 'text' },
      { key: 'lignes', label: 'Lignes « prestation | prix » (une par ligne)', type: 'textarea' },
      { key: 'note', label: 'Note (italique sous le tableau)', type: 'text' },
      { key: 'boutons', label: 'Boutons en bas de section (optionnel — vers une page /slug, une section #ancre ou un site https://…)', type: 'buttons' },
      anchorField,
    ],
    defaults: () => ({ boutons: [], titre: 'Tarifs', lignes: '', note: '', anchor: '' }),
  },

  logos: {
    label: 'Grille de logos',
    description: 'Logos de partenaires, cliquables si un lien est renseigné',
    group: 'Listes & grilles',
    schema: [
      ...headerFields,
      {
        key: 'logos', label: 'Logos', type: 'list', itemLabel: 'Logo',
        fields: [
          { key: 'nom', label: 'Nom', type: 'text' },
          imageField('image', 'Logo'),
        ],
        newItem: () => ({ id: uid('lg'), nom: '', image: { src: '', lien: '' } }),
      },
      { key: 'boutons', label: 'Boutons en bas de section (optionnel — vers une page /slug, une section #ancre ou un site https://…)', type: 'buttons' },
      anchorField,
    ],
    defaults: () => ({ boutons: [], tag: '', titre: 'Nos partenaires', desc: '', logos: [], anchor: '' }),
  },

  actualites: {
    label: 'Liste d’actualités',
    description: 'Articles datés avec image et lien optionnels',
    group: 'Listes & grilles',
    schema: [
      ...headerFields,
      {
        key: 'articles', label: 'Articles', type: 'list', itemLabel: 'Article',
        fields: [
          { key: 'titre', label: 'Titre', type: 'text' },
          { key: 'date', label: 'Date', type: 'date' },
          { key: 'contenu', label: 'Contenu', type: 'textarea' },
          imageField('image', 'Image'),
          { key: 'lien', label: 'Lien « En savoir plus »', type: 'text' },
          { key: 'lien_label', label: 'Texte du lien', type: 'text' },
        ],
        newItem: () => ({
          id: uid('art'), titre: 'Nouvel article', date: new Date().toISOString().slice(0, 10),
          contenu: '', image: { src: '', lien: '' }, lien: '', lien_label: '',
        }),
      },
      { key: 'boutons', label: 'Boutons en bas de section (optionnel — vers une page /slug, une section #ancre ou un site https://…)', type: 'buttons' },
    ],
    defaults: () => ({ boutons: [], tag: 'News', titre: 'Actualités', desc: '', articles: [] }),
  },

  // ---------------- INTERACTIF ----------------
  sessions_calendrier: {
    label: 'Agenda des sessions',
    description: 'Liste filtrable + calendrier mensuel des sessions (réservation HelloAsso)',
    group: 'Interactif',
    schema: [
      ...headerFields,
      {
        key: 'sessions', label: 'Sessions', type: 'list', itemLabel: 'Session',
        fields: [
          { key: 'nom', label: 'Nom', type: 'text' },
          {
            key: 'categorie', label: 'Catégorie', type: 'select',
            options: [
              { value: 'lutte', label: 'Lutte' },
              { value: 'ecole', label: 'École' },
              { value: 'culture', label: 'Culture' },
              { value: 'evenement', label: 'Événement' },
            ],
          },
          { key: 'description', label: 'Description', type: 'textarea' },
          { key: 'date', label: 'Date', type: 'date' },
          { key: 'heure_debut', label: 'Heure de début', type: 'text' },
          { key: 'heure_fin', label: 'Heure de fin', type: 'text' },
          { key: 'lieu', label: 'Lieu', type: 'text' },
          imageField('image', 'Image'),
          { key: 'lien_helloasso', label: 'Lien HelloAsso', type: 'text' },
        ],
        newItem: () => ({
          id: uid('ses'), nom: 'Nouvelle session', categorie: 'lutte', description: '',
          date: new Date().toISOString().slice(0, 10), heure_debut: '', heure_fin: '',
          lieu: '', image: { src: '', lien: '' }, lien_helloasso: '',
        }),
      },
    ],
    defaults: () => ({ tag: 'Agenda', titre: 'Sessions & Réservations', desc: '', sessions: [] }),
  },

  sessions_apercu: {
    label: 'Aperçu des sessions',
    description: 'Les prochaines sessions de l’agenda (source : bloc « Agenda des sessions »)',
    group: 'Interactif',
    schema: [
      ...headerFields,
      { key: 'nb', label: 'Nombre de sessions affichées', type: 'text' },
      anchorField,
    ],
    defaults: () => ({ tag: 'Agenda', titre: 'Prochaines Sessions', desc: '', nb: '6', anchor: 'sessions' }),
  },

  carte_points: {
    label: 'Carte interactive',
    description: 'Image de carte avec points cliquables (photo + description par zone)',
    group: 'Interactif',
    schema: [
      imageField('image', 'Image de la carte', { noLink: true }),
      { key: 'note', label: 'Note sous la carte', type: 'text' },
      {
        key: 'points', label: 'Points', type: 'list', itemLabel: 'Point',
        fields: [
          { key: 'label', label: 'Nom de la zone', type: 'text' },
          { key: 'desc', label: 'Description', type: 'textarea' },
          { key: 'x', label: 'Position X (% depuis la gauche)', type: 'text' },
          { key: 'y', label: 'Position Y (% depuis le haut)', type: 'text' },
          imageField('image', 'Photo de la zone', { noLink: true }),
        ],
        newItem: () => ({ id: uid('pt'), label: 'Zone', desc: '', x: 50, y: 50, image: { src: '', lien: '' } }),
      },
      { key: 'boutons', label: 'Boutons en bas de section (optionnel — vers une page /slug, une section #ancre ou un site https://…)', type: 'buttons' },
      anchorField,
    ],
    defaults: () => ({ boutons: [], image: { src: '', lien: '' }, note: '', points: [], anchor: '' }),
  },

  contact: {
    label: 'Formulaire de contact',
    description: 'Formulaire + coordonnées (paramètres du site) + carte Google Maps',
    group: 'Interactif',
    schema: [...headerFields, anchorField],
    defaults: () => ({ tag: 'On vous attend', titre: 'Contactez-nous', desc: '', anchor: 'contact' }),
  },

  // ---------------- DIVERS ----------------
  boutons: {
    label: 'Boutons',
    description: 'Rangée de boutons, centrés',
    group: 'Divers',
    schema: [{ key: 'boutons', label: 'Boutons', type: 'buttons' }, anchorField],
    defaults: () => ({ boutons: [bouton()], anchor: '' }),
  },

  cta: {
    label: 'Appel à l’action',
    description: 'Encadré : question + boutons (réserver, contacter…)',
    group: 'Divers',
    schema: [
      { key: 'titre', label: 'Titre', type: 'text' },
      { key: 'boutons', label: 'Boutons', type: 'buttons' },
      anchorField,
    ],
    defaults: () => ({
      titre: "Prêt pour l'aventure ?",
      boutons: [bouton('Réserver maintenant', '/sessions'), bouton('Nous contacter', '/#contact', 'outline')],
      anchor: '',
    }),
  },

  separateur: {
    label: 'Séparateur',
    description: 'Espace vertical entre deux blocs',
    group: 'Divers',
    schema: [
      {
        key: 'taille', label: 'Hauteur', type: 'select',
        options: [
          { value: 'petit', label: 'Petit (2rem)' },
          { value: 'moyen', label: 'Moyen (4rem)' },
          { value: 'grand', label: 'Grand (8rem)' },
        ],
      },
    ],
    defaults: () => ({ taille: 'moyen' }),
  },
};

export const BLOCK_GROUPS = ['En-têtes', 'Contenu', 'Listes & grilles', 'Interactif', 'Divers'];

export const newBlock = (type) => ({ id: uid('blk'), type, props: BLOCKS[type].defaults() });
