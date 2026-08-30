// Contenu initial du site Marsho → server/data.json
// Usage : node server/seed-marsho.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, 'data.json');

let n = 0;
const uid = (p) => `${p}_seed${++n}`;
const img = (src = '', lien = '') => ({ src, lien });
const block = (type, props) => ({ id: uid('blk'), type, props });
const btn = (label, href, style = 'primary') => ({ id: uid('btn'), label, href, style });

const U = (id, w = 1200) => `https://images.unsplash.com/${id}?w=${w}&q=80`;

const data = {
  settings: {
    site_name: 'Marsho',
    logo: '',
    tagline: 'Association',
    footer_tagline: 'Préserver notre culture, bâtir notre avenir',
    footer_desc: 'Association loi 1901 · Nantes',
    bandeau: { actif: false, message: '' },
    contact_info: {
      adresse: 'Nantes\nLoire-Atlantique (44)',
      tel_1: '',
      tel_2: '',
      email: 'contact@association-marsho.fr',
      paiements: 'HelloAsso · Virement · Chèque',
      facebook_url: '',
      instagram_url: '',
    },
  },

  navigation: [
    { id: uid('nav'), type: 'page', pageId: 'accueil', label: 'Accueil', cta: false },
    { id: uid('nav'), type: 'page', pageId: 'lutte', label: 'Lutte', cta: false },
    { id: uid('nav'), type: 'page', pageId: 'ecole', label: 'École', cta: false },
    { id: uid('nav'), type: 'page', pageId: 'culture', label: 'Culture', cta: false },
    { id: uid('nav'), type: 'page', pageId: 'contact', label: 'Contact', cta: false },
    { id: uid('nav'), type: 'page', pageId: 'soutenir', label: 'Faire un don', cta: true },
  ],

  pages: [
    // ============================ ACCUEIL ============================
    {
      id: 'accueil',
      slug: '',
      title: 'Accueil',
      blocks: [
        block('hero', {
          badge: 'Association loi 1901 · Nantes',
          titre_1: 'Préserver notre culture,',
          titre_2: 'bâtir notre avenir.',
          titre_3: '',
          desc: "Nous unissons notre communauté autour des valeurs de transmission, d'éducation et de solidarité. Rejoignez-nous pour construire un espace durable pour notre culture.",
          image: img(U('photo-1571019613454-1cb2f99b2d8b', 1920)),
          boutons: [
            btn('Soutenir le projet de local', '/soutenir'),
            btn('Découvrir nos activités', '#activites', 'outline'),
          ],
          stats: [
            { id: uid('st'), valeur: '3', unite: '', label: 'piliers : sport, école, culture' },
            { id: uid('st'), valeur: '2012', unite: '', label: 'des racines vivantes' },
            { id: uid('st'), valeur: '100', unite: '%', label: 'bénévole et associatif' },
          ],
          anchor: 'accueil',
        }),
        block('activites', {
          tag: "Ce qu'on propose",
          titre: 'Nos activités principales',
          desc: "Les piliers de notre association, dédiés à l'épanouissement sportif, intellectuel et culturel de notre communauté.",
          cartes: [
            {
              id: uid('act'),
              titre: 'Club de Lutte',
              texte: 'Tradition & performance. Notre club forme les jeunes athlètes en respectant les valeurs traditionnelles de la lutte libre, tout en visant l’excellence sportive dans un environnement encadré et motivant.',
              badge: 'Sport',
              badgeColor: '',
              features: 'Tous niveaux, dès 6 ans\nEntraîneurs certifiés\nEsprit d’équipe et discipline',
              image: img(U('photo-1555597673-b21d5c935865'), '/lutte'),
              lien: '/lutte',
              featured: false,
            },
            {
              id: uid('act'),
              titre: 'École Marsho',
              texte: 'Langues tchétchène & russe. Un espace dédié à la transmission linguistique pour les nouvelles générations, garantissant le maintien de nos racines culturelles.',
              badge: 'Éducation',
              badgeColor: '',
              features: 'De l’éveil aux cours adultes\nIntervenants natifs\nPetits groupes',
              image: img(U('photo-1503676260728-1c00da094a0b'), '/ecole'),
              lien: '/ecole',
              featured: false,
            },
            {
              id: uid('act'),
              titre: 'Événements & Traditions',
              texte: 'Fêtes & mémoire. Organisation de rassemblements communautaires, célébrations traditionnelles et commémorations pour tisser des liens forts au sein de la diaspora.',
              badge: 'Culture',
              badgeColor: '',
              features: 'Festivals et ateliers\nProjets de mémoire\nOuverts à toutes et tous',
              image: img(U('photo-1514525253161-7a46d19cd819'), '/culture'),
              lien: '/culture',
              featured: false,
            },
          ],
          anchor: 'activites',
        }),
        block('apropos', {
          tag: 'Qui sommes-nous',
          titre: "Une communauté, trois missions",
          corps: "L'Association Marsho rassemble à Nantes les familles attachées à la culture tchétchène autour d'un projet commun : transmettre.\n\nTransmettre le goût de l'effort par le sport, transmettre la langue par l'école, transmettre la mémoire par la culture. Le tout dans un esprit d'ouverture, de solidarité et de respect.",
          image: img(U('photo-1529156069898-49953e39b3ac', 900)),
          image_badge: 'Marsho signifie « liberté »\nen tchétchène',
          boutons: [btn('Nous contacter', '/contact', 'outline')],
          valeurs: [
            { id: uid('v'), icon: '🤝', titre: 'Solidarité', texte: 'Un réseau d’entraide pour la communauté' },
            { id: uid('v'), icon: '📖', titre: 'Transmission', texte: 'La langue et la culture aux nouvelles générations' },
            { id: uid('v'), icon: '🏅', titre: 'Exigence', texte: 'Le sport comme école de la discipline' },
            { id: uid('v'), icon: '🌍', titre: 'Ouverture', texte: 'Des événements ouverts à tous les Nantais' },
          ],
          anchor: 'apropos',
        }),
        block('cta', {
          titre: 'Un local à nous, pour durer : aidez-nous à le construire',
          boutons: [btn('Soutenir le projet', '/soutenir'), btn('En savoir plus', '/soutenir', 'outline')],
          anchor: '',
        }),
      ],
    },

    // ============================ LUTTE ============================
    {
      id: 'lutte',
      slug: 'lutte',
      title: 'Club de Lutte',
      blocks: [
        block('activite_hero', {
          titre: 'Club de Lutte : tradition & performance',
          intro: "Rejoignez notre club pour développer force, agilité et discipline. Encadrés par des professionnels, nos entraînements sont conçus pour tous les niveaux, de l'initiation à la compétition de haut niveau.",
          image: img(U('photo-1555597673-b21d5c935865', 1600)),
        }),
        block('boutons', {
          boutons: [btn("S'inscrire maintenant", '/contact'), btn('Voir les horaires', '#horaires', 'outline')],
          anchor: '',
        }),
        block('colonnes', {
          titre: "Horaires d'entraînement",
          intro: 'Des sessions adaptées à chaque tranche d’âge et niveau d’expérience.',
          colonnes: [
            { id: uid('col'), titre: 'Enfants (6-12 ans)', sous_titre: 'Éveil et initiation', texte: 'Mercredi : 14h00 – 16h00\nSamedi : 10h00 – 12h00' },
            { id: uid('col'), titre: 'Adolescents (13-17 ans)', sous_titre: 'Perfectionnement', texte: 'Mardi & jeudi : 18h00 – 20h00\nSamedi : 14h00 – 16h00' },
            { id: uid('col'), titre: 'Adultes & compétiteurs', sous_titre: 'Performance', texte: 'Lundi, mercredi, vendredi : 19h30 – 21h30\nDimanche (open mat) : 10h00 – 13h00' },
          ],
          boutons: [],
          anchor: 'horaires',
        }),
        block('icones', {
          titre: 'Notre équipe technique',
          items: [
            { id: uid('ic'), icon: '🥇', titre: 'Magomed K.', texte: 'Entraîneur principal' },
            { id: uid('ic'), icon: '🧒', titre: 'Adam S.', texte: 'Responsable jeunes' },
            { id: uid('ic'), icon: '💪', titre: 'Islam D.', texte: 'Préparation physique' },
          ],
          boutons: [],
          anchor: '',
        }),
        block('cta', {
          titre: 'Prêt à fouler le tapis ?',
          boutons: [btn("S'inscrire", '/contact'), btn('Poser une question', '/contact', 'outline')],
          anchor: '',
        }),
      ],
    },

    // ============================ ÉCOLE ============================
    {
      id: 'ecole',
      slug: 'ecole',
      title: 'École Marsho',
      blocks: [
        block('activite_hero', {
          titre: 'École Marsho : langues tchétchène & russe',
          intro: "Préserver l'héritage, construire l'avenir. Découvrez nos programmes d'apprentissage adaptés à tous les âges et niveaux.",
          image: img(U('photo-1503676260728-1c00da094a0b', 1600)),
        }),
        block('texte', {
          titre: 'Notre approche pédagogique',
          corps: "Une méthode immersive combinant rigueur académique et pratique culturelle. Nous mettons l'accent sur la communication orale tout en assurant des bases grammaticales solides.",
          puces: 'Petits groupes pour un suivi personnalisé\nIntervenants natifs et diplômés\nMatériel pédagogique moderne',
          boutons: [],
          anchor: '',
        }),
        block('colonnes', {
          titre: 'Niveaux de classe',
          intro: 'Des programmes structurés pour chaque étape de l’apprentissage.',
          colonnes: [
            { id: uid('col'), titre: 'Éveil (4-6 ans)', sous_titre: 'Découverte ludique', texte: 'Initiation aux sons et au vocabulaire de base à travers des jeux et des comptines.' },
            { id: uid('col'), titre: 'Enfants (7-12 ans)', sous_titre: 'Lire, écrire, parler', texte: 'Apprentissage de la lecture, de l’écriture et développement de la conversation courante.' },
            { id: uid('col'), titre: 'Adultes', sous_titre: 'Cours du soir', texte: 'Cours structurés par niveaux (A1 à C1) pour une maîtrise complète de la langue.' },
          ],
          boutons: [],
          anchor: 'niveaux',
        }),
        block('cta', {
          titre: 'Inscrire un enfant ou rejoindre un cours adulte ?',
          boutons: [btn('Demander une inscription', '/contact'), btn('Nous écrire', '/contact', 'outline')],
          anchor: '',
        }),
      ],
    },

    // ============================ CULTURE ============================
    {
      id: 'culture',
      slug: 'culture',
      title: 'Culture',
      blocks: [
        block('titre_page', {
          tag: 'Héritage & partage',
          titre: 'Culture : événements & traditions',
          desc: 'Plongez au cœur de nos racines. Nos initiatives pour préserver, célébrer et transmettre notre patrimoine culturel à travers des événements rassembleurs et des projets mémoriels.',
        }),
        block('actualites', {
          tag: 'Agenda',
          titre: 'Événements à venir',
          desc: '',
          articles: [
            {
              id: uid('art'),
              titre: 'Grand Festival du Printemps Caucasien',
              date: '2026-05-15',
              contenu: 'Une journée entière dédiée aux danses, chants et gastronomie traditionnelle. Un moment de partage inoubliable pour toute la famille.',
              image: img(U('photo-1533174072545-7a4b6ad7a6c3', 900)),
              lien: '/contact',
              lien_label: 'Réserver sa place',
            },
            {
              id: uid('art'),
              titre: 'Atelier : transmission par le conte',
              date: '2026-06-02',
              contenu: 'Découverte des mythes et légendes anciens, animée par nos aînés.',
              image: img(U('photo-1519791883288-dc8bd696e667', 900)),
              lien: '',
              lien_label: '',
            },
            {
              id: uid('art'),
              titre: 'Exposition : mémoire photographique',
              date: '2026-06-18',
              contenu: "Vernissage de la nouvelle collection d'archives visuelles de la diaspora.",
              image: img(U('photo-1493925410384-84f842e616fb', 900)),
              lien: '',
              lien_label: '',
            },
          ],
          boutons: [],
        }),
        block('colonnes', {
          titre: 'Projets de mémoire culturelle',
          intro: "Notre engagement pour sauvegarder l'histoire et garantir l'accès à nos racines pour les générations futures.",
          colonnes: [
            { id: uid('col'), titre: 'Bibliothèque numérique', sous_titre: 'Accès libre', texte: 'Numérisation et catalogage continu de manuscrits, livres et documents historiques pour un accès public libre et transparent.' },
            { id: uid('col'), titre: 'Archives de la diaspora', sous_titre: 'Collecte de témoignages', texte: 'Recueil de récits, photographies et objets auprès des familles pour constituer une mémoire commune et vivante.' },
          ],
          boutons: [],
          anchor: '',
        }),
        block('cta', {
          titre: 'Envie de participer ou de proposer un événement ?',
          boutons: [btn('Nous contacter', '/contact'), btn('Soutenir nos projets', '/soutenir', 'outline')],
          anchor: '',
        }),
      ],
    },

    // ============================ SOUTENIR ============================
    {
      id: 'soutenir',
      slug: 'soutenir',
      title: 'Soutenir le projet',
      blocks: [
        block('titre_page', {
          tag: 'Projet immobilier',
          titre: 'Bâtir notre avenir',
          desc: "Nous avons besoin d'un lieu à nous pour ancrer nos activités de lutte, d'éducation et de culture. Ce projet immobilier est l'étape cruciale pour pérenniser l'Association Marsho et offrir un espace d'épanouissement durable à notre communauté.",
        }),
        block('colonnes', {
          titre: 'Pourquoi faire un don ?',
          intro: "Votre contribution nous permettra d'acquérir et d'aménager un espace dédié, structuré autour de nos trois piliers.",
          colonnes: [
            { id: uid('col'), titre: 'Salle de lutte', sous_titre: 'Le sport', texte: 'Un dojo permanent équipé de tapis professionnels pour des entraînements quotidiens en toute sécurité.' },
            { id: uid('col'), titre: 'Salles de classe', sous_titre: 'L’école', texte: 'Des espaces calmes et lumineux pour notre école, favorisant l’apprentissage et le soutien scolaire.' },
            { id: uid('col'), titre: 'Centre culturel', sous_titre: 'La culture', texte: 'Un lieu de rassemblement pour célébrer, partager et transmettre notre héritage culturel commun.' },
          ],
          boutons: [],
          anchor: '',
        }),
        block('texte', {
          titre: 'Campagne de financement',
          corps: "Nous préparons actuellement le lancement officiel de notre cagnotte en ligne pour ce projet d'envergure (intégration HelloAsso à venir).\n\nEn attendant, vous pouvez nous contacter directement pour toute promesse de don ou proposition de partenariat.",
          puces: '',
          boutons: [btn('Nous contacter pour un don', '/contact')],
          anchor: 'campagne',
        }),
      ],
    },

    // ============================ CONTACT ============================
    {
      id: 'contact',
      slug: 'contact',
      title: 'Contact',
      blocks: [
        block('titre_page', {
          tag: 'On vous répond',
          titre: 'Contactez-nous',
          desc: 'Une question sur la lutte, l’école, un événement ou le projet de local ? Écrivez-nous.',
        }),
        block('contact', { tag: '', titre: '', desc: '', anchor: 'contact' }),
      ],
    },
  ],
};

fs.writeFileSync(OUT, JSON.stringify(data, null, 2));
console.log(`OK — ${data.pages.length} pages, ${data.navigation.length} items de nav → ${OUT}`);
