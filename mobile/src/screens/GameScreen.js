import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Text,
  Animated,
} from 'react-native';
import useGameStore from '../stores/GameStore';
import CoinDisplay from '../components/CoinDisplay';
import CoinFlip from '../components/CoinFlip';
import FlipStats from '../components/FlipStats';
import ShopPanel from '../components/ShopPanel';
import AchievementsPanel from '../components/AchievementsPanel';
import PrestigePanel from '../components/PrestigePanel';
import OfflineEarningsModal from '../components/OfflineEarningsModal';
import SettingsPanel from '../components/SettingsPanel';
import TutorialOverlay from '../components/TutorialOverlay';
import HelpButton from '../components/HelpButton';
import TooltipSystem from '../components/TooltipSystem';
import { useFloatingNumbers } from '../components/FloatingNumbers';
import { useParticles } from '../components/ParticleSystem';
import FeedbackSystem from '../utils/FeedbackSystem';
import { COLORS, SHADOWS, BORDER_RADIUS, BORDERS, SPACING, TYPOGRAPHY } from '../constants/NeoBrutalTheme';

const GameScreen = ({ onLogout }) => {
  const { 
    loadGame, 
    saveGame, 
    resetGame,
    setFloatingNumberHandler,
    setParticleHandler,
    initializeOnboardingState,
    hasCompletedTutorial,
    showTutorial,
    startTutorial,
    completeTutorial,
    restartTutorial
  } = useGameStore();
  const [showShop, setShowShop] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showPrestige, setShowPrestige] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [offlineEarnings, setOfflineEarnings] = useState(null);
  
  // Refs for tutorial targeting
  const coinFlipRef = useRef(null);
  const statsPanelRef = useRef(null);
  const shopButtonRef = useRef(null);
  const achievementsButtonRef = useRef(null);
  const prestigeButtonRef = useRef(null);
  const settingsButtonRef = useRef(null);

  // Visual effects hooks
  const { showFloatingNumber, FloatingNumbersRenderer } = useFloatingNumbers();
  const { 
    createCoinExplosion,
    createStreakCelebration,
    createAchievementCelebration,
    createPrestigeCelebration,
    ParticleRenderer 
  } = useParticles();

  // Debug function - can be called from console if needed
  global.resetGame = resetGame;
  
  useEffect(() => {
    // Initialize game and tutorial state
    const initializeGame = async () => {
      // Load game data first
      const offlineData = await loadGame();
      if (offlineData) {
        setOfflineEarnings(offlineData);
      }
      
      // Initialize onboarding state
      await initializeOnboardingState();
      
      // Start tutorial if not completed
      if (!hasCompletedTutorial) {
        setTimeout(() => {
          startTutorial();
        }, 1500); // Delay to allow UI to settle
      }
    };
    
    initializeGame();
    
    // Set up visual effects handlers
    setFloatingNumberHandler(showFloatingNumber);
    setParticleHandler((type, x, y, ...args) => {
      switch (type) {
        case 'coinExplosion':
          createCoinExplosion(x, y);
          break;
        case 'streakCelebration':
          createStreakCelebration(x, y, args[0]);
          break;
        case 'achievementCelebration':
          createAchievementCelebration(x, y);
          break;
        case 'prestigeCelebration':
          createPrestigeCelebration(x, y);
          break;
      }
    });
    
    // Auto-save every 5 seconds
    const saveInterval = setInterval(() => {
      saveGame();
    }, 5000);
    
    return () => clearInterval(saveInterval);
  }, []);

  // Handle tutorial restart from help button
  const handleTutorialRestart = () => {
    restartTutorial();
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Screen shake wrapper */}
      <Animated.View style={[styles.gameWrapper, FeedbackSystem.getScreenShakeTransform()]}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity
              ref={settingsButtonRef}
              style={styles.settingsButton}
              onPress={() => setShowSettings(true)}
            >
              <Text style={styles.settingsButtonText}>⚙️</Text>
            </TouchableOpacity>
          </View>
          <CoinDisplay />
        </View>
        
        <View style={styles.gameArea}>
          <View ref={coinFlipRef}>
            <CoinFlip />
          </View>
        </View>
        
        <View style={styles.bottomArea}>
          <View ref={statsPanelRef}>
            <FlipStats />
          </View>
          
          {/* Buttons Row */}
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              ref={shopButtonRef}
              style={[styles.actionButton, { backgroundColor: COLORS.secondary }]}
              onPress={() => setShowShop(true)}
            >
              <Text style={styles.actionButtonText}>🛒 TIENDA</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              ref={achievementsButtonRef}
              style={[styles.actionButton, { backgroundColor: COLORS.warning }]}
              onPress={() => setShowAchievements(true)}
            >
              <Text style={styles.actionButtonText}>🏆 LOGROS</Text>
            </TouchableOpacity>
          </View>
          
          {/* Prestige Button Row */}
          <View style={styles.prestigeRow}>
            <TouchableOpacity
              ref={prestigeButtonRef}
              style={[styles.prestigeButton, { backgroundColor: COLORS.accent }]}
              onPress={() => setShowPrestige(true)}
            >
              <Text style={styles.prestigeButtonText}>🌟 PRESTIGE</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>
      
      {/* Visual Effects Overlays */}
      <FloatingNumbersRenderer />
      <ParticleRenderer />
      
      {/* Panels */}
      <ShopPanel 
        visible={showShop} 
        onClose={() => setShowShop(false)} 
      />
      
      <AchievementsPanel 
        visible={showAchievements} 
        onClose={() => setShowAchievements(false)} 
      />
      
      <PrestigePanel 
        visible={showPrestige} 
        onClose={() => setShowPrestige(false)} 
      />
      
      <OfflineEarningsModal 
        visible={!!offlineEarnings} 
        onClose={() => setOfflineEarnings(null)}
        offlineData={offlineEarnings}
      />
      
      <SettingsPanel 
        visible={showSettings} 
        onClose={() => setShowSettings(false)}
        onLogout={onLogout} 
      />
      
      {/* Tutorial and Help System */}
      <TutorialOverlay
        isVisible={showTutorial}
        onComplete={completeTutorial}
        elementRefs={{
          coinFlip: coinFlipRef,
          statsPanel: statsPanelRef,
          shopButton: shopButtonRef,
          achievementsButton: achievementsButtonRef,
          prestigeButton: prestigeButtonRef,
          settingsButton: settingsButtonRef,
        }}
      />
      
      <HelpButton
        position="bottom-right"
        onTutorialRestart={handleTutorialRestart}
      />
      
      <TooltipSystem />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  gameWrapper: {
    flex: 1,
  },
  header: {
    flex: 0.7,
    justifyContent: 'center',
  },
  headerTop: {
    position: 'absolute',
    top: 0,
    right: SPACING.md,
    zIndex: 10,
  },
  settingsButton: {
    backgroundColor: COLORS.surface,
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalSmall,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingsButtonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
  },
  gameArea: {
    flex: 2.5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomArea: {
    flex: 1.2,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  buttonsRow: {
    flexDirection: 'row',
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.md,
    gap: SPACING.md,
  },
  actionButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalSmall,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.textLight,
    letterSpacing: 1,
  },
  prestigeRow: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.sm,
  },
  prestigeButton: {
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: BORDERS.thick,
    borderColor: COLORS.dark,
    ...SHADOWS.brutalSmall,
    alignItems: 'center',
  },
  prestigeButtonText: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.black,
    color: COLORS.textLight,
    letterSpacing: 1,
  },
});

export default GameScreen;