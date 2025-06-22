# VOLADO - Sync Strategy & Anti-Cheat Documentation

## 📋 Overview

This document outlines the optimized synchronization strategy for Volado, designed for resource-limited servers while maintaining excellent user experience and robust anti-cheat protection.

## 🎯 Core Strategy: 30-Minute Sync Intervals

### Philosophy
- **Local-First Gameplay**: 100% responsive experience with local state
- **Intelligent Sync**: Only sync when necessary to reduce server load
- **Resource Optimization**: Designed for servers with limited CPU/RAM/bandwidth
- **Fair Play Protection**: Robust anti-cheat without penalizing dedicated players

## 🔄 Sync Trigger System

### 1. Time-Based Sync (Low Priority)
```javascript
SCHEDULED_SYNC: {
  interval: 30 * 60 * 1000,        // 30 minutes
  condition: "only_if_has_changes",
  max_queue_size: 500,             // Force sync if queue gets large
  compress_data: true              // Compress before sending
}
```

### 2. Critical Events (Immediate Priority)
```javascript
CRITICAL_EVENTS: [
  "real_money_purchase",           // IAP transactions
  "prestige_activation",           // Major progression events
  "major_achievement_unlock",      // Significant milestones
  "user_logout",                   // App backgrounded/closed
  "account_security_change"        // Password/email changes
]
```

### 3. Reconnection Sync (Medium Priority)
```javascript
RECONNECTION_SYNC: {
  trigger_threshold: 30 * 60 * 1000,  // 30+ minutes offline
  sync_type: "full_validation",        // Complete state validation
  conflict_resolution: "server_wins", // Server authority on conflicts
  backup_local: true                   // Keep local backup for review
}
```

### 4. Threshold-Based Sync (Medium Priority)
```javascript
THRESHOLD_TRIGGERS: {
  coins_gained: 50000,             // Significant progress
  actions_queued: 1000,            // Large action queue
  storage_usage: 0.9,              // AsyncStorage 90% full
  time_played: 2 * 60 * 60 * 1000  // 2+ hours continuous play
}
```

## 📊 Data Flow Architecture

```
┌─────────────────────┐
│   Game Client       │
│  (React Native)     │
│                     │
│ ┌─────────────────┐ │
│ │ Local State     │ │
│ │ (Zustand +      │ │
│ │  AsyncStorage)  │ │
│ └─────────────────┘ │
│          │          │
│          ▼          │
│ ┌─────────────────┐ │
│ │ Sync Manager    │ │
│ │ (Queue Actions) │ │
│ └─────────────────┘ │
└─────────────────────┘
          │
          ▼ (30min intervals / critical events)
┌─────────────────────┐
│   Load Balancer     │
│  (Rate Limiting)    │
└─────────────────────┘
          │
          ▼
┌─────────────────────┐
│  Sync API Server    │
│   (Node.js +        │
│    Express)         │
│                     │
│ ┌─────────────────┐ │
│ │ Anti-Cheat      │ │
│ │ Validation      │ │
│ └─────────────────┘ │
│ ┌─────────────────┐ │
│ │ Batch Processor │ │
│ └─────────────────┘ │
└─────────────────────┘
          │
          ▼ (Optimized writes)
┌─────────────────────┐
│   PostgreSQL DB     │
│  (User states +     │
│   Game saves)       │
└─────────────────────┘
```

## 🛡️ Anti-Cheat System

### Core Principles
1. **Statistical Analysis**: Detect impossible patterns, not individual actions
2. **Tolerance for Dedication**: Account for players who play extensively
3. **Progressive Flagging**: Warning → Monitoring → Action
4. **Human Review**: Manual review for complex cases

### Validation Metrics

#### Basic Validation (Always Applied)
```javascript
BASIC_LIMITS: {
  max_flips_per_minute: 3,         // Reasonable for idle clicker
  max_coins_per_flip: 500,         // With max upgrades + streak
  min_flip_duration: 200,          // Minimum animation time
  max_continuous_play: 8 * 60 * 60 // 8 hours (flag for review)
}
```

#### Advanced Heuristics
```javascript
STATISTICAL_ANALYSIS: {
  // Probability validation (50/50 coin flip)
  heads_ratio: {
    min: 0.35,                     // Allow variance for small samples
    max: 0.65,                     // Account for luck streaks
    sample_size_threshold: 100     // Only validate with 100+ flips
  },
  
  // Progression validation
  progression_rate: {
    max_coins_per_hour: 100000,    // With optimal play + upgrades
    max_upgrades_per_hour: 20,     // Reasonable upgrade rate
    impossible_jumps: true         // Flag sudden massive increases
  },
  
  // Behavioral patterns
  behavior_flags: {
    perfect_timing: 0.95,          // Flag if >95% optimal timing
    no_mistakes: 1000,             // Flag if 1000+ actions without suboptimal play
    inhuman_consistency: true      // Detect bot-like patterns
  }
}
```

