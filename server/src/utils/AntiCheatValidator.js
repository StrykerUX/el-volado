class AntiCheatValidator {
  constructor() {
    this.enabled = process.env.ANTI_CHEAT_ENABLED === 'true';
    this.obsessivePlayerProtection = process.env.OBSESSIVE_PLAYER_PROTECTION === 'true';
    
    // Basic validation limits (will be overridden by personal baselines)
    this.basicLimits = {
      maxFlipsPerMinute: 3,
      maxCoinsPerFlip: 500,
      minFlipDuration: 200, // milliseconds
      maxContinuousPlay: 8 * 60 * 60 * 1000, // 8 hours
      maxReasonableCoins: 1000000, // 1M coins
    };

    // Violation weights for scoring
    this.violationWeights = {
      impossibleProgression: 10,
      suspiciousEfficiency: 7,
      inhumanConsistency: 8,
      probabilityManipulation: 10,
      timelineInconsistency: 6,
      massiveJump: 9
    };
  }

  /**
   * Main validation method for game data
   */
  async validateGameData(gameData, gameSave, sessionData = {}) {
    if (!this.enabled) {
      return { isValid: true, score: 0, violations: [] };
    }

    const violations = [];
    let totalScore = 0;

    try {
      // Basic validation (always applied)
      const basicViolations = await this.performBasicValidation(gameData, gameSave);
      violations.push(...basicViolations);

      // Advanced heuristic validation
      const heuristicViolations = await this.performHeuristicValidation(
        gameData, 
        gameSave, 
        sessionData
      );
      violations.push(...heuristicViolations);

      // Personal baseline validation (if out of learning phase)
      if (!gameSave.personal_baselines?.learningPhase) {
        const personalViolations = await this.performPersonalBaselineValidation(
          gameData, 
          gameSave, 
          sessionData
        );
        violations.push(...personalViolations);
      }

      // Calculate total violation score
      totalScore = violations.reduce((sum, violation) => {
        return sum + (this.violationWeights[violation.type] || 1);
      }, 0);

      // Determine if player requires manual review
      const requiresManualReview = this.shouldRequireManualReview(
        violations, 
        totalScore, 
        gameSave
      );

      // Apply obsessive player protection
      const isValid = this.applyObsessivePlayerProtection(
        violations, 
        totalScore, 
        gameSave, 
        requiresManualReview
      );

      return {
        isValid,
        score: totalScore,
        violations,
        requiresManualReview,
        obsessivePlayerProtected: gameSave.isObsessivePlayerProtected(),
        learningPhase: gameSave.personal_baselines?.learningPhase || false
      };

    } catch (error) {
      console.error('Anti-cheat validation error:', error);
      return {
        isValid: false,
        score: 100,
        violations: [{ type: 'validationError', message: error.message }],
        requiresManualReview: true
      };
    }
  }

  /**
   * Basic validation that's always applied
   */
  async performBasicValidation(gameData, gameSave) {
    const violations = [];

    // Validate required fields exist
    const requiredFields = ['coins', 'totalCoinsEarned', 'totalFlips'];
    for (const field of requiredFields) {
      if (typeof gameData[field] !== 'number' || gameData[field] < 0) {
        violations.push({
          type: 'impossibleProgression',
          field,
          message: `Invalid ${field}: ${gameData[field]}`
        });
      }
    }

    // Check for impossible coin values
    const maxReasonableCoins = (gameData.totalFlips || 0) * this.basicLimits.maxCoinsPerFlip;
    if (gameData.totalCoinsEarned > maxReasonableCoins) {
      violations.push({
        type: 'impossibleProgression',
        field: 'totalCoinsEarned',
        message: `Impossible coins: ${gameData.totalCoinsEarned} vs max possible: ${maxReasonableCoins}`
      });
    }

    // Validate coin flip probability (only with sufficient data)
    if (gameData.totalFlips >= 100) {
      const headsRatio = (gameData.totalHeads || 0) / gameData.totalFlips;
      if (headsRatio < 0.35 || headsRatio > 0.65) {
        violations.push({
          type: 'probabilityManipulation',
          field: 'headsRatio',
          message: `Suspicious heads ratio: ${headsRatio.toFixed(3)} (${gameData.totalHeads}/${gameData.totalFlips})`
        });
      }
    }

    // Check for negative progression
    if (gameData.coins > gameData.totalCoinsEarned) {
      violations.push({
        type: 'impossibleProgression',
        field: 'coins',
        message: `Current coins exceed total earned: ${gameData.coins} > ${gameData.totalCoinsEarned}`
      });
    }

    return violations;
  }

  /**
   * Advanced heuristic validation
   */
  async performHeuristicValidation(gameData, gameSave, sessionData) {
    const violations = [];

    // Check for massive jumps in progression
    const previousData = gameSave.game_data || {};
    const coinJump = (gameData.totalCoinsEarned || 0) - (previousData.totalCoinsEarned || 0);
    const flipJump = (gameData.totalFlips || 0) - (previousData.totalFlips || 0);

    if (coinJump > 0 && flipJump > 0) {
      const coinsPerFlip = coinJump / flipJump;
      if (coinsPerFlip > this.basicLimits.maxCoinsPerFlip) {
        violations.push({
          type: 'massiveJump',
          field: 'coinsPerFlip',
          message: `Suspicious coins per flip: ${coinsPerFlip.toFixed(2)}`
        });
      }
    }

    // Check session data for inhuman consistency
    if (sessionData.efficiency !== undefined) {
      if (sessionData.efficiency > 0.98) {
        violations.push({
          type: 'inhumanConsistency',
          field: 'efficiency',
          message: `Perfect efficiency detected: ${sessionData.efficiency}`
        });
      }
    }

    // Timeline consistency check
    const timeDiff = Date.now() - gameSave.last_sync_time;
    if (sessionData.sessionLength && sessionData.sessionLength > timeDiff + 60000) { // 1 minute tolerance
      violations.push({
        type: 'timelineInconsistency',
        field: 'sessionLength',
        message: `Session length exceeds sync interval: ${sessionData.sessionLength} > ${timeDiff}`
      });
    }

    return violations;
  }

  /**
   * Personal baseline validation (for players out of learning phase)
   */
  async performPersonalBaselineValidation(gameData, gameSave, sessionData) {
    const violations = [];
    const baselines = gameSave.personal_baselines;

    if (!baselines || baselines.learningPhase) {
      return violations; // Skip if in learning phase
    }

    // Get personalized thresholds
    const efficiencyThreshold = gameSave.getAntiCheatThreshold('efficiency');
    const coinsPerMinuteThreshold = gameSave.getAntiCheatThreshold('coinsPerMinute');
    const sessionLengthThreshold = gameSave.getAntiCheatThreshold('sessionLength');

    // Check efficiency against personal baseline
    if (sessionData.efficiency && sessionData.efficiency > efficiencyThreshold) {
      violations.push({
        type: 'suspiciousEfficiency',
        field: 'efficiency',
        message: `Efficiency exceeds personal baseline: ${sessionData.efficiency} > ${efficiencyThreshold}`,
        personalBaseline: true
      });
    }

    // Check coins per minute against personal baseline
    if (sessionData.coinsPerMinute && sessionData.coinsPerMinute > coinsPerMinuteThreshold) {
      violations.push({
        type: 'suspiciousEfficiency',
        field: 'coinsPerMinute',
        message: `Coins per minute exceeds personal baseline: ${sessionData.coinsPerMinute} > ${coinsPerMinuteThreshold}`,
        personalBaseline: true
      });
    }

    // Check session length against personal baseline
    if (sessionData.sessionLength && sessionData.sessionLength > sessionLengthThreshold) {
      violations.push({
        type: 'suspiciousEfficiency',
        field: 'sessionLength',
        message: `Session length exceeds personal baseline: ${sessionData.sessionLength} > ${sessionLengthThreshold}`,
        personalBaseline: true
      });
    }

    return violations;
  }

  /**
   * Determine if manual review is required
   */
  shouldRequireManualReview(violations, totalScore, gameSave) {
    // High score requires review
    if (totalScore >= 20) return true;

    // Multiple violations of different types
    const violationTypes = [...new Set(violations.map(v => v.type))];
    if (violationTypes.length >= 3) return true;

    // Any impossibleProgression or probabilityManipulation
    if (violations.some(v => v.type === 'impossibleProgression' || v.type === 'probabilityManipulation')) {
      return true;
    }

    // Timeline inconsistencies require review
    if (violations.some(v => v.type === 'timelineInconsistency')) {
      return true;
    }

    return false;
  }

  /**
   * Apply obsessive player protection logic
   */
  applyObsessivePlayerProtection(violations, totalScore, gameSave, requiresManualReview) {
    if (!this.obsessivePlayerProtection) {
      // Without protection, use standard thresholds
      return totalScore < 15 && !requiresManualReview;
    }

    const isObsessive = gameSave.isObsessivePlayerProtected();
    const isLearning = gameSave.personal_baselines?.learningPhase;

    // Learning phase players get benefit of doubt
    if (isLearning) {
      return totalScore < 25; // Higher threshold during learning
    }

    // Obsessive players get special protection
    if (isObsessive) {
      // Filter out personal baseline violations for obsessive players
      const nonPersonalViolations = violations.filter(v => !v.personalBaseline);
      const adjustedScore = nonPersonalViolations.reduce((sum, violation) => {
        return sum + (this.violationWeights[violation.type] || 1);
      }, 0);

      // Much higher threshold for obsessive players
      return adjustedScore < 30;
    }

    // Standard players use normal thresholds
    return totalScore < 15 && !requiresManualReview;
  }

  /**
   * Special validation for reconnection after extended offline period
   */
  async validateReconnectionData(gameData, gameSave, offlineTime) {
    const violations = [];

    // Validate offline earnings are reasonable
    const maxOfflineHours = 24; // Maximum 24 hours of offline earnings
    const actualOfflineHours = Math.min(offlineTime / (1000 * 60 * 60), maxOfflineHours);
    
    const previousData = gameSave.game_data || {};
    const coinIncrease = (gameData.totalCoinsEarned || 0) - (previousData.totalCoinsEarned || 0);
    
    // Estimate maximum possible offline earnings
    const coinsPerSecond = previousData.coinsPerSecond || 0;
    const maxOfflineEarnings = coinsPerSecond * actualOfflineHours * 3600;
    
    if (coinIncrease > maxOfflineEarnings * 1.5) { // 50% tolerance
      violations.push({
        type: 'impossibleProgression',
        field: 'offlineEarnings',
        message: `Excessive offline earnings: ${coinIncrease} vs max possible: ${maxOfflineEarnings}`
      });
    }

    // Check for impossible flip progression during offline time
    const flipIncrease = (gameData.totalFlips || 0) - (previousData.totalFlips || 0);
    const maxOfflineFlips = actualOfflineHours * 60 * this.basicLimits.maxFlipsPerMinute;
    
    if (flipIncrease > maxOfflineFlips) {
      violations.push({
        type: 'impossibleProgression',
        field: 'offlineFlips',
        message: `Too many flips during offline period: ${flipIncrease} vs max: ${maxOfflineFlips}`
      });
    }

    const totalScore = violations.reduce((sum, violation) => {
      return sum + (this.violationWeights[violation.type] || 1);
    }, 0);

    return {
      isValid: this.applyObsessivePlayerProtection(violations, totalScore, gameSave, violations.length > 0),
      score: totalScore,
      violations,
      requiresManualReview: violations.length > 0
    };
  }

  /**
   * Generate anti-cheat report for manual review
   */
  generateAntiCheatReport(gameData, gameSave, violations, sessionData = {}) {
    const report = {
      timestamp: new Date(),
      userId: gameSave.user_id,
      gameData: {
        coins: gameData.coins,
        totalCoinsEarned: gameData.totalCoinsEarned,
        totalFlips: gameData.totalFlips,
        maxStreak: gameData.maxStreak,
        prestigeLevel: gameData.prestigeLevel
      },
      sessionData,
      violations,
      playerProfile: {
        learningPhase: gameSave.personal_baselines?.learningPhase,
        obsessivePlayerProtected: gameSave.isObsessivePlayerProtected(),
        personalBaselines: gameSave.personal_baselines,
        saveFrequency: gameSave.save_frequency,
        lastSyncTime: gameSave.last_sync_time
      },
      recommendations: this.generateRecommendations(violations, gameSave)
    };

    return report;
  }

  /**
   * Generate recommendations for manual reviewers
   */
  generateRecommendations(violations, gameSave) {
    const recommendations = [];

    const isObsessive = gameSave.isObsessivePlayerProtected();
    const isLearning = gameSave.personal_baselines?.learningPhase;

    if (isLearning) {
      recommendations.push('Player is in 30-day learning phase - give benefit of doubt');
    }

    if (isObsessive) {
      recommendations.push('Player has obsessive player protection - higher thresholds apply');
    }

    const hasPersonalViolations = violations.some(v => v.personalBaseline);
    if (hasPersonalViolations && isObsessive) {
      recommendations.push('Personal baseline violations detected, but player is obsessive - likely legitimate');
    }

    const hasImpossibleProgression = violations.some(v => v.type === 'impossibleProgression');
    if (hasImpossibleProgression) {
      recommendations.push('Impossible progression detected - requires careful investigation');
    }

    const hasProbabilityManipulation = violations.some(v => v.type === 'probabilityManipulation');
    if (hasProbabilityManipulation) {
      recommendations.push('Probability manipulation suspected - check client integrity');
    }

    if (recommendations.length === 0) {
      recommendations.push('Review case manually - unclear violation pattern');
    }

    return recommendations;
  }
}

module.exports = AntiCheatValidator;