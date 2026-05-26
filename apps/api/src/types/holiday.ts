export type YearMode = 'calendar' | 'fiscal';

export interface Holiday {
  id: number;
  holiday_date: string;
  holiday_name: string;
  holiday_type: string;
  active?: boolean;
  note?: string;
}

export interface HolidayInput {
  holiday_date: string;
  holiday_name: string;
  holiday_type: string;
  active: boolean;
  note: string;
}