### Obsessive Player Protection System

#### Core Philosophy: "Innocent Until Proven Guilty"
- **Never Auto-Ban**: All flagging requires human review
- **Personal Baselines**: Compare against individual history, not global averages  
- **Context Awareness**: Consider time, events, game updates
- **False Positive Penalty**: Internal penalties for incorrect flagging

#### Adaptive Player Learning System
```javascript
OBSESSIVE_PLAYER_FRIENDLY_SYSTEM: {
  
  // Phase 1: Learning Period (No Judgments)
  learning_phase: {
    duration: 30 * 24 * 60 * 60 * 1000,  // 30 days
    action: "collect_data_only",
    no_flags: true,
    purpose: "establish_personal_baseline"
  },
  
  // Phase 2: Personal Baseline Establishment
  baseline_establishment: {
    personal_max_efficiency: "top_10_percent_of_personal_sessions",
    personal_play_patterns: "individual_circadian_rhythm", 
    personal_skill_ceiling: "best_legitimate_performance",
    adaptive_learning: "continuous_baseline_updates"
  },
  
  // Phase 3: Intelligent Validation
  intelligent_validation: {
    // Only flag if MASSIVELY exceeds personal best
    flag_threshold: "500_percent_above_personal_best",
    
    // Context modifiers increase thresholds
    context_modifiers: {
      new_game_content: 1.5,        // +50% threshold during updates
      player_vacation_detected: 2.0, // +100% during detected time off
      competitive_event: 1.75,       // +75% during tournaments
      weekend_detected: 1.25,        // +25% on weekends
      holiday_period: 2.0            // +100% during holidays
    },
    
    // Multi-factor flagging required
    multi_factor_requirements: {
      required_violations: 3,         // Need 3 different red flags
      violation_types: [
        "efficiency_impossible",
        "consistency_inhuman", 
        "timing_superhuman"
      ],
      violation_window: 24 * 60 * 60 * 1000, // Within 24 hours
      human_review_mandatory: true
    }
  }
}
```

#### Machine Learning Approach
```javascript
PERSONAL_BASELINE_LEARNING: {
  
  // Individual player profiling
  player_profile_development: {
    skill_progression_curve: "track_individual_improvement",
    play_pattern_analysis: "identify_personal_rhythms",
    efficiency_growth: "natural_skill_development_rate",
    dedication_level: "classify_casual_to_obsessive"
  },
  
  // Adaptive thresholds per player
  personalized_validation: {
    efficiency_threshold: "personal_best * 2.5",
    consistency_threshold: "personal_variance * 3.0", 
    timing_threshold: "personal_optimal * 1.8",
    session_length_threshold: "personal_max * 1.5"
  },
  
  // Contextual pattern recognition
  context_awareness: {
    time_of_day_patterns: "learn_individual_peak_hours",
    day_of_week_patterns: "weekend_vs_weekday_behavior",
    seasonal_patterns: "holiday_gaming_behavior",
    life_event_detection: "vacation_illness_schedule_changes"
  }
}
```

#### Obsessive Player Scenarios Protection
```javascript
OBSESSIVE_PLAYER_SCENARIOS: {
  
  // Extreme dedication cases
  extreme_players: {
    daily_playtime: "> 12 hours",
    session_length: "> 8 hours_continuous",
    efficiency_rating: "> 95_percent_optimal",
    
    protection_measures: {
      validation_strictness: "minimal",
      flag_threshold: "1000_percent_above_average_player",
      auto_exemption: "after_30_days_clean_record",
      community_vouching: "accept_peer_verification"
    }
  },
  
  // Speed-run and optimization players  
  optimization_players: {
    behavior_patterns: [
      "frame_perfect_timing",
      "mathematical_optimization",
      "exploit_legal_mechanics", 
      "min_max_strategies"
    ],
    
    protection_measures: {
      skill_recognition: "flag_as_expert_player",
      threshold_adjustment: "based_on_skill_level",
      community_status: "recognize_as_beta_tester"
    }
  },
  
  // Binge gaming sessions
  binge_sessions: {
    triggers: ["new_content", "personal_goals", "competition"],
    duration: "> 16_hours_continuous",
    
    protection_measures: {
      temporary_threshold_boost: "500_percent_during_binge",
      fatigue_detection: "suggest_breaks_gently",
      post_binge_monitoring: "expect_lower_activity_after"
    }
  }
}
```

