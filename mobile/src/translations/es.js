export default {
  // Authentication Screen
  auth: {
    welcome: 'Bienvenido a Volado',
    subtitle: 'El juego de lanzar monedas más emocionante',
    login: 'Iniciar Sesión',
    register: 'Registrarse',
    username: 'Nombre de usuario',
    email: 'Correo electrónico',
    password: 'Contraseña',
    confirmPassword: 'Confirmar contraseña',
    forgotPassword: '¿Olvidaste tu contraseña?',
    noAccount: '¿No tienes cuenta?',
    hasAccount: '¿Ya tienes cuenta?',
    loginButton: 'Entrar',
    registerButton: 'Crear cuenta',
    switchToLogin: 'Iniciar sesión',
    switchToRegister: 'Registrarse',
    language: 'Idioma',
    spanish: 'Español',
    english: 'English',
  },

  // Onboarding Screen
  onboarding: {
    skip: 'Omitir',
    next: 'Siguiente',
    start: 'Comenzar a jugar',
    step1: {
      title: '¡Lanza la moneda!',
      description: 'Toca la moneda para lanzarla y ganar monedas. Cada lanzamiento tiene 50% de probabilidad de caer en cara.',
    },
    step2: {
      title: 'Apuesta para ganar más',
      description: 'Selecciona cuánto apostar antes de lanzar. Si ganas, obtienes 1.8x tu apuesta.',
    },
    step3: {
      title: 'Compra mejoras',
      description: 'Usa tus monedas para comprar mejoras que te den más monedas por lanzamiento.',
    },
    step4: {
      title: 'Desbloquea logros',
      description: 'Completa desafíos para obtener multiplicadores permanentes y bonificaciones.',
    },
  },

  // Game Screen
  game: {
    coins: 'Monedas',
    coinsPerSecond: 'Monedas por segundo',
    totalFlips: 'Lanzamientos totales',
    headsStreak: 'Racha de caras',
    winStreak: 'Racha de victorias',
    heads: 'CARA',
    tails: 'CRUZ',
    win: '¡GANASTE!',
    lose: '¡PERDISTE!',
    betting: 'Apostando',
    tapToFlip: 'Toca para lanzar',
    flipAgain: 'Lanzar de nuevo',
    
    // Betting
    bet: 'Apostar',
    betAmount: 'Cantidad apostada',
    noBet: 'Sin apuesta',
    tenPercent: '10%',
    twentyFivePercent: '25%',
    fiftyPercent: '50%',
    allIn: 'TODO',
    
    // Navigation
    shop: 'Tienda',
    achievements: 'Logros',
    prestige: 'Prestigio',
    settings: 'Ajustes',
  },

  // Shop Panel
  shop: {
    upgrades: 'Mejoras',
    generators: 'Generadores',
    buy: 'Comprar',
    maxLevel: 'Nivel máximo',
    owned: 'Tienes',
    
    // Upgrades
    tapMultiplier: {
      name: 'Multiplicador de Toques',
      description: '+50% monedas por lanzamiento',
    },
    streakMultiplier: {
      name: 'Multiplicador de Racha',
      description: '+5% bonificación por racha',
    },
    flipSpeed: {
      name: 'Velocidad de Lanzamiento',
      description: '-100ms tiempo de animación',
    },
    multiBet: {
      name: 'Apuesta Múltiple',
      description: 'Permite apostar consecutivamente',
    },
    
    // Generators
    basicGenerator: {
      name: 'Generador Básico',
      description: '1 moneda cada 5 segundos',
    },
    intermediateGenerator: {
      name: 'Generador Intermedio',
      description: '3 monedas cada 3 segundos',
    },
    advancedGenerator: {
      name: 'Generador Avanzado',
      description: '10 monedas cada segundo',
    },
    autoFlipper: {
      name: 'Lanzador Automático',
      description: '2 monedas cada 8 segundos con lanzamiento automático',
    },
  },

  // Achievements Panel
  achievements: {
    title: 'Logros',
    unlocked: 'Desbloqueado',
    locked: 'Bloqueado',
    progress: 'Progreso',
    reward: 'Recompensa',
    globalMultiplier: 'Multiplicador global',
    
    // Achievement names and descriptions
    firstFlip: {
      name: 'Primer Lanzamiento',
      description: 'Lanza la moneda por primera vez',
    },
    hundredFlips: {
      name: 'Lanzador Principiante',
      description: 'Realiza 100 lanzamientos',
    },
    thousandFlips: {
      name: 'Experto en Lanzamientos',
      description: 'Realiza 1,000 lanzamientos',
    },
    firstStreak: {
      name: 'Primera Racha',
      description: 'Consigue una racha de 5 caras',
    },
    longStreak: {
      name: 'Racha Increíble',
      description: 'Consigue una racha de 10 caras',
    },
    firstThousand: {
      name: 'Primer Millar',
      description: 'Acumula 1,000 monedas',
    },
    bigEarner: {
      name: 'Gran Ganador',
      description: 'Acumula 10,000 monedas',
    },
    firstBet: {
      name: 'Primera Apuesta',
      description: 'Realiza tu primera apuesta',
    },
    highRoller: {
      name: 'Apostador de Alto Riesgo',
      description: 'Apuesta 1,000 monedas de una vez',
    },
    firstUpgrade: {
      name: 'Primera Mejora',
      description: 'Compra tu primera mejora',
    },
  },

  // Prestige Panel
  prestige: {
    title: 'Prestigio',
    overview: 'Resumen',
    upgrades: 'Mejoras de Prestigio',
    level: 'Nivel de Prestigio',
    points: 'Puntos de Prestigio',
    multiplier: 'Multiplicador de Prestigio',
    reset: 'Reiniciar Progreso',
    confirm: 'Confirmar Prestigio',
    description: 'El prestigio reinicia tu progreso pero te da puntos permanentes para comprar mejoras especiales.',
    warning: 'Esto reiniciará todas tus monedas, mejoras y generadores.',
    notReady: 'Necesitas más progreso para hacer prestigio',
    
    // Prestige upgrades
    coinMultiplier: {
      name: 'Multiplicador de Monedas',
      description: '+10% monedas de todas las fuentes',
    },
    generatorBoost: {
      name: 'Impulso de Generadores',
      description: '+25% velocidad de generadores',
    },
    streakPower: {
      name: 'Poder de Racha',
      description: '+5% bonificación de racha',
    },
    betReturns: {
      name: 'Retornos de Apuesta',
      description: '+2% retorno de apuestas',
    },
  },

  // Settings Panel
  settings: {
    title: 'Ajustes',
    language: 'Idioma',
    audio: 'Audio',
    volume: 'Volumen',
    mute: 'Silenciar',
    haptics: 'Vibración',
    accessibility: 'Accesibilidad',
    highContrast: 'Alto contraste',
    reducedMotion: 'Movimiento reducido',
    resetGame: 'Reiniciar juego',
    resetConfirm: '¿Estás seguro de que quieres reiniciar todo tu progreso?',
    about: 'Acerca de',
    version: 'Versión',
    credits: 'Créditos',
  },

  // Offline Earnings Modal
  offlineEarnings: {
    title: '¡Bienvenido de vuelta!',
    subtitle: 'Tus generadores han estado trabajando',
    timeAway: 'Tiempo ausente',
    totalEarned: 'Monedas ganadas',
    breakdown: 'Desglose',
    hours: 'horas',
    minutes: 'minutos',
    seconds: 'segundos',
    collect: 'Recoger',
  },

  // Tutorial System
  tutorial: {
    help: 'Ayuda',
    restart: 'Reiniciar tutorial',
    coinTip: 'Toca aquí para lanzar la moneda',
    betTip: 'Selecciona cuánto quieres apostar',
    shopTip: 'Compra mejoras para ganar más monedas',
    achievementsTip: 'Revisa tu progreso en los logros',
    prestigeTip: 'Reinicia tu progreso por bonificaciones permanentes',
    settingsTip: 'Cambia la configuración del juego',
    gotIt: 'Entendido',
    skip: 'Omitir',
    steps: {
      welcome: {
        title: '¡Bienvenido al juego!',
        description: 'Te enseñaré cómo jugar. ¡Este tour rápido te enseñará todo lo que necesitas saber!'
      },
      coinFlip: {
        title: 'Lanza la Moneda',
        description: '¡Toca la moneda para lanzarla! Obtienes el doble de monedas por cara y puedes construir rachas para bonos.'
      },
      statsPanel: {
        title: 'Rastrea tu Progreso',
        description: 'Aquí puedes ver tus monedas, racha y estadísticas de lanzamientos. ¡También puedes hacer apuestas para mayores recompensas!'
      },
      shopButton: {
        title: 'Mejora tu Juego',
        description: 'Visita la tienda para comprar mejoras y generadores que te harán más poderoso.'
      },
      achievementsButton: {
        title: 'Desbloquea Logros',
        description: 'Completa desafíos para obtener multiplicadores permanentes y bonificaciones.'
      }
    }
  },

  // Common UI Elements
  common: {
    ok: 'OK',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    close: 'Cerrar',
    save: 'Guardar',
    load: 'Cargar',
    delete: 'Eliminar',
    edit: 'Editar',
    back: 'Atrás',
    next: 'Siguiente',
    previous: 'Anterior',
    yes: 'Sí',
    no: 'No',
    loading: 'Cargando...',
    error: 'Error',
    success: 'Éxito',
  },

  // Number Formatting
  numbers: {
    thousand: 'mil',
    million: 'M',
    billion: 'B',
    trillion: 'T',
  },

  // Help System
  help: {
    title: 'Cómo Jugar Volado',
    sections: {
      basicGameplay: {
        title: '🪙 Jugabilidad Básica',
        content: '¡Toca la moneda para lanzarla! Obtener cara te da el doble de monedas, mientras que cruz te da la cantidad base. ¡Construye rachas de caras consecutivas para bonos masivos!'
      },
      bettingSystem: {
        title: '💰 Sistema de Apuestas',
        content: 'Usa los botones de apuesta para apostar un porcentaje de tus monedas. Las apuestas ganadoras te dan 1.8x tu apuesta de vuelta. ¡Arriesga más para ganar más!'
      },
      upgrades: {
        title: '⚡ Mejoras',
        content: 'Compra mejoras en la tienda para aumentar tus monedas por toque, bonos de racha, velocidad de lanzamiento y más. ¡Cada mejora te hace más poderoso!'
      },
      generators: {
        title: '🏭 Generadores',
        content: 'Compra generadores para ingresos pasivos. Ganan monedas automáticamente incluso cuando no estás jugando activamente.'
      },
      achievements: {
        title: '🏆 Logros',
        content: 'Completa logros para ganar multiplicadores permanentes. ¡Estos bonos se aplican a todas tus ganancias de monedas!'
      },
      prestige: {
        title: '🌟 Prestigio',
        content: 'Cuando hayas ganado suficientes monedas, puedes hacer prestigio para reiniciar tu progreso por multiplicadores permanentes masivos.'
      }
    },
    fairPlay: {
      title: '✅ Juego Justo Garantizado',
      content: 'Volado usa matemáticas reales 50/50 para cada lanzamiento. No hay trucos, no hay manipulación, solo probabilidades justas y diversión genuina.'
    },
    tips: {
      title: '💡 Consejos y Estrategias',
      items: [
        'Construye rachas largas para bonos masivos',
        'Apuesta estratégicamente - no siempre vayas ALL IN',
        'Prioriza las mejoras de multiplicador de toque primero',
        'Los generadores dan ingresos constantes mientras estás ausente',
        'Los logros dan multiplicadores permanentes - ¡vale la pena perseguirlos!',
        'El prestigio reinicia tu progreso pero te da bonos enormes'
      ]
    }
  },

  // Tooltips
  tooltips: {
    coinFlip: {
      title: 'Lanzar Moneda',
      description: '¡Toca para lanzar la moneda! Obtén cara para doble monedas y construye rachas para bonos masivos.',
      tips: ['Toca rápidamente para más lanzamientos', 'Cara da 2x monedas', 'Construye rachas para bonos']
    },
    statsPanel: {
      title: 'Estadísticas del Juego',
      description: 'Rastrea tu progreso aquí. Tu balance de monedas, contador de racha y opciones de apuesta se muestran aquí.',
      tips: ['Balance actual de monedas', 'Racha activa de caras', 'Controles de apuesta']
    },
    shopButton: {
      title: 'Tienda y Mejoras',
      description: 'Compra mejoras para mejorar tu generación de monedas y desbloquear generadores poderosos.',
      tips: ['Mejoras de multiplicador de toque', 'Generadores pasivos', 'Mejoras de prestigio']
    },
    achievementsButton: {
      title: 'Logros',
      description: 'Completa logros para ganar multiplicadores permanentes y monedas de bonificación.',
      tips: ['Rastrea tu progreso', 'Gana multiplicadores', 'Obtén recompensas de bono']
    },
    prestigeButton: {
      title: 'Sistema de Prestigio',
      description: 'Reinicia tu progreso por puntos de prestigio y multiplicadores permanentes masivos.',
      tips: ['Reinicia por puntos', 'Multiplicadores enormes', 'Progresión a largo plazo']
    },
    settingsButton: {
      title: 'Configuración del Juego',
      description: 'Ajusta la configuración del juego, audio, accesibilidad y más.',
      tips: ['Controles de audio', 'Opciones de accesibilidad', 'Configuración del juego']
    }
  },
};