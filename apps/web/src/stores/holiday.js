import { defineStore } from 'pinia';
import { getHolidays } from '../services/holiday.service';
export const useHolidayStore = defineStore('holiday', {
    state: () => ({
        holidays: [],
        loading: false,
        error: null,
        lastLoadedYear: null,
        lastLoadedMode: null
    }),
    getters: {
        activeHolidays: (state) => state.holidays.filter((h) => h.active !== false)
    },
    actions: {
        async fetchHolidays(year, mode = 'calendar', force = false) {
            // If we already have holidays for this year and mode, skip unless forced
            if (!force &&
                this.lastLoadedYear === year &&
                this.lastLoadedMode === mode &&
                this.holidays.length > 0) {
                console.log(`Pinia: Using cached holidays for ${year} (${mode})`);
                return;
            }
            console.log(`Pinia: Fetching holidays for ${year} (${mode})`);
            this.loading = true;
            this.error = null;
            try {
                const data = await getHolidays({ year, mode });
                this.holidays = data;
                this.lastLoadedYear = year;
                this.lastLoadedMode = mode;
            }
            catch (err) {
                this.error = err.message || 'Failed to load holidays';
                throw err;
            }
            finally {
                this.loading = false;
            }
        },
        clearCache() {
            this.holidays = [];
            this.lastLoadedYear = null;
            this.lastLoadedMode = null;
        }
    }
});
