import 'vuetify/styles';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { th } from 'vuetify/locale';

export const vuetify = createVuetify({
  components,
  directives,
  locale: {
    locale: 'th',
    fallback: 'en',
    messages: { th }
  },
  theme: {
    defaultTheme: 'hospital',
    themes: {
      hospital: {
        dark: false,
        colors: {
          primary: '#0F766E',
          secondary: '#2563EB',
          background: '#F8FAFC',
          surface: '#FFFFFF',
          success: '#16A34A',
          warning: '#F59E0B',
          error: '#DC2626',
          'on-surface': '#0F172A'
        }
      }
    }
  },
  defaults: {
    VBtn: {
      rounded: 'lg'
    },
    VCard: {
      rounded: 'lg',
      elevation: 1
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable'
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable'
    }
  }
});
