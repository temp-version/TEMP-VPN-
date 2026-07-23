import { Country, AppService, EsimPlan, VpnServer } from '../types';

export const POPULAR_COUNTRIES: Country[] = [
  // FEATURED & AFRICA
  {
    code: 'NG',
    nameEn: 'Nigeria',
    nameHa: 'Najeriya (Nigeria)',
    flag: '🇳🇬',
    dialCode: '+234',
    region: 'Africa',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 1.20,
    virtualNumberStartingPriceUsd: 0.40,
    voipRateUsdPerMin: 0.025,
    featured: true
  },
  {
    code: 'US',
    nameEn: 'United States',
    nameHa: 'Amurka (USA)',
    flag: '🇺🇸',
    dialCode: '+1',
    region: 'Americas',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 1.50,
    virtualNumberStartingPriceUsd: 0.50,
    voipRateUsdPerMin: 0.01,
    featured: true
  },
  {
    code: 'GB',
    nameEn: 'United Kingdom',
    nameHa: 'Birtaniya (UK)',
    flag: '🇬🇧',
    dialCode: '+44',
    region: 'Europe',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 1.80,
    virtualNumberStartingPriceUsd: 0.60,
    voipRateUsdPerMin: 0.015,
    featured: true
  },
  {
    code: 'SA',
    nameEn: 'Saudi Arabia',
    nameHa: 'Saudiyya (Saudi Arabia)',
    flag: '🇸🇦',
    dialCode: '+966',
    region: 'Middle East',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 2.20,
    virtualNumberStartingPriceUsd: 0.80,
    voipRateUsdPerMin: 0.04,
    featured: true
  },
  {
    code: 'AE',
    nameEn: 'United Arab Emirates',
    nameHa: 'Hadaddiyar Daular Larabawa (UAE)',
    flag: '🇦🇪',
    dialCode: '+971',
    region: 'Middle East',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 2.50,
    virtualNumberStartingPriceUsd: 0.90,
    voipRateUsdPerMin: 0.045,
    featured: true
  },
  {
    code: 'GH',
    nameEn: 'Ghana',
    nameHa: 'Gana (Ghana)',
    flag: '🇬🇭',
    dialCode: '+233',
    region: 'Africa',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 1.40,
    virtualNumberStartingPriceUsd: 0.45,
    voipRateUsdPerMin: 0.03,
    featured: true
  },
  {
    code: 'KE',
    nameEn: 'Kenya',
    nameHa: 'Kenya',
    flag: '🇰🇪',
    dialCode: '+254',
    region: 'Africa',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 1.60,
    virtualNumberStartingPriceUsd: 0.50,
    voipRateUsdPerMin: 0.03,
    featured: true
  },
  {
    code: 'ZA',
    nameEn: 'South Africa',
    nameHa: 'Afirka ta Kudu (South Africa)',
    flag: '🇿🇦',
    dialCode: '+27',
    region: 'Africa',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 1.70,
    virtualNumberStartingPriceUsd: 0.55,
    voipRateUsdPerMin: 0.035,
    featured: true
  },
  {
    code: 'EG',
    nameEn: 'Egypt',
    nameHa: 'Misra (Egypt)',
    flag: '🇪🇬',
    dialCode: '+20',
    region: 'Africa',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 1.80,
    virtualNumberStartingPriceUsd: 0.55,
    voipRateUsdPerMin: 0.04
  },
  {
    code: 'MA',
    nameEn: 'Morocco',
    nameHa: 'Maroko (Morocco)',
    flag: '🇲🇦',
    dialCode: '+212',
    region: 'Africa',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 1.90,
    virtualNumberStartingPriceUsd: 0.60,
    voipRateUsdPerMin: 0.04
  },
  {
    code: 'SN',
    nameEn: 'Senegal',
    nameHa: 'Senegal',
    flag: '🇸🇳',
    dialCode: '+221',
    region: 'Africa',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 1.85,
    virtualNumberStartingPriceUsd: 0.55,
    voipRateUsdPerMin: 0.05
  },
  {
    code: 'CI',
    nameEn: 'Ivory Coast',
    nameHa: 'Kwah ta Giwa (Ivory Coast)',
    flag: '🇨🇮',
    dialCode: '+225',
    region: 'Africa',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 1.80,
    virtualNumberStartingPriceUsd: 0.50,
    voipRateUsdPerMin: 0.05
  },
  {
    code: 'CM',
    nameEn: 'Cameroon',
    nameHa: 'Kameru (Cameroon)',
    flag: '🇨🇲',
    dialCode: '+237',
    region: 'Africa',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 1.80,
    virtualNumberStartingPriceUsd: 0.50,
    voipRateUsdPerMin: 0.05
  },
  {
    code: 'ET',
    nameEn: 'Ethiopia',
    nameHa: 'Habasha (Ethiopia)',
    flag: '🇪🇹',
    dialCode: '+251',
    region: 'Africa',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 2.10,
    virtualNumberStartingPriceUsd: 0.65,
    voipRateUsdPerMin: 0.06
  },
  {
    code: 'TZ',
    nameEn: 'Tanzania',
    nameHa: 'Tanzaniya (Tanzania)',
    flag: '🇹🇿',
    dialCode: '+255',
    region: 'Africa',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 1.70,
    virtualNumberStartingPriceUsd: 0.55,
    voipRateUsdPerMin: 0.04
  },
  {
    code: 'UG',
    nameEn: 'Uganda',
    nameHa: 'Uganda',
    flag: '🇺🇬',
    dialCode: '+256',
    region: 'Africa',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 1.75,
    virtualNumberStartingPriceUsd: 0.50,
    voipRateUsdPerMin: 0.045
  },
  {
    code: 'RW',
    nameEn: 'Rwanda',
    nameHa: 'Ruwanda (Rwanda)',
    flag: '🇷🇼',
    dialCode: '+250',
    region: 'Africa',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 1.80,
    virtualNumberStartingPriceUsd: 0.55,
    voipRateUsdPerMin: 0.04
  },

  // EUROPE
  {
    code: 'DE',
    nameEn: 'Germany',
    nameHa: 'Jamus (Germany)',
    flag: '🇩🇪',
    dialCode: '+49',
    region: 'Europe',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 1.90,
    virtualNumberStartingPriceUsd: 0.70,
    voipRateUsdPerMin: 0.02,
    featured: true
  },
  {
    code: 'FR',
    nameEn: 'France',
    nameHa: 'Faransa (France)',
    flag: '🇫🇷',
    dialCode: '+33',
    region: 'Europe',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 1.90,
    virtualNumberStartingPriceUsd: 0.65,
    voipRateUsdPerMin: 0.02
  },
  {
    code: 'IT',
    nameEn: 'Italy',
    nameHa: 'Italiya (Italy)',
    flag: '🇮🇹',
    dialCode: '+39',
    region: 'Europe',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 1.85,
    virtualNumberStartingPriceUsd: 0.65,
    voipRateUsdPerMin: 0.02
  },
  {
    code: 'ES',
    nameEn: 'Spain',
    nameHa: 'Sipaniya (Spain)',
    flag: '🇪🇸',
    dialCode: '+34',
    region: 'Europe',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 1.80,
    virtualNumberStartingPriceUsd: 0.60,
    voipRateUsdPerMin: 0.02
  },
  {
    code: 'NL',
    nameEn: 'Netherlands',
    nameHa: 'Holan (Netherlands)',
    flag: '🇳🇱',
    dialCode: '+31',
    region: 'Europe',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 1.90,
    virtualNumberStartingPriceUsd: 0.70,
    voipRateUsdPerMin: 0.02
  },
  {
    code: 'PL',
    nameEn: 'Poland',
    nameHa: 'Polan (Poland)',
    flag: '🇵🇱',
    dialCode: '+48',
    region: 'Europe',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 1.70,
    virtualNumberStartingPriceUsd: 0.55,
    voipRateUsdPerMin: 0.025
  },
  {
    code: 'TR',
    nameEn: 'Turkey',
    nameHa: 'Turkiya (Turkey)',
    flag: '🇹🇷',
    dialCode: '+90',
    region: 'Europe',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 1.50,
    virtualNumberStartingPriceUsd: 0.50,
    voipRateUsdPerMin: 0.03
  },
  {
    code: 'SE',
    nameEn: 'Sweden',
    nameHa: 'Suwidan (Sweden)',
    flag: '🇸🇪',
    dialCode: '+46',
    region: 'Europe',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 2.00,
    virtualNumberStartingPriceUsd: 0.70,
    voipRateUsdPerMin: 0.025
  },
  {
    code: 'CH',
    nameEn: 'Switzerland',
    nameHa: 'Suwizalan (Switzerland)',
    flag: '🇨🇭',
    dialCode: '+41',
    region: 'Europe',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 2.20,
    virtualNumberStartingPriceUsd: 0.85,
    voipRateUsdPerMin: 0.03
  },

  // AMERICAS
  {
    code: 'CA',
    nameEn: 'Canada',
    nameHa: 'Kanada (Canada)',
    flag: '🇨🇦',
    dialCode: '+1',
    region: 'Americas',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 1.60,
    virtualNumberStartingPriceUsd: 0.55,
    voipRateUsdPerMin: 0.012
  },
  {
    code: 'BR',
    nameEn: 'Brazil',
    nameHa: 'Burazil (Brazil)',
    flag: '🇧🇷',
    dialCode: '+55',
    region: 'Americas',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 1.80,
    virtualNumberStartingPriceUsd: 0.60,
    voipRateUsdPerMin: 0.03
  },
  {
    code: 'MX',
    nameEn: 'Mexico',
    nameHa: 'Meksiko (Mexico)',
    flag: '🇲🇽',
    dialCode: '+52',
    region: 'Americas',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 1.70,
    virtualNumberStartingPriceUsd: 0.55,
    voipRateUsdPerMin: 0.025
  },
  {
    code: 'AR',
    nameEn: 'Argentina',
    nameHa: 'Arjantina (Argentina)',
    flag: '🇦🇷',
    dialCode: '+54',
    region: 'Americas',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 1.90,
    virtualNumberStartingPriceUsd: 0.60,
    voipRateUsdPerMin: 0.035
  },
  {
    code: 'CO',
    nameEn: 'Colombia',
    nameHa: 'Kolombiya (Colombia)',
    flag: '🇨🇴',
    dialCode: '+57',
    region: 'Americas',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 1.85,
    virtualNumberStartingPriceUsd: 0.55,
    voipRateUsdPerMin: 0.03
  },

  // ASIA & OCEANIA
  {
    code: 'CN',
    nameEn: 'China',
    nameHa: 'Sin (China)',
    flag: '🇨🇳',
    dialCode: '+86',
    region: 'Asia',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 2.10,
    virtualNumberStartingPriceUsd: 0.75,
    voipRateUsdPerMin: 0.02
  },
  {
    code: 'IN',
    nameEn: 'India',
    nameHa: 'Indiya (India)',
    flag: '🇮🇳',
    dialCode: '+91',
    region: 'Asia',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 1.50,
    virtualNumberStartingPriceUsd: 0.45,
    voipRateUsdPerMin: 0.02
  },
  {
    code: 'JP',
    nameEn: 'Japan',
    nameHa: 'Japan (Japan)',
    flag: '🇯🇵',
    dialCode: '+81',
    region: 'Asia',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 2.30,
    virtualNumberStartingPriceUsd: 0.80,
    voipRateUsdPerMin: 0.03
  },
  {
    code: 'KR',
    nameEn: 'South Korea',
    nameHa: 'Koriya ta Kudu (South Korea)',
    flag: '🇰🇷',
    dialCode: '+82',
    region: 'Asia',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 2.20,
    virtualNumberStartingPriceUsd: 0.80,
    voipRateUsdPerMin: 0.03
  },
  {
    code: 'ID',
    nameEn: 'Indonesia',
    nameHa: 'Indonesiya (Indonesia)',
    flag: '🇮🇩',
    dialCode: '+62',
    region: 'Asia',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 1.60,
    virtualNumberStartingPriceUsd: 0.50,
    voipRateUsdPerMin: 0.03
  },
  {
    code: 'VN',
    nameEn: 'Vietnam',
    nameHa: 'Biyetnam (Vietnam)',
    flag: '🇻🇳',
    dialCode: '+84',
    region: 'Asia',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 1.70,
    virtualNumberStartingPriceUsd: 0.50,
    voipRateUsdPerMin: 0.035
  },
  {
    code: 'PH',
    nameEn: 'Philippines',
    nameHa: 'Filipin (Philippines)',
    flag: '🇵🇭',
    dialCode: '+63',
    region: 'Asia',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 1.75,
    virtualNumberStartingPriceUsd: 0.50,
    voipRateUsdPerMin: 0.035
  },
  {
    code: 'AU',
    nameEn: 'Australia',
    nameHa: 'Ostreliya (Australia)',
    flag: '🇦🇺',
    dialCode: '+61',
    region: 'Asia',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 2.10,
    virtualNumberStartingPriceUsd: 0.70,
    voipRateUsdPerMin: 0.025
  },
  {
    code: 'SG',
    nameEn: 'Singapore',
    nameHa: 'Singapor (Singapore)',
    flag: '🇸🇬',
    dialCode: '+65',
    region: 'Asia',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 2.00,
    virtualNumberStartingPriceUsd: 0.75,
    voipRateUsdPerMin: 0.02
  },

  // MIDDLE EAST
  {
    code: 'QA',
    nameEn: 'Qatar',
    nameHa: 'Katar (Qatar)',
    flag: '🇶🇦',
    dialCode: '+974',
    region: 'Middle East',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 2.40,
    virtualNumberStartingPriceUsd: 0.85,
    voipRateUsdPerMin: 0.045
  },
  {
    code: 'KW',
    nameEn: 'Kuwait',
    nameHa: 'Kuweit (Kuwait)',
    flag: '🇰🇼',
    dialCode: '+965',
    region: 'Middle East',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 2.50,
    virtualNumberStartingPriceUsd: 0.85,
    voipRateUsdPerMin: 0.045
  },
  {
    code: 'OM',
    nameEn: 'Oman',
    nameHa: 'Oman',
    flag: '🇴🇲',
    dialCode: '+968',
    region: 'Middle East',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 2.40,
    virtualNumberStartingPriceUsd: 0.80,
    voipRateUsdPerMin: 0.045
  },
  {
    code: 'JO',
    nameEn: 'Jordan',
    nameHa: 'Urdun (Jordan)',
    flag: '🇯🇴',
    dialCode: '+962',
    region: 'Middle East',
    esimAvailable: true,
    virtualNumberAvailable: true,
    esimStartingPriceUsd: 2.10,
    virtualNumberStartingPriceUsd: 0.70,
    voipRateUsdPerMin: 0.04
  }
];

