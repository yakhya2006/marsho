// Composants de rendu des blocs — utilisés par le site public ET
// par les aperçus de l'admin (fidélité garantie par construction).
import React from 'react';
import { HeroBlock, ActiviteHeroBlock, TitrePageBlock } from './Heros';
import { TexteBlock, HtmlBlock, AProposBlock, IconesBlock, ColonnesBlock } from './Contenu';
import {
  ActivitesBlock, TerrainsBlock, GalerieBlock, TarifsBlock,
  TarifsTableBlock, LogosBlock, ActualitesBlock,
} from './Grilles';
import {
  SessionsCalendrierBlock, SessionsApercuBlock, CartePointsBlock, ContactBlock,
} from './Interactif';
import { BoutonsBlock, CtaBlock, SeparateurBlock } from './Divers';

export const BLOCK_RENDERERS = {
  hero: HeroBlock,
  activite_hero: ActiviteHeroBlock,
  titre_page: TitrePageBlock,
  texte: TexteBlock,
  colonnes: ColonnesBlock,
  html: HtmlBlock,
  apropos: AProposBlock,
  icones: IconesBlock,
  activites: ActivitesBlock,
  terrains: TerrainsBlock,
  galerie: GalerieBlock,
  tarifs: TarifsBlock,
  tarifs_table: TarifsTableBlock,
  logos: LogosBlock,
  actualites: ActualitesBlock,
  sessions_calendrier: SessionsCalendrierBlock,
  sessions_apercu: SessionsApercuBlock,
  carte_points: CartePointsBlock,
  contact: ContactBlock,
  boutons: BoutonsBlock,
  cta: CtaBlock,
  separateur: SeparateurBlock,
};

export function BlockView({ block, data, isFirst }) {
  const Renderer = BLOCK_RENDERERS[block.type];
  if (!Renderer) return null;
  return <Renderer props={block.props} data={data} isFirst={isFirst} />;
}

// Rend la pile de blocs d'une page
export function PageRenderer({ page, data }) {
  return (
    <main>
      {(page.blocks || []).map((block, i) => (
        <BlockView key={block.id} block={block} data={data} isFirst={i === 0} />
      ))}
    </main>
  );
}
