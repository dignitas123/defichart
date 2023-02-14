import { defineStore } from 'pinia';
import { de, enGB, fr, es, pt } from 'date-fns/locale';

function getLanguageFromCode(languageCode: string) {
  switch (languageCode) {
    case 'de':
      return de;
    case 'en':
      return enGB;
    case 'fr':
      return fr;
    case 'es':
      return es;
    case 'pt':
      return pt;
    default:
      return enGB;
  }
}

export const useLanguageStore = defineStore('language', {
  state: () => ({
    language: {},
  }),
  getters: {
    getLanguage: (state) => state.language,
  },
  actions: {
    setLanguage(languageCode: string) {
      this.language = getLanguageFromCode(languageCode);
    },
  },
});
