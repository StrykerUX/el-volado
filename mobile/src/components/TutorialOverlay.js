import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import hapticFeedback from '../utils/HapticFeedback';
import { 
  COLORS, 
  SHADOWS, 
  BORDER_RADIUS, 
  BORDERS, 
  SPACING, 
  FONTS 
} from '../constants/NeoBrutalTheme';

const { width, height } = Dimensions.get('window');

const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to the Game!',
    description: 'Let me show you around. This quick tour will teach you everything you need to know!',
    position: { x: width / 2, y: height / 2 },
    showHighlight: false,
  },
  {
    id: 'coin_flip',
    title: 'Flip the Coin',
    description: 'Tap the coin to flip it! You get double coins for heads and can build streaks for bonuses.',
    targetElement: 'coinFlip',
    position: { x: width / 2, y: height * 0.4 },
    showHighlight: true,
  },
  {
    id: 'stats_panel',
    title: 'Track Your Progress',
    description: 'Here you can see your coins, streak, and flip stats. You can also place bets for bigger rewards!',
    targetElement: 'statsPanel',
    position: { x: width / 2, y: height * 0.6 },
    showHighlight: true,
  },
  {
    id: 'shop_button',
    title: 'Upgrade Your Game',
    description: 'Use the Shop to buy upgrades and generators. Make each flip more profitable!',
    targetElement: 'shopButton',
    position: { x: width - 100, y: height - 150 },
    showHighlight: true,
  },
  {
    id: 'achievements',
    title: 'Earn Achievements',
    description: 'Complete achievements to earn permanent multipliers. Check your progress here!',
    targetElement: 'achievementsButton',
    position: { x: 100, y: height - 150 },
    showHighlight: true,
  },
  {
    id: 'ready',
    title: "You're All Set!",
    description: 'Now you know the basics. Start flipping coins and have fun! Tap the help button anytime for assistance.',
    position: { x: width / 2, y: height / 2 },
    showHighlight: false,
  },
];

const TutorialOverlay = ({ isVisible, onComplete, elementRefs = {} }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [elementPositions, setElementPositions] = useState({});
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isVisible) {
      startTutorial();
    }
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      measureElements();
      startStepAnimation();
      startPulseAnimation();
    }
  }, [currentStep, isVisible]);

  const measureElements = () => {
    const positions = {};
    
    Object.keys(elementRefs).forEach(key => {
      if (elementRefs[key]?.current) {
        elementRefs[key].current.measure((x, y, width, height, pageX, pageY) => {
          positions[key] = {
            x: pageX + width / 2,
            y: pageY + height / 2,
            width,
            height,
          };
          setElementPositions(prev => ({ ...prev, [key]: positions[key] }));
        });
      }
    });
  };

  const startTutorial = () => {
    setCurrentStep(0);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const startStepAnimation = () => {
    scaleAnim.setValue(0.8);
    Animated.spring(scaleAnim, {
      toValue: 1,
      tension: 50,
      friction: 7,
      useNativeDriver: true,
    }).start();
  };

  const startPulseAnimation = () => {
    const step = TUTORIAL_STEPS[currentStep];
    if (step?.showHighlight) {
      const pulse = () => {
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (isVisible && step.showHighlight) {
            pulse();
          }
        });
      };
      pulse();
    }
  };

  const handleNext = () => {
    hapticFeedback.vibrate('light');
    
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    hapticFeedback.vibrate('light');
    handleComplete();
  };

  const handleComplete = async () => {
    hapticFeedback.vibrate('success');
    
    // Mark tutorial as completed
    await AsyncStorage.setItem('tutorialCompleted', 'true');
    
    // Fade out animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onComplete();
    });
  };

  const getCurrentStep = () => TUTORIAL_STEPS[currentStep];
  
  const getTooltipPosition = () => {
    const step = getCurrentStep();
    
    if (step.targetElement && elementPositions[step.targetElement]) {
      const elementPos = elementPositions[step.targetElement];
      return {
        x: elementPos.x,
        y: elementPos.y + elementPos.height / 2 + 60, // Position below the element
      };
    }
    
    return step.position;
  };

  const getHighlightPosition = () => {
    const step = getCurrentStep();
    
    if (step.targetElement && elementPositions[step.targetElement]) {
      return elementPositions[step.targetElement];
    }
    
    return null;
  };

  if (!isVisible) return null;

  const step = getCurrentStep();
  const tooltipPosition = getTooltipPosition();
  const highlightPosition = getHighlightPosition();

  return (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
    >
      <View style={styles.overlay}>
        {/* Dark overlay */}
        <Animated.View 
          style={[
            styles.darkOverlay,
            { opacity: fadeAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 0.7],
            })}
          ]} 
        />

        {/* Highlight circle */}
        {step.showHighlight && highlightPosition && (
          <Animated.View
            style={[
              styles.highlight,
              {
                left: highlightPosition.x - 60,
                top: highlightPosition.y - 60,
                transform: [{ scale: pulseAnim }],
              }
            ]}
          />
        )}

        {/* Tooltip */}
        <Animated.View
          style={[
            styles.tooltip,
            {
              left: Math.max(20, Math.min(width - 300, tooltipPosition.x - 150)),
              top: Math.max(100, Math.min(height - 200, tooltipPosition.y)),
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          {/* Step indicator */}
          <View style={styles.stepIndicator}>
            <Text style={styles.stepText}>
              {currentStep + 1} of {TUTORIAL_STEPS.length}
            </Text>
          </View>

          {/* Content */}
          <Text style={styles.tooltipTitle}>{step.title}</Text>
          <Text style={styles.tooltipDescription}>{step.description}</Text>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
              <Text style={styles.skipButtonText}>Skip Tour</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleNext} style={styles.nextButton}>
              <Text style={styles.nextButtonText}>
                {currentStep === TUTORIAL_STEPS.length - 1 ? 'Get Started!' : 'Next'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* Progress dots */}
        <View style={styles.progressContainer}>
          {TUTORIAL_STEPS.map((_, index) => (
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
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    position: 'relative',
  },
  darkOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.text,
  },
  highlight: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'transparent',
    borderWidth: 3,
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  tooltip: {
    position: 'absolute',
    width: 280,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...BORDERS.thick,
    borderColor: COLORS.primary,
    ...SHADOWS.large,
  },
  stepIndicator: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  stepText: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.background,
  },
  tooltipTitle: {
    fontSize: 20,
    fontFamily: FONTS.black,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  tooltipDescription: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skipButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  skipButtonText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  nextButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    ...BORDERS.medium,
    borderColor: COLORS.primaryDark,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.background,
  },
  progressContainer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.xs,
  },
  progressDotActive: {
    backgroundColor: COLORS.primary,
    transform: [{ scale: 1.2 }],
  },
  progressDotCompleted: {
    backgroundColor: COLORS.success,
  },
});

export default TutorialOverlay;