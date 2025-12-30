export function getAcademicYear(date = new Date()) {
  const year = date.getFullYear();
  const isAfterSummer = date.getMonth() >= 7; // August = 7

  const startYear = isAfterSummer ? year : year - 1;

  return {
    year: startYear,
    label: `${startYear}/${startYear + 1}`,
  };
}
