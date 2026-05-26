type Lang = 'en' | 'af';

const strings: Record<string, Record<Lang, string>> = {
  // Admin
  manageOrders:     { en: 'Manage Orders',       af: 'Bestellings Bestuur' },
  manageProducts:   { en: 'Manage Products',      af: 'Produkte Bestuur' },
  manageCustomers:  { en: 'Manage Customers',     af: 'Kliënte Bestuur' },
  featureFlags:     { en: 'Feature Flags',        af: 'Kenmerk Vlae' },
  woocommerce:      { en: 'WooCommerce Sync',     af: 'WooCommerce Sinkroniseer' },
  posImport:        { en: 'POS Import',           af: 'POS Invoer' },
  margins:          { en: 'Margin Analysis',      af: 'Marge Analise' },
  shelfLife:        { en: 'Shelf Life Tracker',   af: 'Raklewe Nasporing' },
  sentiment:        { en: 'Customer Sentiment',   af: 'Kliënt Sentiment' },
  platinumButchery: { en: 'Platinum Branding',    af: 'Platinum Handelsmerk' },
  // Orders
  orderDetails:     { en: 'Order Details',        af: 'Bestelling Besonderhede' },
  reorder:          { en: 'Reorder',              af: 'Herbestel' },
  rateOrder:        { en: 'Rate this order',      af: 'Gradeer hierdie bestelling' },
  submitRating:     { en: 'Submit Rating',        af: 'Stuur Gradering' },
  // Delivery
  deliveryTracker:  { en: 'Delivery Tracking',    af: 'Aflewering Nasporing' },
  preparing:        { en: 'Preparing',            af: 'Voorbereiding' },
  onTheWay:         { en: 'On the Way',           af: 'Onderweg' },
  arrived:          { en: 'Arrived',              af: 'Aangekom' },
  delivered:        { en: 'Delivered',            af: 'Afgelewer' },
  // Common
  loading:          { en: 'Loading...',           af: 'Laai...' },
  error:            { en: 'Error',                af: 'Fout' },
  save:             { en: 'Save',                 af: 'Stoor' },
  cancel:           { en: 'Cancel',               af: 'Kanselleer' },
  back:             { en: 'Back',                 af: 'Terug' },
};

export function t(key: string, lang: Lang = 'en'): string {
  return strings[key]?.[lang] ?? key;
}
