import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Save, LogOut, ShieldCheck, CheckCircle, Settings, Folder, FileText, Plus,
  Trash2, Link2, PanelLeft, MousePointerClick, ExternalLink, Home, Image as ImageIcon,
  HelpCircle, ArrowRight, MoveRight, GripVertical, ChevronRight, Copy, LayoutTemplate,
  ImagePlus, Users, History,
} from 'lucide-react';
import { publishData } from '../config/api';
import { uid, collectAnchors, pathForPage } from '../config/helpers';
import { newBlock } from '../config/blocks';
import NavTree, { removeNavItem } from '../admin/NavTree';
import BlocksEditor from '../admin/BlocksEditor';
import MediaLibrary from '../admin/MediaLibrary';
import UsersView from '../admin/UsersView';
import BackupsView from '../admin/BackupsView';
import TranslationsModal from '../admin/TranslationsModal';
import '../admin/admin.css';

const slugify = (text) =>
  String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'page';

// ---- Éditeur d'un item de navigation ----

function NavItemEditor({ item, data, onChange, onDelete, onEditPage }) {
  const pages = data.pages;

  if (item.type === 'dropdown') {
    return (
      <div className="admin-editor-inner" key={item.id}>
        <div className="admin-editor-head">
          <div>
            <span className="admin-chip"><Folder size={12} /> Menu déroulant</span>
            <h1 style={{ marginTop: '0.6rem' }}>{item.label}</h1>
          </div>
          <button type="button" className="admin-btn-danger" onClick={onDelete}><Trash2 size={14} /> Supprimer</button>
        </div>
        <div className="admin-card">
          <div className="admin-field">
            <label className="admin-label">Libellé affiché dans la barre de navigation</label>
            <input className="admin-input" value={item.label} onChange={(e) => onChange({ label: e.target.value })} />
          </div>
          <p className="admin-editor-sub">
            Ce bouton ouvre un sous-menu. Ajoutez-y des pages avec le bouton « + » dans la barre latérale,
            ou glissez-déposez une page au centre de ce dossier.
          </p>
        </div>
      </div>
    );
  }

  if (item.type === 'lien') {
    const targetPage = pages.find((p) => p.id === item.pageId);
    const anchors = collectAnchors(targetPage);
    const isExternal = !!item.url;
    const targetBlock = (targetPage?.blocks || []).find((b) => b.props?.anchor === item.anchor);

    return (
      <div className="admin-editor-inner" key={item.id}>
        <div className="admin-editor-head">
          <div>
            <span className="admin-chip admin-chip--lien"><Link2 size={12} /> Bouton du menu (raccourci)</span>
            <h1 style={{ marginTop: '0.6rem' }}>{item.label}</h1>
          </div>
          <button type="button" className="admin-btn-danger" onClick={onDelete}><Trash2 size={14} /> Supprimer</button>
        </div>

        {/* Résumé visuel : où mène ce bouton + accès direct au contenu */}
        <div className="admin-card lien-target-card">
          <div className="lien-target-line">
            <span className="lien-target-chip">Menu : « {item.label} »</span>
            <MoveRight size={18} />
            <span className="lien-target-chip lien-target-chip--page">
              {isExternal
                ? item.url
                : `Page « ${targetPage?.title || '?'} »${item.anchor ? ` → section « ${targetBlock ? (targetBlock.props.titre || item.anchor) : item.anchor} »` : ''}`}
            </span>
          </div>
          <p className="admin-editor-sub" style={{ margin: '0.7rem 0 1rem' }}>
            Ce bouton du menu fait juste défiler le visiteur vers cet endroit — son contenu ne se modifie pas ici.
          </p>
          {!isExternal && targetPage && (
            <button type="button" className="admin-btn-primary" onClick={() => onEditPage(targetPage.id, item.anchor)}>
              <ArrowRight size={14} /> Modifier le contenu de cette section
            </button>
          )}
        </div>

        <div className="admin-card">
          <div className="admin-field">
            <label className="admin-label">Libellé affiché dans le menu</label>
            <input className="admin-input" value={item.label} onChange={(e) => onChange({ label: e.target.value })} />
          </div>

          <div className="admin-field">
            <label className="admin-label">Type de cible</label>
            <select
              className="admin-select"
              value={isExternal ? 'externe' : 'interne'}
              onChange={(e) =>
                e.target.value === 'externe'
                  ? onChange({ url: 'https://', pageId: '', anchor: '' })
                  : onChange({ url: '', pageId: pages[0]?.id || '' })
              }
            >
              <option value="interne">Une section d'une page du site</option>
              <option value="externe">Une adresse externe (https://…)</option>
            </select>
          </div>

          {isExternal ? (
            <div className="admin-field">
              <label className="admin-label">Adresse</label>
              <input className="admin-input" value={item.url} onChange={(e) => onChange({ url: e.target.value })} />
            </div>
          ) : (
            <>
              <div className="admin-field">
                <label className="admin-label">Page cible</label>
                <select
                  className="admin-select"
                  value={item.pageId || ''}
                  onChange={(e) => onChange({ pageId: e.target.value, anchor: '' })}
                >
                  {pages.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div className="admin-field">
                <label className="admin-label">Section de la page (ancre)</label>
                <select className="admin-select" value={item.anchor || ''} onChange={(e) => onChange({ anchor: e.target.value })}>
                  <option value="">Haut de page</option>
                  {anchors.map((a) => <option key={a} value={a}>#{a}</option>)}
                </select>
                <p className="admin-editor-sub" style={{ marginTop: '0.4rem' }}>
                  Les sections listées sont celles de la page cible ayant une « ancre » renseignée.
                </p>
              </div>
            </>
          )}

          <div className="admin-field admin-field--checkbox" style={{ marginTop: '0.8rem' }}>
            <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input type="checkbox" checked={!!item.cta} onChange={(e) => onChange({ cta: e.target.checked })} />
              Bouton mis en avant (bouton plein dans le menu)
            </label>
          </div>
        </div>
      </div>
    );
  }

  // item.type === 'page'
  const page = pages.find((p) => p.id === item.pageId);
  return (
    <div className="admin-editor-inner" key={item.id}>
      <div className="admin-editor-head">
        <div>
          <span className="admin-chip"><FileText size={12} /> Entrée de menu → page</span>
          <h1 style={{ marginTop: '0.6rem' }}>{item.label}</h1>
        </div>
        <button type="button" className="admin-btn-danger" onClick={onDelete}><Trash2 size={14} /> Retirer du menu</button>
      </div>
      <div className="admin-card">
        <div className="admin-field">
          <label className="admin-label">Libellé affiché dans le menu</label>
          <input className="admin-input" value={item.label} onChange={(e) => onChange({ label: e.target.value })} />
        </div>
        <div className="admin-field">
          <label className="admin-label">Page liée</label>
          <select className="admin-select" value={item.pageId || ''} onChange={(e) => onChange({ pageId: e.target.value })}>
            {pages.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>
        <div className="admin-field admin-field--checkbox">
          <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input type="checkbox" checked={!!item.cta} onChange={(e) => onChange({ cta: e.target.checked })} />
            Bouton mis en avant (bouton plein dans le menu)
          </label>
        </div>
        {page && (
          <button type="button" className="admin-btn-primary" onClick={() => onEditPage(page.id)}>
            <FileText size={14} /> Modifier le contenu de « {page.title} »
          </button>
        )}
      </div>
    </div>
  );
}

// ---- Paramètres du site ----

function SettingsEditor({ settings, onChange }) {
  const contact = settings.contact_info || {};
  const setContact = (patch) => onChange({ contact_info: { ...contact, ...patch } });
  const bandeau = settings.bandeau || {};

  const F = ({ label, value, onValue, textarea }) => (
    <div className="admin-field">
      <label className="admin-label">{label}</label>
      {textarea ? (
        <textarea className="admin-textarea" rows={2} value={value || ''} onChange={(e) => onValue(e.target.value)} />
      ) : (
        <input className="admin-input" value={value || ''} onChange={(e) => onValue(e.target.value)} />
      )}
    </div>
  );

  return (
    <div className="admin-editor-inner">
      <div className="admin-editor-head">
        <div>
          <span className="admin-chip"><Settings size={12} /> Paramètres du site</span>
          <h1 style={{ marginTop: '0.6rem' }}>Identité & coordonnées</h1>
        </div>
      </div>

      <div className="admin-card">
        <h3 className="admin-card-title">📣 Bandeau défilant</h3>
        <div className="admin-field admin-field--checkbox">
          <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={!!bandeau.actif}
              onChange={(e) => onChange({ bandeau: { ...bandeau, actif: e.target.checked } })}
            />
            Afficher le bandeau défilant en haut du site
          </label>
        </div>
        <F label="Message du bandeau" value={bandeau.message} onValue={(v) => onChange({ bandeau: { ...bandeau, message: v } })} />
      </div>

      <div className="admin-card">
        <h3 className="admin-card-title">⚜️ Identité</h3>
        <F label="Nom du site (logo texte)" value={settings.site_name} onValue={(v) => onChange({ site_name: v })} />
        <F label="Logo (chemin médiathèque ou URL — optionnel)" value={settings.logo} onValue={(v) => onChange({ logo: v })} />
        <F label="Sous-titre du logo" value={settings.tagline} onValue={(v) => onChange({ tagline: v })} />
        <F label="Slogan (pied de page)" value={settings.footer_tagline} onValue={(v) => onChange({ footer_tagline: v })} />
        <F label="Description (pied de page)" value={settings.footer_desc} onValue={(v) => onChange({ footer_desc: v })} />
      </div>

      <div className="admin-card">
        <h3 className="admin-card-title">📍 Coordonnées</h3>
        <F label="Adresse" value={contact.adresse} onValue={(v) => setContact({ adresse: v })} textarea />
        <F label="Téléphone 1" value={contact.tel_1} onValue={(v) => setContact({ tel_1: v })} />
        <F label="Téléphone 2" value={contact.tel_2} onValue={(v) => setContact({ tel_2: v })} />
        <F label="Email" value={contact.email} onValue={(v) => setContact({ email: v })} />
        <F label="Moyens de paiement" value={contact.paiements} onValue={(v) => setContact({ paiements: v })} />
        <F label="Facebook (URL)" value={contact.facebook_url} onValue={(v) => setContact({ facebook_url: v })} />
        <F label="Instagram (URL)" value={contact.instagram_url} onValue={(v) => setContact({ instagram_url: v })} />
      </div>
    </div>
  );
}

// ---- Admin ----

export default function Admin({ data, onUpdateData, onLogout }) {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(data.settings || {});
  const [nav, setNav] = useState(data.navigation || []);
  const [pages, setPages] = useState(data.pages || []);
  const [selection, setSelection] = useState({ kind: 'guide' });
  const [toast, setToast] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile : drawer
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop : replié
  const [newPageModal, setNewPageModal] = useState(null); // { parentId? }
  const [maintenanceModal, setMaintenanceModal] = useState(false);
  const [translateFor, setTranslateFor] = useState(null); // id de page
  const [newPageTitle, setNewPageTitle] = useState('');
  const [confirmDeletePage, setConfirmDeletePage] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const select = (kind, id, anchor) => {
    setSelection({ kind, id, anchor });
    setSidebarOpen(false);
  };

  // ---- Navigation : recherche d'items ----

  const findNavItemById = (id) => {
    for (const it of nav) {
      if (it.id === id) return it;
      for (const c of it.children || []) if (c.id === id) return c;
    }
    return null;
  };

  const navItemsForPage = (pageId) => {
    const res = [];
    for (const it of nav) {
      if (it.type === 'page' && it.pageId === pageId) res.push(it);
      for (const c of it.children || []) if (c.type === 'page' && c.pageId === pageId) res.push(c);
    }
    return res;
  };

  // ---- Mutations navigation ----

  const updateNavItem = (id, patch) => {
    const apply = (items) => items.map((item) => {
      if (item.id === id) return { ...item, ...patch };
      if (item.children) return { ...item, children: apply(item.children) };
      return item;
    });
    setNav(apply(nav));
  };

  const deleteNavItem = (id) => {
    const [without] = removeNavItem(nav, id);
    setNav(without);
    setSelection({ kind: 'nav', id: without[0]?.id });
  };

  const addNavItem = (item) => {
    setNav([...nav, item]);
    select('nav', item.id);
  };

  // ---- Mutations pages ----

  const updatePage = (id, patch) =>
    setPages(pages.map((p) => (p.id === id ? { ...p, ...patch } : p)));

  const createPage = () => {
    const title = newPageTitle.trim() || 'Nouvelle page';
    let slug = slugify(title);
    while (pages.some((p) => p.slug === slug)) slug += '-2';
    const page = {
      id: uid('page'),
      slug,
      title,
      blocks: [{ ...newBlock('titre_page'), props: { tag: '', titre: title, desc: '' } }],
    };
    setPages([...pages, page]);

    const navItem = { id: uid('nav'), type: 'page', pageId: page.id, label: title, cta: false };
    if (newPageModal?.parentId) {
      setNav(nav.map((item) =>
        item.id === newPageModal.parentId
          ? { ...item, children: [...(item.children || []), navItem] }
          : item
      ));
    } else {
      setNav([...nav, navItem]);
    }
    setNewPageModal(null);
    setNewPageTitle('');
    select('page', page.id);
  };

  const deletePage = (id) => {
    setConfirmDeletePage(null);
    setPages(pages.filter((p) => p.id !== id));
    // Retire aussi les items de menu qui pointaient dessus
    const strip = (items) => items
      .filter((it) => it.pageId !== id || it.type === 'lien')
      .map((it) => (it.children ? { ...it, children: strip(it.children) } : it));
    setNav(strip(nav));
    setSelection({ kind: 'settings' });
  };

  // ---- Publication ----

  const handlePublish = async () => {
    const payload = { settings, navigation: nav, pages };
    try {
      await publishData(payload);
      onUpdateData(payload);
      showToast('✓ Publié — visible par tous les visiteurs');
    } catch (err) {
      if (err.message === 'SESSION_EXPIREE') {
        onLogout();
        navigate('/login');
      } else {
        showToast('Échec de la publication : ' + err.message);
      }
    }
  };

  // Fermer/rouvrir le site : appliqué et publié immédiatement
  const toggleMaintenance = async () => {
    setMaintenanceModal(false);
    const next = { ...settings, maintenance: !settings.maintenance };
    setSettings(next);
    const payload = { settings: next, navigation: nav, pages };
    try {
      await publishData(payload);
      onUpdateData(payload);
      showToast(next.maintenance ? '🔴 Site fermé aux visiteurs' : '✓ Site rouvert aux visiteurs');
    } catch (err) {
      if (err.message === 'SESSION_EXPIREE') {
        onLogout();
        navigate('/login');
      } else {
        showToast('Échec : ' + err.message);
      }
    }
  };

  const workingData = { settings, navigation: nav, pages };

  // ---- Rendu de l'éditeur selon la sélection ----

  const renderEditor = () => {
    if (selection.kind === 'guide') {
      return (
        <div className="admin-editor-inner guide">
          <div className="admin-editor-head">
            <div>
              <span className="admin-chip"><HelpCircle size={12} /> Guide</span>
              <h1 style={{ marginTop: '0.6rem' }}>Mode d'emploi complet</h1>
              <p className="admin-editor-sub">
                Tout ce qu'il faut savoir pour gérer le site, sans aucune connaissance technique.
              </p>
            </div>
          </div>

          {/* ---------- 0. Vue d'ensemble ---------- */}
          <div className="admin-card guide-card">
            <h3 className="admin-card-title">Comment le site est construit</h3>
            <div className="guide-schema">
              <div className="guide-schema-box">
                <strong>Le menu</strong>
                <span>la barre en haut du site — colonne de gauche de cet admin</span>
              </div>
              <MoveRight size={18} className="guide-schema-arrow" />
              <div className="guide-schema-box">
                <strong>Les pages</strong>
                <span>Accueil, Airsoft, Partenaires…</span>
              </div>
              <MoveRight size={18} className="guide-schema-arrow" />
              <div className="guide-schema-box">
                <strong>Les sections</strong>
                <span>chaque page = des sections empilées de haut en bas (un « gabarit » chacune)</span>
              </div>
            </div>
            <p>
              Vous modifiez ce que vous voulez, puis vous cliquez <strong>« Publier »</strong> (en haut à droite) pour
              mettre en ligne. Tant que vous n'avez pas publié, les visiteurs voient l'ancienne version — vous pouvez
              donc essayer sans risque.
            </p>
          </div>

          {/* ---------- 1. Modifier une page ---------- */}
          <div className="admin-card guide-card">
            <h3 className="admin-card-title">1 · Modifier le texte ou les images d'une page</h3>
            <ol className="guide-steps">
              <li>Dans la colonne de gauche, cliquez sur la page (ex : <em>Club de Lutte</em>). L'Accueil est en bas, dans « Pages hors menu ».</li>
              <li>La page s'ouvre : sa liste de sections apparaît. Chaque ligne ressemble à ceci :</li>
            </ol>
            <div className="guide-demo">
              <div className="block-item" style={{ pointerEvents: 'none' }}>
                <div className="block-item-head">
                  <GripVertical size={14} className="grip" />
                  <ChevronRight size={15} />
                  <span className="block-item-label">Grille de tarifs</span>
                  <span className="block-item-summary">« Tarifs »</span>
                  <div className="block-item-actions">
                    <button type="button"><LayoutTemplate size={13} /></button>
                    <button type="button"><Copy size={13} /></button>
                    <button type="button" className="danger"><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
              <div className="guide-legend">
                <span><GripVertical size={12} /> glisser pour déplacer la section</span>
                <span><LayoutTemplate size={12} /> changer de gabarit</span>
                <span><Copy size={12} /> dupliquer</span>
                <span><Trash2 size={12} /> supprimer</span>
              </div>
            </div>
            <ol className="guide-steps" start={3}>
              <li>Cliquez sur la ligne : la section se déplie. En haut, un <strong>aperçu réel</strong> (exactement ce que verront les visiteurs). En dessous, le formulaire.</li>
              <li>Modifiez les champs — chaque champ correspond à un élément visible de l'aperçu. Pour les textes longs : laissez une <strong>ligne vide</strong> entre deux paragraphes. Aucun code n'est jamais demandé.</li>
              <li>Cliquez <strong>« Publier »</strong> quand tout vous convient.</li>
            </ol>
          </div>

          {/* ---------- 2. Images ---------- */}
          <div className="admin-card guide-card">
            <h3 className="admin-card-title">2 · Les images (Médiathèque)</h3>
            <p>Un champ image ressemble à ceci :</p>
            <div className="guide-demo" style={{ pointerEvents: 'none' }}>
              <div className="image-field">
                <span className="image-field-thumb"><ImagePlus size={20} /></span>
                <div className="image-field-body">
                  <div className="image-field-row">
                    <span className="admin-btn-ghost">Choisir dans la médiathèque</span>
                  </div>
                  <div className="image-field-link">
                    <Link2 size={13} />
                    <span className="admin-input" style={{ opacity: 0.6 }}>Lien (optionnel) — l'image devient un bouton cliquable</span>
                  </div>
                </div>
              </div>
            </div>
            <ul className="guide-list">
              <li><strong>« Choisir dans la médiathèque »</strong> ouvre vos fichiers : cliquez une vignette pour l'utiliser. Le bouton « Importer » ajoute vos propres photos (elles restent disponibles partout ensuite).</li>
              <li>La page <strong>Médiathèque</strong> (colonne de gauche, section Site) permet aussi de glisser-déposer plusieurs fichiers d'un coup, de les rechercher et de les supprimer.</li>
              <li>Le champ <strong>« Lien »</strong> sous l'image : si vous le remplissez (ex : <code>/lutte</code> ou <code>https://helloasso.com/…</code>), l'image devient cliquable et un petit bouton apparaît dessus au survol.</li>
            </ul>
          </div>

          {/* ---------- 3. Sections / gabarits ---------- */}
          <div className="admin-card guide-card">
            <h3 className="admin-card-title">3 · Ajouter une section, changer de gabarit</h3>
            <ul className="guide-list">
              <li>En bas de chaque page : <strong>« + Ajouter une section (choisir un gabarit) »</strong>. Un catalogue s'ouvre — galerie, tarifs, texte en colonnes, carte interactive, agenda… — chacun avec un <strong>aperçu réel</strong> avant d'ajouter.</li>
              <li>Pour transformer une section existante sans la refaire : l'icône <LayoutTemplate size={13} style={{ verticalAlign: '-2px' }} /> sur sa ligne. Les titres, textes et images déjà remplis sont <strong>conservés</strong>.</li>
              <li>Réorganisez en attrapant <GripVertical size={13} style={{ verticalAlign: '-2px' }} /> et en déposant la section plus haut ou plus bas — l'ordre à l'écran = l'ordre sur le site.</li>
              <li>La plupart des gabarits ont un champ <strong>« Boutons en bas de section »</strong> : texte + lien (page du site, section, ou site externe) + style doré ou contour.</li>
            </ul>
          </div>

          {/* ---------- 4. Pages & menu ---------- */}
          <div className="admin-card guide-card">
            <h3 className="admin-card-title">4 · Créer des pages et organiser le menu</h3>
            <p>Les trois boutons en haut de la colonne de gauche :</p>
            <ul className="guide-list">
              <li><strong><FileText size={13} style={{ verticalAlign: '-2px' }} /> Page</strong> — crée une nouvelle page (avec son entrée dans le menu). Elle démarre avec un simple titre : ajoutez ensuite les sections que vous voulez.</li>
              <li><strong><Folder size={13} style={{ verticalAlign: '-2px' }} /> Menu</strong> — crée un menu déroulant (comme un menu à sous-pages) dans lequel vous glissez des pages.</li>
              <li><strong><Link2 size={13} style={{ verticalAlign: '-2px' }} /> Raccourci</strong> — crée un bouton de menu qui ne contient rien : il fait juste <strong>défiler</strong> le visiteur vers une section d'une page (utile pour pointer vers une section précise d'une page) ou ouvre un site externe. Si vous n'en avez pas besoin, ignorez-le.</li>
            </ul>
            <ul className="guide-list">
              <li>Le <strong>nom d'une page dans le menu</strong> et le style « bouton doré » (comme Réserver) se règlent en haut de l'éditeur de la page, où se trouve aussi « Retirer du menu ».</li>
              <li>Une page retirée du menu n'est pas supprimée : elle reste accessible par son adresse et apparaît dans <strong>« Pages hors menu »</strong>.</li>
              <li>Glissez-déposez les items de la colonne pour réordonner le menu ; déposez une page <em>au centre</em> d'un menu déroulant pour l'y ranger.</li>
            </ul>
          </div>

          {/* ---------- 5. Paramètres + publication ---------- */}
          <div className="admin-card guide-card">
            <h3 className="admin-card-title">5 · Paramètres du site et mise en ligne</h3>
            <ul className="guide-list">
              <li><strong>Paramètres du site</strong> (colonne de gauche) : le bandeau défilant du haut, le logo, le slogan et toutes les coordonnées affichées en bas de page et dans la section Contact.</li>
              <li><strong>« Voir le site »</strong> ouvre le site dans un nouvel onglet pour vérifier.</li>
              <li><strong>« Publier »</strong> met tout en ligne d'un coup (pages, menu, paramètres). Avant ça, rien n'est visible des visiteurs.</li>
            </ul>
            <p>
              💡 Astuces : dupliquez une section bien remplie plutôt que d'en recréer une vide · les « ⚙ Options
              avancées » en bas des formulaires ne servent que pour les raccourcis de menu, ignorez-les au quotidien ·
              en cas de doute, modifiez, regardez l'aperçu, et ne publiez que quand c'est bon.
            </p>
          </div>
        </div>
      );
    }
    if (selection.kind === 'media') {
      return <MediaLibrary onToast={showToast} onAuthError={() => { onLogout(); navigate('/login'); }} />;
    }
    if (selection.kind === 'users') {
      return <UsersView onToast={showToast} onAuthError={() => { onLogout(); navigate('/login'); }} />;
    }
    if (selection.kind === 'backups') {
      return (
        <BackupsView
          onToast={showToast}
          onAuthError={() => { onLogout(); navigate('/login'); }}
          onRestored={(fresh) => {
            setSettings(fresh.settings || {});
            setNav(fresh.navigation || []);
            setPages(fresh.pages || []);
            onUpdateData(fresh);
          }}
        />
      );
    }
    if (selection.kind === 'settings') {
      return <SettingsEditor settings={settings} onChange={(patch) => setSettings({ ...settings, ...patch })} />;
    }
    if (selection.kind === 'page') {
      const page = pages.find((p) => p.id === selection.id);
      if (!page) return null;
      const isHome = page.slug === '';
      const menuItems = navItemsForPage(page.id);
      const menuItem = menuItems[0];
      return (
        <div className="admin-editor-inner" key={page.id}>
          <div className="admin-editor-head">
            <div>
              <span className="admin-chip"><FileText size={12} /> Page</span>
              <h1 style={{ marginTop: '0.6rem' }}>{page.title}</h1>
              <p className="admin-editor-sub">⛓ {pathForPage(page)}</p>
            </div>
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
              <button type="button" className="admin-btn-ghost" onClick={() => setTranslateFor(page.id)}>
                🌐 Traductions
              </button>
              {!isHome && (
                <button type="button" className="admin-btn-danger" onClick={() => setConfirmDeletePage(page.id)}>
                  <Trash2 size={14} /> Supprimer la page
                </button>
              )}
            </div>
          </div>

          <div className="admin-card">
            <div className="admin-grid-2">
              <div className="admin-field">
                <label className="admin-label">Titre de la page</label>
                <input className="admin-input" value={page.title} onChange={(e) => updatePage(page.id, { title: e.target.value })} />
              </div>
              <div className="admin-field">
                <label className="admin-label">Slug (URL)</label>
                <input
                  className="admin-input"
                  value={page.slug}
                  disabled={isHome}
                  placeholder={isHome ? '/ (accueil)' : ''}
                  onChange={(e) => updatePage(page.id, { slug: slugify(e.target.value) })}
                />
              </div>
            </div>

            {/* Présence dans le menu de navigation */}
            {!isHome && (
              menuItem ? (
                <div className="admin-grid-2" style={{ alignItems: 'end', marginTop: '0.4rem' }}>
                  <div className="admin-field">
                    <label className="admin-label">Nom dans le menu de navigation</label>
                    <input
                      className="admin-input"
                      value={menuItem.label}
                      onChange={(e) => updateNavItem(menuItem.id, { label: e.target.value })}
                    />
                  </div>
                  <div className="admin-field" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
                    <label className="admin-label" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', cursor: 'pointer', margin: 0 }}>
                      <input
                        type="checkbox"
                        checked={!!menuItem.cta}
                        onChange={(e) => updateNavItem(menuItem.id, { cta: e.target.checked })}
                      />
                      Bouton mis en avant
                    </label>
                    <button
                      type="button"
                      className="admin-btn-ghost danger"
                      onClick={() => { const [without] = removeNavItem(nav, menuItem.id); setNav(without); }}
                    >
                      Retirer du menu
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: '0.4rem' }}>
                  <p className="admin-editor-sub" style={{ marginBottom: '0.5rem' }}>
                    Cette page n'apparaît pas dans le menu de navigation.
                  </p>
                  <button
                    type="button"
                    className="admin-btn-ghost"
                    onClick={() => setNav([...nav, { id: uid('nav'), type: 'page', pageId: page.id, label: page.title, cta: false }])}
                  >
                    <Plus size={13} /> Ajouter au menu
                  </button>
                </div>
              )
            )}
          </div>

          <BlocksEditor
            key={`${page.id}:${selection.anchor || ''}`}
            blocks={page.blocks || []}
            data={workingData}
            autoOpenAnchor={selection.anchor}
            onChange={(blocks) => updatePage(page.id, { blocks })}
          />
        </div>
      );
    }
    // nav item
    const findItem = (items) => {
      for (const it of items) {
        if (it.id === selection.id) return it;
        if (it.children) {
          const child = it.children.find((c) => c.id === selection.id);
          if (child) return child;
        }
      }
      return null;
    };
    const item = findItem(nav);
    if (!item) {
      return (
        <div className="admin-empty">
          <MousePointerClick size={30} opacity={0.35} />
          <p>Sélectionnez un élément dans la barre latérale.</p>
        </div>
      );
    }
    return (
      <NavItemEditor
        item={item}
        data={workingData}
        onChange={(patch) => updateNavItem(item.id, patch)}
        onDelete={() => deleteNavItem(item.id)}
        onEditPage={(pageId, anchor) => select('page', pageId, anchor)}
      />
    );
  };

  return (
    <div className="admin-root">
      <header className="admin-header">
        <div className="admin-brand">
          <span className="admin-brand-icon"><ShieldCheck size={18} /></span>
          <div>
            <strong>MARSHO <span>CMS</span></strong>
            <small>Pages, blocs, navigation & médias</small>
          </div>
        </div>
        <button
          type="button"
          className="admin-sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Menu"
        >
          <PanelLeft size={17} />
        </button>
        <div className="admin-header-actions">
          <a href="/" target="_blank" rel="noopener noreferrer" className="admin-btn-ghost">
            <ExternalLink size={14} /> Voir le site
          </a>
          <button type="button" className="admin-btn-primary" onClick={handlePublish}>
            <Save size={14} /> Publier
          </button>
          <button type="button" className="admin-btn-ghost" onClick={() => { onLogout(); navigate('/'); }}>
            <LogOut size={14} /> Quitter
          </button>
        </div>
      </header>

      <div className="admin-workspace">
        {sidebarCollapsed && (
          <button
            type="button"
            className="admin-burger admin-burger--floating"
            title="Afficher le menu"
            onClick={() => setSidebarCollapsed(false)}
          >
            ☰
          </button>
        )}
        <aside className={`admin-sidebar ${sidebarOpen ? 'open' : ''} ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="admin-sidebar-head">
            <button
              type="button"
              className="admin-burger"
              title="Masquer le menu"
              onClick={() => { setSidebarCollapsed(true); setSidebarOpen(false); }}
            >
              ☰
            </button>
            <span>Menu du site</span>
          </div>
          <div className="admin-sidebar-actions">
            <button type="button" className="admin-btn-ghost" onClick={() => { setNewPageModal({}); setNewPageTitle(''); }}>
              <FileText size={13} /> Page
            </button>
            <button
              type="button"
              className="admin-btn-ghost"
              onClick={() => addNavItem({ id: uid('nav'), type: 'dropdown', label: 'Nouveau menu', children: [] })}
            >
              <Folder size={13} /> Menu
            </button>
            <button
              type="button"
              className="admin-btn-ghost"
              title="Ajoute un bouton de menu qui fait défiler vers une section d'une page (ou ouvre un site externe)"
              onClick={() => addNavItem({ id: uid('nav'), type: 'lien', label: 'Raccourci', pageId: pages[0]?.id || '', anchor: '', url: '', cta: false })}
            >
              <Link2 size={13} /> Raccourci
            </button>
          </div>

          <div className="admin-tree">
            <NavTree
              navigation={nav}
              selectedId={
                selection.kind === 'nav'
                  ? selection.id
                  : selection.kind === 'page'
                    ? navItemsForPage(selection.id)[0]?.id || null
                    : null
              }
              onSelect={(id) => {
                const item = findNavItemById(id);
                // Cliquer une page du menu ouvre directement son contenu
                if (item?.type === 'page' && item.pageId) select('page', item.pageId);
                else select('nav', id);
              }}
              onChange={setNav}
              onAddPageInside={(parentId) => { setNewPageModal({ parentId }); setNewPageTitle(''); }}
            />

            {/* Pages qui n'apparaissent pas dans le menu */}
            {(() => {
              const orphans = pages.filter((p) => navItemsForPage(p.id).length === 0);
              if (!orphans.length) return null;
              return (
                <>
                  <div className="tree-section-title">Pages hors menu</div>
                  {orphans.map((p) => (
                    <div
                      key={p.id}
                      className={`tree-row ${selection.kind === 'page' && selection.id === p.id ? 'selected' : ''}`}
                      onClick={() => select('page', p.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="tree-row-main">
                        {p.slug === '' ? <Home size={15} className="tree-icon" /> : <FileText size={15} className="tree-icon" />}
                        <span className="tree-label">{p.title}</span>
                      </div>
                    </div>
                  ))}
                </>
              );
            })()}

            <div className="tree-section-title">Site</div>
            <div
              className={`tree-row ${selection.kind === 'guide' ? 'selected' : ''}`}
              onClick={() => select('guide')}
              style={{ cursor: 'pointer' }}
            >
              <div className="tree-row-main">
                <HelpCircle size={15} className="tree-icon" />
                <span className="tree-label">Guide — comment ça marche</span>
              </div>
            </div>
            <div
              className={`tree-row ${selection.kind === 'media' ? 'selected' : ''}`}
              onClick={() => select('media')}
              style={{ cursor: 'pointer' }}
            >
              <div className="tree-row-main">
                <ImageIcon size={15} className="tree-icon" />
                <span className="tree-label">Médiathèque</span>
              </div>
            </div>
            <div
              className={`tree-row ${selection.kind === 'settings' ? 'selected' : ''}`}
              onClick={() => select('settings')}
              style={{ cursor: 'pointer' }}
            >
              <div className="tree-row-main">
                <Settings size={15} className="tree-icon" />
                <span className="tree-label">Paramètres du site</span>
              </div>
            </div>
            <div
              className={`tree-row ${selection.kind === 'users' ? 'selected' : ''}`}
              onClick={() => select('users')}
              style={{ cursor: 'pointer' }}
            >
              <div className="tree-row-main">
                <Users size={15} className="tree-icon" />
                <span className="tree-label">Utilisateurs</span>
              </div>
            </div>
            <div
              className={`tree-row ${selection.kind === 'backups' ? 'selected' : ''}`}
              onClick={() => select('backups')}
              style={{ cursor: 'pointer' }}
            >
              <div className="tree-row-main">
                <History size={15} className="tree-icon" />
                <span className="tree-label">Sauvegardes</span>
              </div>
            </div>

            {/* Fermeture du site aux visiteurs (mode maintenance) */}
            <button
              type="button"
              className={`maintenance-btn ${settings.maintenance ? 'active' : ''}`}
              onClick={() => setMaintenanceModal(true)}
            >
              {settings.maintenance ? '🔴 Site fermé — cliquer pour rouvrir' : '🚧 Fermer le site aux visiteurs'}
            </button>
          </div>
        </aside>

        <main className="admin-editor">{renderEditor()}</main>
      </div>

      {newPageModal && (
        <div className="admin-modal-overlay" onClick={() => setNewPageModal(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Nouvelle page</h3>
            <p className="admin-modal-sub">
              La page est créée avec un bloc titre — ajoutez ensuite les blocs que vous voulez.
            </p>
            <div className="admin-field">
              <label className="admin-label">Titre de la page</label>
              <input
                className="admin-input"
                value={newPageTitle}
                autoFocus
                onChange={(e) => setNewPageTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') createPage(); }}
              />
            </div>
            <div className="admin-modal-actions">
              <button type="button" className="admin-btn-ghost" onClick={() => setNewPageModal(null)}>Annuler</button>
              <button type="button" className="admin-btn-primary" onClick={createPage}><Plus size={14} /> Créer</button>
            </div>
          </div>
        </div>
      )}

      {maintenanceModal && (
        <div className="admin-modal-overlay" onClick={() => setMaintenanceModal(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>{settings.maintenance ? 'Rouvrir le site ?' : 'Fermer le site aux visiteurs ?'}</h3>
            <p className="admin-modal-sub">
              {settings.maintenance
                ? 'Le site redeviendra immédiatement visible par tout le monde.'
                : 'Les visiteurs verront une page « site momentanément indisponible » avec un accès admin. Vous pourrez continuer à travailler et rouvrir quand tout est prêt. Effet immédiat.'}
            </p>
            <div className="admin-modal-actions">
              <button type="button" className="admin-btn-ghost" onClick={() => setMaintenanceModal(false)}>Annuler</button>
              <button
                type="button"
                className={settings.maintenance ? 'admin-btn-primary' : 'admin-btn-danger'}
                onClick={toggleMaintenance}
              >
                {settings.maintenance ? 'Rouvrir le site' : 'Fermer le site'}
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeletePage && (
        <div className="admin-modal-overlay" onClick={() => setConfirmDeletePage(null)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Supprimer cette page ?</h3>
            <p className="admin-modal-sub">
              La page et tous ses blocs seront supprimés, ainsi que ses entrées de menu.
            </p>
            <div className="admin-modal-actions">
              <button type="button" className="admin-btn-ghost" onClick={() => setConfirmDeletePage(null)}>Annuler</button>
              <button type="button" className="admin-btn-danger" onClick={() => deletePage(confirmDeletePage)}>Supprimer</button>
            </div>
          </div>
        </div>
      )}

      {translateFor && (() => {
        const pg = pages.find((p) => p.id === translateFor);
        if (!pg) return null;
        return (
          <TranslationsModal
            page={pg}
            onToast={showToast}
            onClose={() => setTranslateFor(null)}
            onSave={(i18n) => {
              updatePage(pg.id, { i18n });
              setTranslateFor(null);
              showToast('Traductions enregistrées — pensez à Publier');
            }}
          />
        );
      })()}

      {toast && (
        <div className="admin-toast">
          <CheckCircle size={15} /> {toast}
        </div>
      )}
    </div>
  );
}