#### Appeals and Review Process
```javascript
APPEALS_PROCESS: {
  
  // Player rights
  player_rights: {
    explanation_opportunity: "always_provided",
    evidence_submission: "videos_screenshots_accepted",
    community_vouching: "peer_verification_considered",
    benefit_of_doubt: "default_stance_pro_player"
  },
  
  // Review team guidelines
  reviewer_guidelines: {
    bias_direction: "toward_player_innocence",
    evidence_requirement: "overwhelming_proof_needed",
    false_positive_penalty: "reviewer_performance_impact",
    obsessive_player_education: "training_on_dedication_vs_cheating"
  },
  
  // Appeal outcomes
  appeal_outcomes: {
    false_positive_compensation: "premium_currency_bonus",
    public_apology: "if_wrongly_accused",
    expert_player_recognition: "special_status_if_legitimate",
    anti_cheat_improvement: "use_case_to_improve_system"
  }
}
```

#### Success Metrics for Obsessive Player Protection
```javascript
SUCCESS_METRICS: {
  
  // Primary metrics
  primary_metrics: {
    false_positive_rate: "< 0.1%",           // Extremely low false positives
    obsessive_player_retention: "> 95%",    // Keep dedicated players happy
    community_trust_score: "> 90%",         // High community confidence
    expert_player_satisfaction: "> 95%"     // Top players love the system
  },
  
  // Quality indicators
  quality_indicators: {
    manual_review_accuracy: "> 98%",
    appeal_overturn_rate: "< 5%",           // Few successful appeals = good detection
    obsessive_player_referrals: "tracked", // Happy obsessive players bring friends
    community_self_policing: "enabled"     // Players help identify real cheaters
  }
}

## ⚡ Performance Specifications

### Server Resource Requirements
```
MINIMUM_SPECS: {
  cpu_cores: 2,
  ram_gb: 2,
  storage_gb: 20,
  bandwidth_monthly_gb: 100
}

EXPECTED_CAPACITY: {
  concurrent_users: 500,
  daily_active_users: 2000,
  peak_requests_per_hour: 1000,
  database_writes_per_hour: 200
}
```

### Cost Projections
```
MONTHLY_COSTS: {
  vps_server: "$15-25",
  database: "included",
  bandwidth: "included",
  monitoring: "$5",
  total_estimated: "$20-30"
}

SCALING_THRESHOLDS: {
  upgrade_at_users: 1500,
  next_tier_cost: "$40-60",
  horizontal_scaling_point: 5000
}
```

## 🔧 Implementation Phases

### Phase 1: Basic Sync (Week 1)
- [x] Local-first game state
- [ ] 30-minute sync intervals
- [ ] Critical event sync
- [ ] Basic anti-cheat validation

### Phase 2: Advanced Anti-Cheat (Week 2)
- [ ] Statistical analysis system
- [ ] Player profiling
- [ ] Adaptive thresholds
- [ ] Human review workflow

### Phase 3: Optimization (Week 3)
- [ ] Batch processing optimization
- [ ] Rate limiting implementation
- [ ] Monitoring and alerting
- [ ] Performance tuning

### Phase 4: Scaling Preparation (Week 4)
- [ ] Load testing
- [ ] Horizontal scaling setup
- [ ] Backup and recovery
- [ ] Production deployment

## 📈 Monitoring & Analytics

### Key Metrics to Track
```javascript
MONITORING_METRICS: {
  performance: [
    "sync_success_rate",
    "avg_sync_duration",
    "server_response_time",
    "database_query_time"
  ],
  
  anti_cheat: [
    "flagged_accounts_per_day",
    "false_positive_rate",
    "manual_review_queue_size",
    "cheat_detection_accuracy"
  ],
  
  user_experience: [
    "offline_play_duration",
    "sync_conflict_rate",
    "data_loss_incidents",
    "user_satisfaction_score"
  ]
}
```

### Alert Thresholds
```javascript
ALERTS: {
  critical: {
    sync_failure_rate: "> 5%",
    server_cpu_usage: "> 90%",
    database_connections: "> 80%"
  },
  
  warning: {
    manual_review_queue: "> 50 accounts",
    false_positive_rate: "> 2%",
    avg_sync_time: "> 5 seconds"
  }
}
```

## 🎯 Success Criteria

### Technical Goals
- ✅ 30-minute sync intervals implemented
- ✅ < 1% false positive rate for anti-cheat
- ✅ 99.5% sync success rate
- ✅ < 3 second average sync time
- ✅ Support for 1000+ concurrent users

### User Experience Goals
- ✅ Zero-latency gameplay
- ✅ Seamless offline/online transitions
- ✅ Fair play enforcement without frustration
- ✅ Data integrity and loss prevention

### Business Goals
- ✅ Server costs < $30/month for 2000 DAU
- ✅ Scalable to 10,000+ users without major refactoring
- ✅ Robust enough for production deployment
- ✅ Maintainable by small development team

---

**Document Version**: 1.0  
**Last Updated**: December 2024  
**Next Review**: Implementation completion  
**Responsible**: Development Team