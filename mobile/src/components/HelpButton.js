import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  ScrollView,
  SafeAreaView,
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

const HELP_CONTENT = {
  general: {
    title: 'How to Play Volado',
    sections: [
      {
        title: '🪙 Basic Gameplay',
        content: 'Tap the coin to flip it! Getting heads gives you double coins, while tails gives you the base amount. Build streaks of consecutive heads for massive bonuses!'
      },
      {
        title: '💰 Betting System',
        content: 'Use the betting buttons to wager a percentage of your coins. Winning bets give you 1.8x your wager back. Risk more to earn more!'
      },
      {
        title: '⚡ Upgrades',
        content: 'Buy upgrades in the shop to increase your coins per tap, streak bonuses, flip speed, and more. Each upgrade makes you more powerful!'
      },
      {
        title: '🏭 Generators',
        content: 'Purchase generators for passive income. They earn coins automatically even when you\'re not actively playing.'
      },
      {
        title: '🏆 Achievements',
        content: 'Complete achievements to earn permanent multipliers. These bonuses apply to all your coin earnings!'
      },
      {
        title: '🌟 Prestige',
        content: 'When you\'ve earned enough coins, you can prestige to reset your progress for massive permanent multipliers.'
      }
    ]
  },
  tips: {
    title: 'Pro Tips',
    sections: [
      {
        title: '🎯 Strategy Tips',
        content: '• Focus on tap multiplier upgrades first\n• Build your streak carefully before big bets\n• Generators provide steady passive income\n• Complete achievements for permanent bonuses'
      },
      {
        title: '🎮 Gameplay Tips',
        content: '• The game is completely fair - 50/50 odds always\n• No pay-to-win mechanics, skill and strategy matter\n• Play offline and sync when you reconnect\n• Long press elements for detailed tooltips'
      },
      {
        title: '⚡ Efficiency Tips',
        content: '• Upgrade flip speed to flip coins faster\n• Use multi-bet for consecutive betting\n• Prestige when progress slows down\n• Check achievements regularly for goals'
      }
    ]
  },
  features: {
    title: 'Game Features',
    sections: [
      {
        title: '✨ Fair Play',
        content: 'Volado guarantees 50/50 coin flip odds with no hidden mechanics. Our anti-cheat system protects dedicated players while ensuring fair competition.'
      },
      {
        title: '📱 Mobile Optimized',
        content: 'Designed specifically for mobile with haptic feedback, optimized touch targets, and smooth 60fps animations.'
      },
      {
        title: '🔄 Cloud Sync',
        content: 'Your progress automatically syncs to the cloud every 30 minutes. Play offline and your progress will sync when you reconnect.'
      },
      {
        title: '🎨 Accessibility',
        content: 'High contrast mode, reduced motion options, and screen reader support make the game accessible to everyone.'
      }
    ]
  }
};

