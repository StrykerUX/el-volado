import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Modal,
} from 'react-native';
import HapticFeedback from '../utils/HapticFeedback';
import { 
  COLORS, 
  SHADOWS, 
  BORDER_RADIUS, 
  BORDERS, 
  SPACING, 
  FONTS 
} from '../constants/NeoBrutalTheme';

const { width, height } = Dimensions.get('window');

const TOOLTIP_CONTENT = {
  coinFlip: {
    title: 'Coin Flip',
    description: 'Tap to flip the coin! Get heads for double coins and build streaks for massive bonuses.',
    tips: ['Tap rapidly for more flips', 'Heads give 2x coins', 'Build streaks for bonuses'],
  },
  statsPanel: {
    title: 'Game Stats',
    description: 'Track your progress here. Your coins, streak count, and betting options are all displayed.',
    tips: ['Current coin balance', 'Active heads streak', 'Betting controls'],
  },
  shopButton: {
    title: 'Shop & Upgrades',
    description: 'Buy upgrades to improve your coin generation and unlock powerful generators.',
    tips: ['Tap multiplier upgrades', 'Passive generators', 'Prestige upgrades'],
  },
  achievementsButton: {
    title: 'Achievements',
    description: 'Complete achievements to earn permanent multipliers and bonus coins.',
    tips: ['Track your progress', 'Earn multipliers', 'Get bonus rewards'],
  },
  prestigeButton: {
    title: 'Prestige System',
    description: 'Reset your progress for prestige points and massive permanent multipliers.',
    tips: ['Reset for points', 'Huge multipliers', 'Long-term progression'],
  },
  settingsButton: {
    title: 'Game Settings',
    description: 'Customize your game experience with sound, accessibility, and account options.',
    tips: ['Sound controls', 'Accessibility options', 'Account management'],
  },
};

const TooltipSystem = () => {
  const [activeTooltip, setActiveTooltip] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  const showTooltip = (tooltipId, targetRef) => {
    if (!TOOLTIP_CONTENT[tooltipId] || !targetRef?.current) return;

    // Measure target element position
    targetRef.current.measure((x, y, width, height, pageX, pageY) => {
      setTooltipPosition({
        x: pageX + width / 2,
        y: pageY + height + 10, // Position below the element
        targetWidth: width,
        targetHeight: height,
      });
      
      setActiveTooltip(tooltipId);
      
      // Start show animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();
    });
  };

  const hideTooltip = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setActiveTooltip(null);
    });
  };

  const handleClose = () => {
    HapticFeedback.light();
    hideTooltip();
  };

  const getTooltipStyle = () => {
    const tooltipWidth = 260;
    const tooltipHeight = 180;
    
    // Calculate position to keep tooltip on screen
    let left = tooltipPosition.x - tooltipWidth / 2;
    let top = tooltipPosition.y;
    
    // Adjust horizontal position
    if (left < 20) left = 20;
    if (left + tooltipWidth > width - 20) left = width - tooltipWidth - 20;
    
    // Adjust vertical position if tooltip would go off screen
    if (top + tooltipHeight > height - 50) {
      top = tooltipPosition.y - tooltipHeight - tooltipPosition.targetHeight - 20;
    }
    
    return {
      left,
      top: Math.max(50, top),
    };
  };

  if (!activeTooltip) return null;

  const content = TOOLTIP_CONTENT[activeTooltip];
  const tooltipStyle = getTooltipStyle();

  return (
    <Modal
      visible={!!activeTooltip}
      transparent={true}
      animationType="none"
      statusBarTranslucent={true}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={handleClose}
      >
        <Animated.View
          style={[
            styles.tooltip,
            tooltipStyle,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            }
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{content.title}</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Description */}
          <Text style={styles.description}>{content.description}</Text>

          {/* Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>Quick Tips:</Text>
            {content.tips.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <Text style={styles.tipBullet}>•</Text>
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>

          {/* Arrow pointing to target */}
          <View 
            style={[
              styles.arrow,
              tooltipPosition.y > height / 2 ? styles.arrowDown : styles.arrowUp,
            ]} 
          />
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

// Hook for easy tooltip usage
export const useTooltip = () => {
  const [tooltipRef, setTooltipRef] = useState(null);

  const showTooltip = (tooltipId, targetRef) => {
    if (tooltipRef?.showTooltip) {
      tooltipRef.showTooltip(tooltipId, targetRef);
    }
  };

  const TooltipProvider = () => (
    <TooltipSystem ref={setTooltipRef} />
  );

  return { showTooltip, TooltipProvider };
};

// Higher-order component for easy tooltip integration
export const withTooltip = (WrappedComponent, tooltipId) => {
  return React.forwardRef((props, ref) => {
    const elementRef = useRef(null);
    const { showTooltip } = useTooltip();

    const handleLongPress = () => {
      HapticFeedback.medium();
      showTooltip(tooltipId, elementRef);
    };

    return (
      <TouchableOpacity
        ref={elementRef}
        onLongPress={handleLongPress}
        delayLongPress={500}
        activeOpacity={0.9}
        {...props}
      >
        <WrappedComponent ref={ref} {...props} />
      </TouchableOpacity>
    );
  });
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  tooltip: {
    position: 'absolute',
    width: 260,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...BORDERS.thick,
    borderColor: COLORS.primary,
    ...SHADOWS.large,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  title: {
    fontSize: 18,
    fontFamily: FONTS.black,
    color: COLORS.text,
  },
  closeButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...BORDERS.medium,
    borderColor: COLORS.border,
  },
  closeButtonText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
  },
  description: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.md,
  },
  tipsContainer: {
    marginTop: SPACING.sm,
  },
  tipsTitle: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: SPACING.xs,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.xs,
  },
  tipBullet: {
    fontSize: 12,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginRight: SPACING.xs,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    lineHeight: 16,
  },
  arrow: {
    position: 'absolute',
    left: '50%',
    marginLeft: -8,
    width: 0,
    height: 0,
    borderStyle: 'solid',
  },
  arrowUp: {
    top: -8,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: COLORS.primary,
  },
  arrowDown: {
    bottom: -8,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 8,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: COLORS.primary,
  },
});

export default TooltipSystem;