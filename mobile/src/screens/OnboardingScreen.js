import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  ScrollView,
} from 'react-native';
import HapticFeedback from '../utils/HapticFeedback';
import { 
  COLORS, 
  SHADOWS, 
  BORDER_RADIUS, 
  BORDERS, 
  SPACING, 
  TYPOGRAPHY,
  FONTS 
} from '../constants/NeoBrutalTheme';

const { width } = Dimensions.get('window');

const ONBOARDING_STEPS = [
  {
    id: 1,
    title: '🎮 Welcome to Volado!',
    subtitle: 'The Fair Coin Flip Game',
    description: 'Experience the thrill of coin flipping with guaranteed 50/50 odds. No tricks, no pay-to-win, just pure skill and strategy!',
    highlight: 'fair_play',
  },
  {
    id: 2,
    title: '🪙 Flip Coins, Earn Rewards',
    subtitle: 'Simple Yet Addictive',
    description: 'Tap the coin to flip it! Get heads for double coins, build streaks for massive bonuses, and bet strategically to multiply your winnings.',
    highlight: 'coin_flip',
  },
  {
    id: 3,
    title: '⚡ Upgrade & Progress',
    subtitle: 'Get Stronger Over Time',
    description: 'Buy upgrades to earn more coins per flip, unlock generators for passive income, and achieve milestones for permanent multipliers.',
    highlight: 'progression',
  },
  {
    id: 4,
    title: '🏆 Prestige & Compete',
    subtitle: 'Endless Gameplay',
    description: 'Reset your progress for prestige points and massive multipliers. Compete with players worldwide on fair leaderboards!',
    highlight: 'prestige',
  },
];

const OnboardingScreen = ({ onComplete, onSkip }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const scrollViewRef = useRef(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Initial animations
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleNext = () => {
    HapticFeedback.light();
    
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      
      // Scroll to next step
      scrollViewRef.current?.scrollTo({
        x: nextStep * width,
        animated: true,
      });
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    HapticFeedback.light();
    
    if (currentStep > 0) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      
      // Scroll to previous step
      scrollViewRef.current?.scrollTo({
        x: prevStep * width,
        animated: true,
      });
    }
  };

  const handleComplete = () => {
    HapticFeedback.success();
    onComplete();
  };

  const handleSkip = () => {
    HapticFeedback.light();
    onSkip();
  };

  const renderStep = (step, index) => {
    const isActive = index === currentStep;
    
    return (
      <View key={step.id} style={styles.stepContainer}>
        <Animated.View 
          style={[
            styles.stepContent,
            {
              opacity: isActive ? fadeAnim : 0.3,
              transform: [{
                scale: isActive ? slideAnim : 0.9,
              }],
            }
          ]}
        >
          {/* Step Visual */}
          <View style={styles.stepVisual}>
            <Text style={styles.stepEmoji}>
              {step.title.split(' ')[0]}
            </Text>
          </View>

          {/* Step Text */}
          <View style={styles.stepTextContainer}>
            <Text style={styles.stepTitle}>
              {step.title.substring(2)} {/* Remove emoji from title */}
            </Text>
            <Text style={styles.stepSubtitle}>
              {step.subtitle}
            </Text>
            <Text style={styles.stepDescription}>
              {step.description}
            </Text>
          </View>

          {/* Feature Highlights */}
          <View style={styles.highlightContainer}>
            {step.highlight === 'fair_play' && (
              <View style={styles.highlightCard}>
                <Text style={styles.highlightText}>
                  ✓ Guaranteed 50/50 odds{'\n'}
                  ✓ No pay-to-win mechanics{'\n'}
                  ✓ Fair anti-cheat system
                </Text>
              </View>
            )}
            
            {step.highlight === 'coin_flip' && (
              <View style={styles.highlightCard}>
                <Text style={styles.highlightText}>
                  🪙 Tap to flip coins{'\n'}
                  🔥 Build streaks for bonuses{'\n'}
                  💰 Strategic betting system
                </Text>
              </View>
            )}
            
            {step.highlight === 'progression' && (
              <View style={styles.highlightCard}>
                <Text style={styles.highlightText}>
                  ⚡ Upgrade multipliers{'\n'}
                  🏭 Passive generators{'\n'}
                  🏆 Achievement rewards
                </Text>
              </View>
            )}
            
            {step.highlight === 'prestige' && (
              <View style={styles.highlightCard}>
                <Text style={styles.highlightText}>
                  🌟 Prestige for multipliers{'\n'}
                  🏅 Global leaderboards{'\n'}
                  ♾️ Endless progression
                </Text>
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Getting Started</Text>
        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Indicator */}
      <View style={styles.progressContainer}>
        {ONBOARDING_STEPS.map((_, index) => (
          <View
            key={index}
            style={[
              styles.progressDot,
              index === currentStep && styles.progressDotActive,
              index < currentStep && styles.progressDotCompleted,
            ]}
          />
        ))}
      </View>

      {/* Steps Content */}
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEnabled={false}
        style={styles.stepsContainer}
        contentContainerStyle={styles.stepsContent}
      >
        {ONBOARDING_STEPS.map((step, index) => renderStep(step, index))}
      </ScrollView>

      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[
            styles.navButton,
            styles.prevButton,
            currentStep === 0 && styles.navButtonDisabled,
          ]}
          onPress={handlePrevious}
          disabled={currentStep === 0}
        >
          <Text style={[
            styles.navButtonText,
            currentStep === 0 && styles.navButtonTextDisabled,
          ]}>
            Previous
          </Text>
        </TouchableOpacity>

        <Text style={styles.stepCounter}>
          {currentStep + 1} of {ONBOARDING_STEPS.length}
        </Text>

        <TouchableOpacity
          style={[styles.navButton, styles.nextButton]}
          onPress={handleNext}
        >
          <Text style={styles.navButtonText}>
            {currentStep === ONBOARDING_STEPS.length - 1 ? "Let's Play!" : 'Next'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: FONTS.black,
    color: COLORS.text,
  },
  skipButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  skipButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  progressDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.xs,
    ...BORDERS.medium,
    borderColor: COLORS.border,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
    transform: [{ scale: 1.2 }],
  },
  progressDotCompleted: {
    backgroundColor: COLORS.success,
    borderColor: COLORS.successDark,
  },
  stepsContainer: {
    flex: 1,
  },
  stepsContent: {
    width: width * ONBOARDING_STEPS.length,
  },
  stepContainer: {
    width: width,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
  },
  stepContent: {
    alignItems: 'center',
  },
  stepVisual: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
    ...BORDERS.thick,
    borderColor: COLORS.border,
    ...SHADOWS.large,
  },
  stepEmoji: {
    fontSize: 48,
  },
  stepTextContainer: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  stepTitle: {
    fontSize: 28,
    fontFamily: FONTS.black,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  stepSubtitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  stepDescription: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.md,
  },
  highlightContainer: {
    width: '100%',
  },
  highlightCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...BORDERS.thick,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  highlightText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    lineHeight: 20,
    textAlign: 'center',
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
  },
  navButton: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    ...BORDERS.thick,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
    minWidth: 80,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
  },
  prevButton: {
    backgroundColor: COLORS.surface,
  },
  navButtonDisabled: {
    backgroundColor: COLORS.disabled,
    borderColor: COLORS.disabled,
  },
  navButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    textAlign: 'center',
  },
  navButtonTextDisabled: {
    color: COLORS.textSecondary,
  },
  stepCounter: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
});

export default OnboardingScreen;