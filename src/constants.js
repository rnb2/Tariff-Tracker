export const UTILITY_TYPES = {
  HEATING: 'heating',
  ELECTRICITY_DAY: 'electricityDay',
  ELECTRICITY_NIGHT: 'electricityNight',
  WATER_KITCHEN: 'waterKitchen',
  WATER_BATHROOM: 'waterBathroom',
  GAS: 'gas',
  RENT: 'rent',
};

export const INITIAL_RATES = {
  [UTILITY_TYPES.HEATING]: 0,
  [UTILITY_TYPES.ELECTRICITY_DAY]: 4.32,
  [UTILITY_TYPES.ELECTRICITY_NIGHT]: 2.16,
  [UTILITY_TYPES.WATER_KITCHEN]: 0,
  [UTILITY_TYPES.WATER_BATHROOM]: 0,
  [UTILITY_TYPES.GAS]: 0,
  [UTILITY_TYPES.RENT]: 0,
};

export const LABELS = {
  [UTILITY_TYPES.HEATING]: 'Отопление',
  [UTILITY_TYPES.ELECTRICITY_DAY]: 'Электричество (День)',
  [UTILITY_TYPES.ELECTRICITY_NIGHT]: 'Электричество (Ночь)',
  [UTILITY_TYPES.WATER_KITCHEN]: 'Вода кухня',
  [UTILITY_TYPES.WATER_BATHROOM]: 'Вода санузел',
  [UTILITY_TYPES.GAS]: 'Газ',
  [UTILITY_TYPES.RENT]: 'Квартплата',
  PARKING: 'Паркоместо',
  MORTGAGE: 'Ипотека',
  CREDIT_CARDS: 'Кредитные карты',
};

export const UNITS = {
  [UTILITY_TYPES.HEATING]: 'Гкал',
  [UTILITY_TYPES.ELECTRICITY_DAY]: 'кВт*ч',
  [UTILITY_TYPES.ELECTRICITY_NIGHT]: 'кВт*ч',
  [UTILITY_TYPES.WATER_KITCHEN]: 'куб. м',
  [UTILITY_TYPES.WATER_BATHROOM]: 'куб. м',
  [UTILITY_TYPES.GAS]: 'куб. м',
  [UTILITY_TYPES.RENT]: 'ед.',
};
