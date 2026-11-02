import { Icon } from '@ui/components/Icon';

/**
 * A painted thumbnail for a list row, falling back to the SVG glyph when the thing has no
 * art. Decorative either way: the row's name is the label.
 */
export function Thumb({ art, icon }: { art: string | undefined; icon: string }) {
  if (!art) return <Icon name={icon} size={20} className="build-icon" />;
  return <img className="thumb" src={art} alt="" width={44} height={44} loading="lazy" />;
}