export const APP_SERVICES: AppService[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp Business / Personal',
    iconName: 'MessageSquare',
    category: 'messaging',
    color: '#25D366',
    popularInAfrica: true
  },
  {
    id: 'telegram',
    name: 'Telegram Messenger',
    iconName: 'Send',
    category: 'messaging',
    color: '#229ED9',
    popularInAfrica: true
  },
  {
    id: 'tiktok',
    name: 'TikTok Creator & Business',
    iconName: 'Video',
    category: 'social',
    color: '#EE1D52',
    popularInAfrica: true
  },
  {
    id: 'facebook',
    name: 'Facebook & Messenger',
    iconName: 'Facebook',
    category: 'social',
    color: '#1877F2',
    popularInAfrica: true
  },
  {
    id: 'google',
    name: 'Google / Gmail / YouTube',
    iconName: 'Mail',
    category: 'other',
    color: '#EA4335',
    popularInAfrica: true
  },
  {
    id: 'instagram',
    name: 'Instagram',
    iconName: 'Camera',
    category: 'social',
    color: '#E4405F',
    popularInAfrica: true
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    iconName: 'Twitter',
    category: 'social',
    color: '#1DA1F2',
    popularInAfrica: true
  },
  {
    id: 'chatgpt',
    name: 'ChatGPT / OpenAI',
    iconName: 'Cpu',
    category: 'other',
    color: '#10A37F',
    popularInAfrica: true
  },
  {
    id: 'finance',
    name: 'Bank / Fintech OTP Verification',
    iconName: 'ShieldCheck',
    category: 'finance',
    color: '#10B981',
    popularInAfrica: true
  },
  {
    id: 'paypal',
    name: 'PayPal / Stripe Accounts',
    iconName: 'CreditCard',
    category: 'finance',
    color: '#003087',
    popularInAfrica: true
  },
  {
    id: 'binance',
    name: 'Binance / Crypto Verification',
    iconName: 'Coins',
    category: 'finance',
    color: '#F0B90B',
    popularInAfrica: true
  },
  {
    id: 'amazon',
    name: 'Amazon / AWS',
    iconName: 'ShoppingBag',
    category: 'other',
    color: '#FF9900',
    popularInAfrica: true
  },
  {
    id: 'uber',
    name: 'Uber / Bolt Driver & Passenger',
    iconName: 'Car',
    category: 'other',
    color: '#000000',
    popularInAfrica: true
  },
  {
    id: 'tinder',
    name: 'Tinder / Dating Apps',
    iconName: 'Heart',
    category: 'social',
    color: '#FD297B'
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    iconName: 'Ghost',
    category: 'social',
    color: '#FFFC00'
  },
  {
    id: 'custom',
    name: 'Universal / Any SMS Verification',
    iconName: 'Smartphone',
    category: 'other',
    color: '#6366F1',
    popularInAfrica: true
  }
];

