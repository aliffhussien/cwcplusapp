export const getTierMeta = (tierName, settings) => {
  if (tierName === 'Free' || !tierName) return { color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', label: 'Free Tier', hex: '#94a3b8' };

  const tier = settings?.premiumTiers?.find(t => t.name === tierName);
  if (tier?.color) return { color: 'text-white', bg: 'bg-slate-800', border: 'border-slate-700', label: tierName, customColor: tier.color, hex: tier.color };

  const colors = [
    { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/20', hex: '#60a5fa' },
    { color: 'text-accent', bg: 'bg-accent/10', border: 'border-accent/20', hex: '#34d399' },
    { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', hex: '#fbbf24' }
  ];

  const idx = settings?.premiumTiers?.findIndex(t => t.name === tierName);
  const safeIdx = idx === -1 || idx === undefined ? 0 : idx;
  const style = colors[safeIdx % colors.length];
  return { ...style, label: tierName };
};
