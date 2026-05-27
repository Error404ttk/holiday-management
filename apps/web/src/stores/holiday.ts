import { defineStore } from 'pinia';
import { getHolidays } from '../services/holiday.service';
import type { Holiday, YearMode } from '../types/holiday';

interface HolidayState {
  holidays: Holiday[];
  loading: boolean;
  error: string | null;
  lastLoadedYear: number | null;
  lastLoadedMode: YearMode | null;
  requestSeq: number;
}

export const useHolidayStore = defineStore('holiday', {
  state: (): HolidayState => ({
    holidays: [],
    loading: false,
    error: null,
    lastLoadedYear: null,
    lastLoadedMode: null,
    requestSeq: 0
  }),

  getters: {
    activeHolidays: (state) => state.holidays.filter((h) => h.active !== false)
  },

  actions: {
    async fetchHolidays(year: number, mode: YearMode = 'calendar', force = false) {
      // If we already have holidays for this year and mode, skip unless forced
      if (
        !force && 
        this.lastLoadedYear === year && 
        this.lastLoadedMode === mode && 
        this.holidays.length > 0
      ) {
        console.log(`Pinia: Using cached holidays for ${year} (${mode})`);
        return;
      }

      const requestId = ++this.requestSeq;
      console.log(`Pinia: Fetching holidays for ${year} (${mode})`);
      this.loading = true;
      this.error = null;
      try {
        const data = await getHolidays({ year, mode });
        if (requestId !== this.requestSeq) return;
        this.holidays = data;
        this.lastLoadedYear = year;
        this.lastLoadedMode = mode;
      } catch (err: any) {
        if (requestId !== this.requestSeq) return;
        this.error = err.message || 'Failed to load holidays';
        throw err;
      } finally {
        if (requestId === this.requestSeq) {
          this.loading = false;
        }
      }
    },

    clearCache() {
      this.requestSeq += 1;
      this.holidays = [];
      this.loading = false;
      this.lastLoadedYear = null;
      this.lastLoadedMode = null;
    }
  }
});
