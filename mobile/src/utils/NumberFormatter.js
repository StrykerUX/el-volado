import { GAME_CONFIG } from '../constants/GameConstants';

const NUMBER_SUFFIXES = [
  { value: 1e12, suffix: 'T' },
  { value: 1e9, suffix: 'B' },
  { value: 1e6, suffix: 'M' },
  { value: 1e3, suffix: 'K' },
];

export const formatNumber = (num) => {
  if (num < GAME_CONFIG.LARGE_NUMBER_THRESHOLD) {
    return Math.floor(num).toLocaleString();
  }
  
  for (const { value, suffix } of NUMBER_SUFFIXES) {
    if (num >= value) {
      const formatted = (num / value).toFixed(GAME_CONFIG.COIN_DISPLAY_PRECISION);
      return `${formatted}${suffix}`;
    }
  }
  
  return Math.floor(num).toLocaleString();
};

export const formatTime = (seconds) => {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  } else {
    return `${secs}s`;
  }
};

export const calculateUpgradeCost = (basePrice, level) => {
  return Math.floor(basePrice * Math.pow(GAME_CONFIG.UPGRADE_COST_MULTIPLIER, level));
};