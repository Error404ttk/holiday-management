export type YearMode = 'calendar' | 'fiscal';

export function beToCe(beYear: number): number {
  return beYear - 543;
}

export function getYearRange(beYear: number, mode: YearMode): { startDate: string; endDate: string } {
  const ceYear = beToCe(beYear);

  if (mode === 'fiscal') {
    return {
      startDate: `${ceYear - 1}-10-01`,
      endDate: `${ceYear}-09-30`
    };
  }

  return {
    startDate: `${ceYear}-01-01`,
    endDate: `${ceYear}-12-31`
  };
}

