const translations = {
  home: /*i18n*/ {
    id: 'Home',
  },
  privacyPolicy: /*i18n*/ {
    id: 'Privacy Policy',
  },
} as Record<string, import('@lingui/core').MessageDescriptor>;

export const navigation = [
  {
    t: translations.home,
    url: '/',
  },
  {
    t: translations.privacyPolicy,
    url: '/privacy-policy/',
  },
];

export default navigation;
