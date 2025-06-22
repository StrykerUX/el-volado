export const GAME_CONFIG = {
  // Economy
  BASE_COINS_PER_TAP: 1,
  UPGRADE_COST_MULTIPLIER: 1.15,
  PRESTIGE_THRESHOLD: 1000000,
  
  // Prestige System
  PRESTIGE_COST_BASE: 1000000, // 1M coins minimum for first prestige
  PRESTIGE_COST_MULTIPLIER: 2.5, // Each prestige costs 2.5x more
  PRESTIGE_POINTS_BASE: 1, // Base prestige points per reset
  PRESTIGE_MULTIPLIER_BASE: 0.01, // +1% per prestige point
  MAX_PRESTIGE_LEVEL: 100, // Maximum prestige level
  
  // Performance
  MAX_OFFLINE_HOURS: 24,
  TAP_ANIMATION_DURATION: 150,
  SAVE_INTERVAL: 5000, // Save every 5 seconds
  
  // UI
  COIN_DISPLAY_PRECISION: 2,
  LARGE_NUMBER_THRESHOLD: 1000000,
};

export const UPGRADE_TYPES = {
  TAP_MULTIPLIER: 'tapMultiplier',
  AUTO_CLICKER: 'autoClicker',
  COIN_MAGNET: 'coinMagnet',
  STREAK_MULTIPLIER: 'streakMultiplier',
  FLIP_SPEED: 'flipSpeed',
  MULTI_BET: 'multiBet',
};

export const GENERATOR_TYPES = {
  BASIC: 'basic',
  INTERMEDIATE: 'intermediate',
  ADVANCED: 'advanced',
  AUTO_FLIPPER: 'autoFlipper',
};

// Upgrade definitions with costs and effects
export const UPGRADES = {
  tapMultiplier: {
    name: 'Multiplicador de Tap',
    description: 'Aumenta las monedas base por tap',
    baseCost: 10,
    effect: 0.5, // +50% per level
    maxLevel: 50,
  },
  streakMultiplier: {
    name: 'Bonus de Streak',
    description: 'Aumenta el bonus por streaks consecutivos',
    baseCost: 25,
    effect: 0.05, // +5% bonus per level
    maxLevel: 20,
  },
  flipSpeed: {
    name: 'Velocidad de Flip',
    description: 'Reduce el tiempo de animación',
    baseCost: 50,
    effect: 100, // -100ms per level (min 400ms)
    maxLevel: 8,
  },
  multiBet: {
    name: 'Apuesta Múltiple',
    description: 'Permite apostar en varios flips consecutivos',
    baseCost: 100,
    effect: 1, // +1 flip per level
    maxLevel: 5,
  },
};

// Generator definitions
export const GENERATORS = {
  basic: {
    name: 'Generador Básico',
    description: 'Genera monedas cada 5 segundos',
    baseCost: 15,
    baseProduction: 1,
    interval: 5000, // 5 seconds
  },
  intermediate: {
    name: 'Generador Intermedio',
    description: 'Genera monedas cada 3 segundos',
    baseCost: 100,
    baseProduction: 3,
    interval: 3000, // 3 seconds
  },
  advanced: {
    name: 'Generador Avanzado',
    description: 'Genera monedas cada segundo',
    baseCost: 1000,
    baseProduction: 10,
    interval: 1000, // 1 second
  },
  autoFlipper: {
    name: 'Auto-Flipper',
    description: 'Realiza flips automáticos (sin apuestas)',
    baseCost: 5000,
    baseProduction: 2, // coins per flip
    interval: 8000, // 8 seconds per flip
  },
};

