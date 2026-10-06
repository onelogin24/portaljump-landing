// Phosphor Icons, light weight. Deep per-icon imports keep the bundle to exactly these eight glyphs.
import { AirplaneTilt } from '@phosphor-icons/react/dist/csr/AirplaneTilt';
import { Camera } from '@phosphor-icons/react/dist/csr/Camera';
import { ForkKnife } from '@phosphor-icons/react/dist/csr/ForkKnife';
import { PenNib } from '@phosphor-icons/react/dist/csr/PenNib';
import { FilmSlate } from '@phosphor-icons/react/dist/csr/FilmSlate';
import { MusicNotes } from '@phosphor-icons/react/dist/csr/MusicNotes';
import { PaintBrush } from '@phosphor-icons/react/dist/csr/PaintBrush';
import { Laptop } from '@phosphor-icons/react/dist/csr/Laptop';
import type { IconName } from '../data';

const GLYPHS = {
  plane: AirplaneTilt,
  camera: Camera,
  food: ForkKnife,
  design: PenNib,
  movies: FilmSlate,
  music: MusicNotes,
  art: PaintBrush,
  laptop: Laptop,
} as const;

/** 18px light-weight glyph, white (inherits currentColor from the chip). */
export function Icon({ name }: { name: IconName }) {
  const Glyph = GLYPHS[name];
  return <Glyph size={18} weight="light" color="currentColor" aria-hidden="true" focusable={false} />;
}

export function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
