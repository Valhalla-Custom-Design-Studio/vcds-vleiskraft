import { getLocales } from 'expo-localization';

const translations: Record<string, Record<string, string>> = {
  af: {
    // Nav
    home: 'Tuis', shop: 'Winkel', orders: 'Bestellings', profile: 'Profiel',
    login: 'Teken In', logout: 'Teken Uit', email: 'E-pos', password: 'Wagwoord',
    error: 'Fout', fill_all_fields: 'Vul alle velde in', login_failed: 'Aanmelding misluk',
    no_account_register: 'Geen rekening? Registreer', welcome_back: 'Welkom terug',
    premium_meat_platform: 'Premium Vleis Platform', spent: 'Bestee', trace: 'Spoor',
    challenges: 'Uitdagings', meal_planner: 'Maaltydplanner', quick_actions: 'Vinnige Aksies',
    add_to_cart: 'Voeg by Mandjie', checkout: 'Betaal', cart: 'Mandjie', total: 'Totaal',
    no_orders: 'Geen bestellings', order_status: 'Bestelling Status', track: 'Volg',
    ask_vleisgpt: 'Vra VleisAI...', send: 'Stuur', subscription: 'Intekening',
    upgrade: 'Opgradeer', settings: 'Instellings', business_name: 'Besigheidsnaam',
    save: 'Stoor', cancel: 'Kanselleer', confirm: 'Bevestig', delete: 'Verwyder',
    search: 'Soek', filter: 'Filter', sort: 'Sorteer', price: 'Prys', weight: 'Gewig',
    cut: 'Snit', grade: 'Graad', origin: 'Oorsprong', in_stock: 'In Voorraad',
    out_of_stock: 'Uit Voorraad', add: 'Voeg By', remove: 'Verwyder',
    // Admin
    adminDashboard: 'Admin Paneelbord', manageOrders: 'Bestellings Bestuur',
    manageProducts: 'Produkte Bestuur', manageCustomers: 'Kliënte Bestuur',
    featureFlags: 'Kenmerkvlae', woocommerce: 'WooCommerce',
    posImport: 'POS Invoer', margins: 'Marges', shelfLife: 'Rakleeftyd',
    sentiment: 'Sentiment', platinumButchery: 'Platinum Slaghuis',
    todayOrders: 'Vandag Bestellings', todayRevenue: 'Vandag Inkomste',
    pending: 'Hangende', totalCustomers: 'Totale Kliënte',
    // WooCommerce
    wooUrl: 'WooCommerce URL', wooKey: 'Verbruikerssleutel', wooSecret: 'Verbruikersgeheim',
    testConnection: 'Toets Verbinding', loading: 'Laai...',
    importSuccess: 'Invoer Suksesvol', productsReplaced: 'Produkte is vervang',
    importProducts: 'Invoer Produkte', importCustomers: 'Invoer Kliënte',
    importOrders: 'Invoer Bestellings', importRunning: 'Invoer loop...',
    // Orders
    items: 'Items', orderAgain: 'Bestel Weer', rateOrder: 'Gradeer Bestelling',
    howWasOrder: 'Hoe was jou bestelling?', commentOptional: 'Kommentaar (opsioneel)',
    submitRating: 'Dien Gradering In', deliveryTracker: 'Afleweringsopvolger',
    // Diary
    newEntry: 'Nuwe Inskrywing',
  },
  en: {
    // Nav
    home: 'Home', shop: 'Shop', orders: 'Orders', profile: 'Profile',
    login: 'Login', logout: 'Logout', email: 'Email', password: 'Password',
    error: 'Error', fill_all_fields: 'Fill in all fields', login_failed: 'Login failed',
    no_account_register: 'No account? Register', welcome_back: 'Welcome back',
    premium_meat_platform: 'Premium Meat Platform', spent: 'Spent', trace: 'Trace',
    challenges: 'Challenges', meal_planner: 'Meal Planner', quick_actions: 'Quick Actions',
    add_to_cart: 'Add to Cart', checkout: 'Checkout', cart: 'Cart', total: 'Total',
    no_orders: 'No orders yet', order_status: 'Order Status', track: 'Track',
    ask_vleisgpt: 'Ask VleisAI...', send: 'Send', subscription: 'Subscription',
    upgrade: 'Upgrade', settings: 'Settings', business_name: 'Business Name',
    save: 'Save', cancel: 'Cancel', confirm: 'Confirm', delete: 'Delete',
    search: 'Search', filter: 'Filter', sort: 'Sort', price: 'Price', weight: 'Weight',
    cut: 'Cut', grade: 'Grade', origin: 'Origin', in_stock: 'In Stock',
    out_of_stock: 'Out of Stock', add: 'Add', remove: 'Remove',
    // Admin
    adminDashboard: 'Admin Dashboard', manageOrders: 'Manage Orders',
    manageProducts: 'Manage Products', manageCustomers: 'Manage Customers',
    featureFlags: 'Feature Flags', woocommerce: 'WooCommerce',
    posImport: 'POS Import', margins: 'Margins', shelfLife: 'Shelf Life',
    sentiment: 'Sentiment', platinumButchery: 'Platinum Butchery',
    todayOrders: "Today's Orders", todayRevenue: "Today's Revenue",
    pending: 'Pending', totalCustomers: 'Total Customers',
    // WooCommerce
    wooUrl: 'WooCommerce URL', wooKey: 'Consumer Key', wooSecret: 'Consumer Secret',
    testConnection: 'Test Connection', loading: 'Loading...',
    importSuccess: 'Import Successful', productsReplaced: 'Existing products will be replaced',
    importProducts: 'Import Products', importCustomers: 'Import Customers',
    importOrders: 'Import Orders', importRunning: 'Import running...',
    // Orders
    items: 'Items', orderAgain: 'Order Again', rateOrder: 'Rate Order',
    howWasOrder: 'How was your order?', commentOptional: 'Comment (optional)',
    submitRating: 'Submit Rating', deliveryTracker: 'Delivery Tracker',
    // Diary
    newEntry: 'New Entry',
  },
};

const locale = getLocales()[0]?.languageCode || 'af';
const lang = locale === 'af' ? 'af' : 'en';
const langData = translations[lang] || translations['en'];

export const t = (key: string): string => langData[key] || key;

export function useI18n() {
  return { t, lang };
}
