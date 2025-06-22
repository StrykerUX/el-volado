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
import { useLanguage } from '../contexts/LanguageContext';
import { 
  COLORS, 
  SHADOWS, 
  BORDER_RADIUS, 
  BORDERS, 
  SPACING, 
  FONTS 
} from '../constants/NeoBrutalTheme';

const HelpButton = ({ position = 'bottom-right', onTutorialRestart }) => {
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const { t } = useLanguage();

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
                <Text style={styles.headerTitle}>{t('tutorial.help')}</Text>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Tabs */}
              <View style={styles.tabContainer}>
                {renderTab('general', 'Guía', '📖')}
                {renderTab('tips', 'Consejos', '💡')}
                {renderTab('features', 'Características', '⚡')}
              </View>

              {/* Content */}
              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                <Text style={styles.contentTitle}>
                  {activeTab === 'general' ? t('help.title') : 
                   activeTab === 'tips' ? t('help.tips.title') : 
                   'Características del Juego'}
                </Text>
                
                {activeTab === 'general' && (
                  <>
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>{t('help.sections.basicGameplay.title')}</Text>
                      <Text style={styles.sectionContent}>{t('help.sections.basicGameplay.content')}</Text>
                    </View>
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>{t('help.sections.bettingSystem.title')}</Text>
                      <Text style={styles.sectionContent}>{t('help.sections.bettingSystem.content')}</Text>
                    </View>
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>{t('help.sections.upgrades.title')}</Text>
                      <Text style={styles.sectionContent}>{t('help.sections.upgrades.content')}</Text>
                    </View>
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>{t('help.sections.generators.title')}</Text>
                      <Text style={styles.sectionContent}>{t('help.sections.generators.content')}</Text>
                    </View>
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>{t('help.sections.achievements.title')}</Text>
                      <Text style={styles.sectionContent}>{t('help.sections.achievements.content')}</Text>
                    </View>
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>{t('help.sections.prestige.title')}</Text>
                      <Text style={styles.sectionContent}>{t('help.sections.prestige.content')}</Text>
                    </View>
                  </>
                )}

                {activeTab === 'tips' && (
                  <>
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>{t('help.tips.title')}</Text>
                      {t('help.tips.items').map((tip, index) => (
                        <Text key={index} style={styles.tipItem}>• {tip}</Text>
                      ))}
                    </View>
                  </>
                )}

                {activeTab === 'features' && (
                  <>
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>{t('help.fairPlay.title')}</Text>
                      <Text style={styles.sectionContent}>{t('help.fairPlay.content')}</Text>
                    </View>
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>📱 Optimizado para Móvil</Text>
                      <Text style={styles.sectionContent}>Diseñado específicamente para móvil con vibración háptica, objetivos táctiles optimizados y animaciones suaves a 60fps.</Text>
                    </View>
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>🔄 Sincronización en la Nube</Text>
                      <Text style={styles.sectionContent}>Tu progreso se sincroniza automáticamente en la nube cada 30 minutos. Juega offline y tu progreso se sincronizará cuando te reconectes.</Text>
                    </View>
                    <View style={styles.section}>
                      <Text style={styles.sectionTitle}>🎨 Accesibilidad</Text>
                      <Text style={styles.sectionContent}>Modo de alto contraste, opciones de movimiento reducido y soporte para lector de pantalla hacen el juego accesible para todos.</Text>
                    </View>
                  </>
                )}

                {/* Tutorial restart button */}
                {activeTab === 'general' && (
                  <TouchableOpacity 
                    style={styles.tutorialButton}
                    onPress={handleRestartTutorial}
                  >
                    <Text style={styles.tutorialButtonText}>
                      🎯 {t('tutorial.restart')}
                    </Text>
                  </TouchableOpacity>
                )}
              </ScrollView>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  💡 Mantén presionado cualquier elemento para tooltips detallados
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
  tipItem: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: SPACING.xs,
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