export const SAMPLE_ESIM_PLANS: EsimPlan[] = [
  {
    id: 'ng-1gb-7d',
    countryCode: 'NG',
    countryName: 'Nigeria',
    flag: '🇳🇬',
    title: 'Nigeria Light 1GB',
    dataAmountGb: 1,
    durationDays: 7,
    priceUsd: 1.20,
    networkPartners: ['MTN 5G', 'Airtel 4G'],
    coverage: 'National 5G/4G'
  },
  {
    id: 'ng-5gb-30d',
    countryCode: 'NG',
    countryName: 'Nigeria',
    flag: '🇳🇬',
    title: 'Nigeria Pro 5GB',
    dataAmountGb: 5,
    durationDays: 30,
    priceUsd: 4.50,
    networkPartners: ['MTN 5G', 'Airtel 4G', 'Glo 4G'],
    coverage: 'National 5G/4G'
  },
  {
    id: 'us-3gb-15d',
    countryCode: 'US',
    countryName: 'United States',
    flag: '🇺🇸',
    title: 'USA Express 3GB',
    dataAmountGb: 3,
    durationDays: 15,
    priceUsd: 3.80,
    networkPartners: ['AT&T 5G', 'T-Mobile 5G'],
    coverage: 'USA Nationwide'
  },
  {
    id: 'us-unlimited-30d',
    countryCode: 'US',
    countryName: 'United States',
    flag: '🇺🇸',
    title: 'USA Ultra Unlimited',
    dataAmountGb: 999,
    durationDays: 30,
    priceUsd: 18.50,
    networkPartners: ['Verizon 5G', 'T-Mobile 5G'],
    isUnlimited: true,
    coverage: 'USA Nationwide + Hotspot'
  },
  {
    id: 'sa-3gb-15d',
    countryCode: 'SA',
    countryName: 'Saudi Arabia',
    flag: '🇸🇦',
    title: 'Saudi Pilgrimage & Work 3GB',
    dataAmountGb: 3,
    durationDays: 15,
    priceUsd: 5.20,
    networkPartners: ['STC 5G', 'Mobily 5G'],
    coverage: 'Saudi Arabia (Makkah, Madinah, Riyadh)'
  },
  {
    id: 'ae-5gb-30d',
    countryCode: 'AE',
    countryName: 'United Arab Emirates',
    flag: '🇦🇪',
    title: 'Dubai & UAE Tour 5GB',
    dataAmountGb: 5,
    durationDays: 30,
    priceUsd: 7.90,
    networkPartners: ['e& (Etisalat) 5G', 'du 5G'],
    coverage: 'UAE All Emirates'
  },
  {
    id: 'gb-10gb-30d',
    countryCode: 'GB',
    countryName: 'United Kingdom',
    flag: '🇬🇧',
    title: 'UK & Europe Roam 10GB',
    dataAmountGb: 10,
    durationDays: 30,
    priceUsd: 9.80,
    networkPartners: ['EE 5G', 'Vodafone 5G', 'O2'],
    coverage: 'UK + 35 European Countries'
  },
  {
    id: 'global-10gb-30d',
    countryCode: 'GLOBAL',
    countryName: 'Global 140+ Countries',
    flag: '🌐',
    title: 'Worldwide Explorer 10GB',
    dataAmountGb: 10,
    durationDays: 30,
    priceUsd: 22.00,
    networkPartners: ['Multi-Carrier Tier 1'],
    coverage: '140+ Countries Worldwide'
  }
];

