export default {
  // Authentication Screen
  auth: {
    welcome: 'Welcome to Volado',
    subtitle: 'The most exciting coin flip game',
    login: 'Login',
    register: 'Register',
    username: 'Username',
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm password',
    forgotPassword: 'Forgot password?',
    noAccount: "Don't have an account?",
    hasAccount: 'Already have an account?',
    loginButton: 'Sign in',
    registerButton: 'Create account',
    switchToLogin: 'Sign in',
    switchToRegister: 'Register',
    language: 'Language',
    spanish: 'Español',
    english: 'English',
  },

  // Onboarding Screen
  onboarding: {
    skip: 'Skip',
    next: 'Next',
    start: 'Start playing',
    step1: {
      title: 'Flip the coin!',
      description: 'Tap the coin to flip it and earn coins. Each flip has a 50% chance of landing heads.',
    },
    step2: {
      title: 'Bet to win more',
      description: 'Select how much to bet before flipping. If you win, you get 1.8x your bet.',
    },
    step3: {
      title: 'Buy upgrades',
      description: 'Use your coins to buy upgrades that give you more coins per flip.',
    },
    step4: {
      title: 'Unlock achievements',
      description: 'Complete challenges to get permanent multipliers and bonuses.',
    },
  },

  // Game Screen
  game: {
    coins: 'Coins',
    coinsPerSecond: 'Coins per second',
    totalFlips: 'Total flips',
    headsStreak: 'Heads streak',
    winStreak: 'Win streak',
    heads: 'HEADS',
    tails: 'TAILS',
    win: 'YOU WIN!',
    lose: 'YOU LOSE!',
    betting: 'Betting',
    tapToFlip: 'Tap to flip',
    flipAgain: 'Flip again',
    
    // Betting
    bet: 'Bet',
    betAmount: 'Bet amount',
    noBet: 'No bet',
    tenPercent: '10%',
    twentyFivePercent: '25%',
    fiftyPercent: '50%',
    allIn: 'ALL IN',
    
    // Navigation
    shop: 'Shop',
    achievements: 'Achievements',
    prestige: 'Prestige',
    settings: 'Settings',
  },

  // Shop Panel
  shop: {
    upgrades: 'Upgrades',
    generators: 'Generators',
    buy: 'Buy',
    maxLevel: 'Max level',
    owned: 'Owned',
    
    // Upgrades
    tapMultiplier: {
      name: 'Tap Multiplier',
      description: '+50% coins per flip',
    },
    streakMultiplier: {
      name: 'Streak Multiplier',
      description: '+5% streak bonus',
    },
    flipSpeed: {
      name: 'Flip Speed',
      description: '-100ms animation time',
    },
    multiBet: {
      name: 'Multi Bet',
      description: 'Allows consecutive betting',
    },
    
    // Generators
    basicGenerator: {
      name: 'Basic Generator',
      description: '1 coin every 5 seconds',
    },
    intermediateGenerator: {
      name: 'Intermediate Generator',
      description: '3 coins every 3 seconds',
    },
    advancedGenerator: {
      name: 'Advanced Generator',
      description: '10 coins every second',
    },
    autoFlipper: {
      name: 'Auto Flipper',
      description: '2 coins every 8 seconds with auto flip',
    },
  },

  // Achievements Panel
  achievements: {
    title: 'Achievements',
    unlocked: 'Unlocked',
    locked: 'Locked',
    progress: 'Progress',
    reward: 'Reward',
    globalMultiplier: 'Global multiplier',
    
    // Achievement names and descriptions
    firstFlip: {
      name: 'First Flip',
      description: 'Flip the coin for the first time',
    },
    hundredFlips: {
      name: 'Beginner Flipper',
      description: 'Make 100 flips',
    },
    thousandFlips: {
      name: 'Flip Expert',
      description: 'Make 1,000 flips',
    },
    firstStreak: {
      name: 'First Streak',
      description: 'Get a 5 heads streak',
    },
    longStreak: {
      name: 'Amazing Streak',
      description: 'Get a 10 heads streak',
    },
    firstThousand: {
      name: 'First Thousand',
      description: 'Accumulate 1,000 coins',
    },
    bigEarner: {
      name: 'Big Earner',
      description: 'Accumulate 10,000 coins',
    },
    firstBet: {
      name: 'First Bet',
      description: 'Make your first bet',
    },
    highRoller: {
      name: 'High Roller',
      description: 'Bet 1,000 coins at once',
    },
    firstUpgrade: {
      name: 'First Upgrade',
      description: 'Buy your first upgrade',
    },
  },

  // Prestige Panel
  prestige: {
    title: 'Prestige',
    overview: 'Overview',
    upgrades: 'Prestige Upgrades',
    level: 'Prestige Level',
    points: 'Prestige Points',
    multiplier: 'Prestige Multiplier',
    reset: 'Reset Progress',
    confirm: 'Confirm Prestige',
    description: 'Prestige resets your progress but gives you permanent points to buy special upgrades.',
    warning: 'This will reset all your coins, upgrades, and generators.',
    notReady: 'You need more progress to prestige',
    
    // Prestige upgrades
    coinMultiplier: {
      name: 'Coin Multiplier',
      description: '+10% coins from all sources',
    },
    generatorBoost: {
      name: 'Generator Boost',
      description: '+25% generator speed',
    },
    streakPower: {
      name: 'Streak Power',
      description: '+5% streak bonus',
    },
    betReturns: {
      name: 'Bet Returns',
      description: '+2% bet returns',
    },
  },

  // Settings Panel
  settings: {
    title: 'Settings',
    language: 'Language',
    audio: 'Audio',
    volume: 'Volume',
    mute: 'Mute',
    haptics: 'Haptics',
    accessibility: 'Accessibility',
    highContrast: 'High contrast',
    reducedMotion: 'Reduced motion',
    resetGame: 'Reset game',
    resetConfirm: 'Are you sure you want to reset all your progress?',
    about: 'About',
    version: 'Version',
    credits: 'Credits',
  },

  // Offline Earnings Modal
  offlineEarnings: {
    title: 'Welcome back!',
    subtitle: 'Your generators have been working',
    timeAway: 'Time away',
    totalEarned: 'Coins earned',
    breakdown: 'Breakdown',
    hours: 'hours',
    minutes: 'minutes',
    seconds: 'seconds',
    collect: 'Collect',
  },

  // Tutorial System
  tutorial: {
    help: 'Help',
    restart: 'Restart tutorial',
    coinTip: 'Tap here to flip the coin',
    betTip: 'Select how much you want to bet',
    shopTip: 'Buy upgrades to earn more coins',
    achievementsTip: 'Check your progress in achievements',
    prestigeTip: 'Reset your progress for permanent bonuses',
    settingsTip: 'Change game settings',
    gotIt: 'Got it',
    skip: 'Skip',
  },

  // Common UI Elements
  common: {
    ok: 'OK',
    cancel: 'Cancel',
    confirm: 'Confirm',
    close: 'Close',
    save: 'Save',
    load: 'Load',
    delete: 'Delete',
    edit: 'Edit',
    back: 'Back',
    next: 'Next',
    previous: 'Previous',
    yes: 'Yes',
    no: 'No',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
  },

  // Number Formatting
  numbers: {
    thousand: 'K',
    million: 'M',
    billion: 'B',
    trillion: 'T',
  },

  // Help System
  help: {
    title: 'How to Play Volado',
    sections: {
      basicGameplay: {
        title: '🪙 Basic Gameplay',
        content: 'Tap the coin to flip it! Getting heads gives you double coins, while tails gives you the base amount. Build streaks of consecutive heads for massive bonuses!'
      },
      bettingSystem: {
        title: '💰 Betting System',
        content: 'Use the betting buttons to wager a percentage of your coins. Winning bets give you 1.8x your wager back. Risk more to earn more!'
      },
      upgrades: {
        title: '⚡ Upgrades',
        content: 'Buy upgrades in the shop to increase your coins per tap, streak bonuses, flip speed, and more. Each upgrade makes you more powerful!'
      },
      generators: {
        title: '🏭 Generators',
        content: 'Purchase generators for passive income. They earn coins automatically even when you\'re not actively playing.'
      },
      achievements: {
        title: '🏆 Achievements',
        content: 'Complete achievements to earn permanent multipliers. These bonuses apply to all your coin earnings!'
      },
      prestige: {
        title: '🌟 Prestige',
        content: 'When you\'ve earned enough coins, you can prestige to reset your progress for massive permanent multipliers.'
      }
    },
    fairPlay: {
      title: '✅ Fair Play Guaranteed',
      content: 'Volado uses real 50/50 mathematics for each flip. No tricks, no manipulation, just fair odds and genuine fun.'
    },
    tips: {
      title: '💡 Tips & Strategies',
      items: [
        'Build long streaks for massive bonuses',
        'Bet strategically - don\'t always go ALL IN',
        'Prioritize tap multiplier upgrades first',
        'Generators provide steady income while away',
        'Achievements give permanent multipliers - worth pursuing!',
        'Prestige resets progress but gives huge bonuses'
      ]
    }
  },

  // Tooltips
  tooltips: {
    coinFlip: {
      title: 'Coin Flip',
      description: 'Tap to flip the coin! Get heads for double coins and build streaks for massive bonuses.',
      tips: ['Tap rapidly for more flips', 'Heads give 2x coins', 'Build streaks for bonuses']
    },
    statsPanel: {
      title: 'Game Stats',
      description: 'Track your progress here. Your coins, streak count, and betting options are all displayed.',
      tips: ['Current coin balance', 'Active heads streak', 'Betting controls']
    },
    shopButton: {
      title: 'Shop & Upgrades',
      description: 'Buy upgrades to improve your coin generation and unlock powerful generators.',
      tips: ['Tap multiplier upgrades', 'Passive generators', 'Prestige upgrades']
    },
    achievementsButton: {
      title: 'Achievements',
      description: 'Complete achievements to earn permanent multipliers and bonus coins.',
      tips: ['Track your progress', 'Earn multipliers', 'Get bonus rewards']
    },
    prestigeButton: {
      title: 'Prestige System',
      description: 'Reset your progress for prestige points and massive permanent multipliers.',
      tips: ['Reset for points', 'Huge multipliers', 'Long-term progression']
    },
    settingsButton: {
      title: 'Game Settings',
      description: 'Customize your game experience with sound, accessibility, and account options.',
      tips: ['Sound controls', 'Accessibility options', 'Account management']
    }
  },
};