const HelpButton = ({ position = 'bottom-right', onTutorialRestart }) => {
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    // Start subtle pulse animation
    const pulse = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]).start(() => pulse());
    };
    pulse();
  }, []);

  const handlePress = () => {
    hapticFeedback.vibrate('medium');
    setIsHelpVisible(true);
    
    // Fade in animation
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const handleClose = () => {
    hapticFeedback.vibrate('light');
    
    // Fade out animation
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setIsHelpVisible(false);
    });
  };

  const handleTabPress = (tab) => {
    hapticFeedback.vibrate('light');
    setActiveTab(tab);
  };

  const handleRestartTutorial = async () => {
    hapticFeedback.vibrate('success');
    
    // Clear tutorial completion flag
    await AsyncStorage.removeItem('tutorialCompleted');
    
    handleClose();
    
    // Trigger tutorial restart if callback provided
    if (onTutorialRestart) {
      setTimeout(() => onTutorialRestart(), 500);
    }
  };

  const getButtonStyle = () => {
    const baseStyle = [styles.helpButton];
    
    switch (position) {
      case 'top-right':
        return [...baseStyle, styles.topRight];
      case 'top-left':
        return [...baseStyle, styles.topLeft];
      case 'bottom-left':
        return [...baseStyle, styles.bottomLeft];
      default:
        return [...baseStyle, styles.bottomRight];
    }
  };

  const renderSection = (section, index) => (
    <View key={index} style={styles.section}>
      <Text style={styles.sectionTitle}>{section.title}</Text>
      <Text style={styles.sectionContent}>{section.content}</Text>
    </View>
  );

  const renderTab = (tabId, title, icon) => (
    <TouchableOpacity
      key={tabId}
      style={[
        styles.tab,
        activeTab === tabId && styles.activeTab
      ]}
      onPress={() => handleTabPress(tabId)}
    >
      <Text style={[
        styles.tabIcon,
        activeTab === tabId && styles.activeTabText
      ]}>
        {icon}
      </Text>
      <Text style={[
        styles.tabText,
        activeTab === tabId && styles.activeTabText
      ]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  return (
    <>
      {/* Help Button */}
      <Animated.View
        style={[
          getButtonStyle(),
          { transform: [{ scale: pulseAnim }] }
        ]}
      >
        <TouchableOpacity
          style={styles.button}
          onPress={handlePress}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>?</Text>
        </TouchableOpacity>
      </Animated.View>

      {/* Help Modal */}
      <Modal
        visible={isHelpVisible}
        animationType="none"
        transparent={true}
        statusBarTranslucent={true}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContent,
              { opacity: fadeAnim }
            ]}
          >
            <SafeAreaView style={styles.modalContainer}>
              {/* Header */}
              <View style={styles.header}>
                <Text style={styles.headerTitle}>Help & Tips</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Tabs */}
              <View style={styles.tabContainer}>
                {renderTab('general', 'Guide', '📖')}
                {renderTab('tips', 'Tips', '💡')}
                {renderTab('features', 'Features', '⚡')}
              </View>

              {/* Content */}
              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.contentTitle}>
                  {HELP_CONTENT[activeTab].title}
                </Text>
                
                {HELP_CONTENT[activeTab].sections.map((section, index) => 
                  renderSection(section, index)
                )}

                {/* Tutorial restart button */}
                {activeTab === 'general' && (
                  <TouchableOpacity 
                    style={styles.tutorialButton}
                    onPress={handleRestartTutorial}
                  >
                    <Text style={styles.tutorialButtonText}>
                      🎯 Restart Tutorial
                    </Text>
                  </TouchableOpacity>
                )}
              </ScrollView>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  💡 Long press any element for detailed tooltips
                </Text>
              </View>
            </SafeAreaView>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  helpButton: {
    position: 'absolute',
    zIndex: 1000,
  },
  topRight: {
    top: 60,
    right: SPACING.lg,
  },
  topLeft: {
    top: 60,
    left: SPACING.lg,
  },
  bottomRight: {
    bottom: 100,
    right: SPACING.lg,
  },
  bottomLeft: {
    bottom: 100,
    left: SPACING.lg,
  },
  button: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    ...BORDERS.thick,
    borderColor: COLORS.primaryDark,
    ...SHADOWS.medium,
  },
  buttonText: {
    fontSize: 24,
    fontFamily: FONTS.black,
    color: COLORS.background,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    ...BORDERS.thick,
    borderColor: COLORS.border,
    ...SHADOWS.large,
  },
  modalContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: BORDERS.medium.borderWidth,
    borderBottomColor: COLORS.border,
  },
  headerTitle: {
    fontSize: 24,
    fontFamily: FONTS.black,
    color: COLORS.text,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...BORDERS.medium,
    borderColor: COLORS.border,
  },
  closeButtonText: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: BORDERS.medium.borderWidth,
    borderBottomColor: COLORS.border,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  activeTab: {
    backgroundColor: COLORS.primary,
  },
  tabIcon: {
    fontSize: 16,
    marginRight: SPACING.xs,
  },
  tabText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.textSecondary,
  },
  activeTabText: {
    color: COLORS.background,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  contentTitle: {
    fontSize: 20,
    fontFamily: FONTS.black,
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  section: {
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: SPACING.sm,
  },
  sectionContent: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    lineHeight: 20,
  },
  tutorialButton: {
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.lg,
    ...BORDERS.thick,
    borderColor: COLORS.secondaryDark,
    ...SHADOWS.medium,
  },
  tutorialButtonText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.background,
  },
  footer: {
    padding: SPACING.md,
    borderTopWidth: BORDERS.medium.borderWidth,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  footerText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});

export default HelpButton;