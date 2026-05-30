// VleisKraft™ Subscription Tiers (B2B)
export type VleisKraftTier = 'free' | 'pro' | 'platinum';

export const VLEISKRAFT_TIERS = {
  free: {
    id: 'free', name_af: 'Gratis', name_en: 'Free', price: 0,
    color: '#6B7280',
    features_af: ['Basiese resepte', 'Snit-gids', 'Gemeenskap forum'],
    locked_af: ['AI Vleisidentifikasie', 'Koue-ketting IoT', 'B2B Groothandel', 'Akademie Pro', 'Noodkontakte'],
  },
  pro: {
    id: 'pro', name_af: 'Pro', name_en: 'Pro', price: 149,
    color: '#DC2626', badge: 'GEWILD',
    features_af: [
      'Alles in Gratis', 'AI Vleisidentifikasie', 'Volledige Akademie',
      'Noodkontakte', 'Gevorderde resepte', 'Seisoenale inhoud',
    ],
    locked_af: ['Koue-ketting IoT', 'B2B Groothandel', 'Dinamiese pryse', 'WhatsApp Handel'],
  },
  platinum: {
    id: 'platinum', name_af: 'Platinum', name_en: 'Platinum', price: 349,
    color: '#C9A84C', badge: 'B2B',
    features_af: [
      'Alles in Pro', 'Koue-ketting IoT Monitor', 'B2B Groothandel Portaal',
      'Dinamiese pryse', 'WhatsApp Handel', 'Stockvel Bestuur', 'Prioriteit ondersteuning',
    ],
    locked_af: [],
  },
} as const;

export const VLEISKRAFT_SUBSCRIBE_ROUTE = '/subscriptions';
export const VLEISKRAFT_ACCENT = '#DC2626';