// Achievements definitions
export const ACHIEVEMENTS = {
  firstFlip: {
    id: 'firstFlip',
    name: 'Primer Lanzamiento',
    description: 'Realiza tu primer flip',
    requirement: 1,
    type: 'totalFlips',
    reward: { type: 'coins', amount: 10 },
    unlocked: false,
  },
  flipMaster: {
    id: 'flipMaster',
    name: 'Maestro del Flip',
    description: 'Realiza 100 flips',
    requirement: 100,
    type: 'totalFlips',
    reward: { type: 'multiplier', amount: 1.1 },
    unlocked: false,
  },
  streakBeginner: {
    id: 'streakBeginner',
    name: 'Inicio de Racha',
    description: 'Consigue una racha de 5 heads',
    requirement: 5,
    type: 'maxStreak',
    reward: { type: 'coins', amount: 50 },
    unlocked: false,
  },
  streakMaster: {
    id: 'streakMaster',
    name: 'Maestro de Rachas',
    description: 'Consigue una racha de 10 heads',
    requirement: 10,
    type: 'maxStreak',
    reward: { type: 'multiplier', amount: 1.2 },
    unlocked: false,
  },
  coinCollector: {
    id: 'coinCollector',
    name: 'Coleccionista',
    description: 'Acumula 1,000 coins',
    requirement: 1000,
    type: 'totalCoinsEarned',
    reward: { type: 'coins', amount: 100 },
    unlocked: false,
  },
  richPlayer: {
    id: 'richPlayer',
    name: 'Jugador Rico',
    description: 'Acumula 50,000 coins',
    requirement: 50000,
    type: 'totalCoinsEarned',
    reward: { type: 'multiplier', amount: 1.5 },
    unlocked: false,
  },
  bettingNovice: {
    id: 'bettingNovice',
    name: 'Apostador Novato',
    description: 'Gana 10 apuestas',
    requirement: 10,
    type: 'totalBetsWon',
    reward: { type: 'coins', amount: 200 },
    unlocked: false,
  },
  bettingPro: {
    id: 'bettingPro',
    name: 'Apostador Pro',
    description: 'Gana 100 apuestas',
    requirement: 100,
    type: 'totalBetsWon',
    reward: { type: 'multiplier', amount: 1.3 },
    unlocked: false,
  },
  bigWin: {
    id: 'bigWin',
    name: 'Gran Ganancia',
    description: 'Gana 1,000 coins en una sola apuesta',
    requirement: 1000,
    type: 'biggestWin',
    reward: { type: 'coins', amount: 500 },
    unlocked: false,
  },
  marathonPlayer: {
    id: 'marathonPlayer',
    name: 'Jugador Maratón',
    description: 'Realiza 1,000 flips',
    requirement: 1000,
    type: 'totalFlips',
    reward: { type: 'multiplier', amount: 2.0 },
    unlocked: false,
  },
  firstPrestige: {
    id: 'firstPrestige',
    name: 'Ascensión',
    description: 'Realiza tu primer Prestige',
    requirement: 1,
    type: 'totalPrestiges',
    reward: { type: 'coins', amount: 10000 },
    unlocked: false,
  },
  prestigeMaster: {
    id: 'prestigeMaster',
    name: 'Maestro del Prestige',
    description: 'Alcanza Prestige nivel 10',
    requirement: 10,
    type: 'totalPrestiges',
    reward: { type: 'multiplier', amount: 3.0 },
    unlocked: false,
  },
};

// Prestige upgrades (unlocked with prestige points)
export const PRESTIGE_UPGRADES = {
  coinMultiplier: {
    name: 'Multiplicador de Monedas',
    description: 'Aumenta todas las ganancias de monedas',
    baseCost: 1,
    effect: 0.2, // +20% per level
    maxLevel: 50,
  },
  generatorBoost: {
    name: 'Potenciador de Generadores',
    description: 'Aumenta la velocidad de todos los generadores',
    baseCost: 2,
    effect: 0.15, // +15% per level
    maxLevel: 25,
  },
  streakPower: {
    name: 'Poder de Rachas',
    description: 'Las rachas otorgan más bonus',
    baseCost: 3,
    effect: 0.1, // +10% streak bonus per level
    maxLevel: 20,
  },
  betReturns: {
    name: 'Retornos de Apuesta',
    description: 'Aumenta las ganancias de las apuestas',
    baseCost: 5,
    effect: 0.05, // +5% bet multiplier per level
    maxLevel: 10,
  },
};