export const VPN_SERVERS: VpnServer[] = [
  {
    id: 'us-ny',
    name: 'USA - New York (High Speed)',
    countryCode: 'US',
    flag: '🇺🇸',
    city: 'New York',
    pingMs: 24,
    loadPercent: 32,
    ipAddress: '198.51.100.45'
  },
  {
    id: 'gb-lon',
    name: 'UK - London Fast Proxy',
    countryCode: 'GB',
    flag: '🇬🇧',
    city: 'London',
    pingMs: 38,
    loadPercent: 41,
    ipAddress: '203.0.113.19'
  },
  {
    id: 'de-fra',
    name: 'Germany - Frankfurt Secure',
    countryCode: 'DE',
    flag: '🇩🇪',
    city: 'Frankfurt',
    pingMs: 45,
    loadPercent: 28,
    ipAddress: '198.51.100.88'
  },
  {
    id: 'ng-los',
    name: 'Nigeria - Lagos Hub',
    countryCode: 'NG',
    flag: '🇳🇬',
    city: 'Lagos',
    pingMs: 12,
    loadPercent: 19,
    ipAddress: '102.89.23.11'
  },
  {
    id: 'sg-sin',
    name: 'Singapore - Asia Gateway',
    countryCode: 'SG',
    flag: '🇸🇬',
    city: 'Singapore',
    pingMs: 85,
    loadPercent: 35,
    ipAddress: '128.199.201.4'
  },
  {
    id: 'sa-ruh',
    name: 'Saudi Arabia - Riyadh Node',
    countryCode: 'SA',
    flag: '🇸🇦',
    city: 'Riyadh',
    pingMs: 52,
    loadPercent: 22,
    ipAddress: '213.139.50.80'
  }
];

export const CURRENCY_RATES = {
  USD: { symbol: '$', rate: 1.0, decimals: 2 },
  NGN: { symbol: '₦', rate: 1540.0, decimals: 0 },
  EUR: { symbol: '€', rate: 0.92, decimals: 2 },
  GBP: { symbol: '£', rate: 0.78, decimals: 2 },
  CFA: { symbol: 'CFA', rate: 605.0, decimals: 0 },
  KES: { symbol: 'KSh', rate: 129.0, decimals: 0 },
  GHS: { symbol: 'GH₵', rate: 15.5, decimals: 2 }
};

export function formatPrice(amountUsd: number, currency: keyof typeof CURRENCY_RATES): string {
  const info = CURRENCY_RATES[currency] || CURRENCY_RATES.USD;
  const converted = amountUsd * info.rate;
  
  if (info.decimals === 0) {
    return `${info.symbol}${Math.round(converted).toLocaleString()}`;
  }
  return `${info.symbol}${converted.toFixed(info.decimals)}`;
}
