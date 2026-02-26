export const getDisplayText = (
  item: any,
  fieldName: string,
  currentLang: string
): string => {
  if (!item) return '';

  if (currentLang === 'vi') {
    const viField = `${fieldName}Vi`;
    return item[viField] || item[fieldName] || '';
  }

  return item[fieldName] || '';
};
