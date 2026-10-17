// Color map and helper for product color swatches across the application

export const COLOR_MAP: Record<string, string> = {
  'Aluminium': '#A8A9AD',
  'Arrow Red': '#D72638',
  'Beige': '#E2D5C3',
  'Black': '#111827',
  'Black Melange': '#23272F',
  'Bottle Green': '#14532D',
  'Burgundy': '#7F1D1D',
  'Carbon Grey Melange': '#4B5563',
  'Charcoal': '#374151',
  'Charcoal Melange': '#334155',
  'Chrome Yellow': '#EAB308',
  'Chutney Green': '#65A30D',
  'Classic Red': '#DC2626',
  'Dark Charcoal Melange': '#1F2937',
  'Dark Orange': '#EA580C',
  'Desert Sand': '#D4B996',
  'Emarald Green': '#047857',
  'Flag Green': '#15803D',
  'French Wine': '#881337',
  'Golden Yellow': '#F59E0B',
  'Grey Melange': '#9CA3AF',
  'Harbour Blue': '#0369A1',
  'Heather Rose': '#F43F5E',
  'I Blue Melange': '#38BDF8',
  'Ice Blue': '#BAE6FD',
  'Ice Green': '#A7F3D0',
  'Jet Black': '#0A0A0A',
  'Lavender': '#C084FC',
  'Lemon Yellow': '#FDE047',
  'Light Grey Melange': '#D1D5DB',
  'Light Turquoise Melange': '#2DD4BF',
  'Mint': '#86EFAC',
  'Navy': '#1E3A8A',
  'Navy Blue': '#172554',
  'Navy Melange': '#1E293B',
  'New Yellow': '#FACC15',
  'Olive': '#4D7C0F',
  'Onion': '#E11D48',
  'Pine Green': '#065F46',
  'Purple': '#7E22CE',
  'Rama Blue': '#0D9488',
  'Red': '#EF4444',
  'Royal Blue': '#2563EB',
  'Royal blue': '#2563EB',
  'Sage Green': '#84CC16',
  'Sky Blue': '#60A5FA',
  'Striking Purple': '#9333EA',
  'Strong Blue': '#1D4ED8',
  'Tale Blue': '#0284C7',
  'True Navy': '#0F172A',
  'White': '#FFFFFF',
  'Woody Orange': '#C2410C',
};

export function getColorDisplay(color: string): string {
  if (COLOR_MAP[color]) {
    return COLOR_MAP[color];
  }

  const c = color.toLowerCase();
  for (const [key, hex] of Object.entries(COLOR_MAP)) {
    if (key.toLowerCase() === c) return hex;
  }

  if (c.includes('white')) return '#FFFFFF';
  if (c.includes('black')) return '#111827';
  if (c.includes('charcoal')) return '#374151';
  if (c.includes('grey') || c.includes('melange') || c.includes('aluminium')) return '#9CA3AF';
  if (c.includes('navy')) return '#1E3A8A';
  if (c.includes('maroon') || c.includes('wine') || c.includes('burgundy')) return '#7F1D1D';
  if (c.includes('red')) return '#DC2626';
  if (c.includes('sky') || c.includes('ice blue')) return '#38BDF8';
  if (c.includes('blue')) return '#2563EB';
  if (c.includes('green') || c.includes('pine') || c.includes('mint')) return '#16A34A';
  if (c.includes('olive')) return '#65A30D';
  if (c.includes('yellow')) return '#FACC15';
  if (c.includes('orange')) return '#F97316';
  if (c.includes('purple') || c.includes('lavender')) return '#A855F7';
  if (c.includes('rose') || c.includes('onion')) return '#FB7185';
  if (c.includes('sand') || c.includes('beige')) return '#D4B996';

  return '#6B7280';
}
