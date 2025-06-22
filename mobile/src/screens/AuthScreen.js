import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  ActivityIndicator,
} from 'react-native';
import useGameStore from '../stores/GameStore';
import hapticFeedback from '../utils/HapticFeedback';
import { useLanguage } from '../contexts/LanguageContext';
import { 
  COLORS, 
  SHADOWS, 
  BORDER_RADIUS, 
  BORDERS, 
  SPACING, 
  TYPOGRAPHY,
  FONTS 
} from '../constants/NeoBrutalTheme';

const AuthScreen = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const { loginUser, registerUser } = useGameStore();
  const { t, language, changeLanguage } = useLanguage();

  const validateForm = () => {
    const newErrors = {};
    
    if (!isLogin && !formData.username.trim()) {
      newErrors.username = t('auth.username') + ' es requerido';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = t('auth.email') + ' es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('auth.email') + ' no válido';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = t('auth.password') + ' es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = t('auth.password') + ' debe tener al menos 6 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      hapticFeedback.error();
      return;
    }

    setIsLoading(true);
    hapticFeedback.vibrate('light');

    try {
      let result;
      
      console.log('Starting authentication process...', { isLogin, formData });
      
      if (isLogin) {
        result = await loginUser(formData.email, formData.password);
      } else {
        result = await registerUser(formData.username, formData.email, formData.password);
      }

      console.log('Authentication result:', result);

      if (result.success) {
        console.log('Authentication successful, navigating directly...');
        hapticFeedback.vibrate('success');
        
        // Navigate directly instead of using Alert (web compatibility)
        console.log('Calling onAuthSuccess directly...');
        onAuthSuccess();
      } else {
        console.log('Authentication failed:', result.error);
        hapticFeedback.vibrate('error');
        Alert.alert(
          t('common.error'),
          result.error || 'Algo salió mal. Inténtalo de nuevo.',
          [{ text: t('common.ok') }]
        );
      }
    } catch (error) {
      hapticFeedback.vibrate('error');
      Alert.alert(
        t('common.error'),
        'Error de red. Verifica tu conexión e inténtalo de nuevo.',
        [{ text: t('common.ok') }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ username: '', email: '', password: '' });
    setErrors({});
    hapticFeedback.vibrate('light');
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      
      <View style={styles.content}>
        {/* Language Selector */}
        <View style={styles.languageSelector}>
          <TouchableOpacity
            style={[
              styles.languageButton,
              language === 'es' && styles.languageButtonActive
            ]}
            onPress={() => changeLanguage('es')}
          >
            <Text style={[
              styles.languageText,
              language === 'es' && styles.languageTextActive
            ]}>
              ES
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.languageButton,
              language === 'en' && styles.languageButtonActive
            ]}
            onPress={() => changeLanguage('en')}
          >
            <Text style={[
              styles.languageText,
              language === 'en' && styles.languageTextActive
            ]}>
              EN
            </Text>
          </TouchableOpacity>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>🎮 VOLADO</Text>
          <Text style={styles.tagline}>
            {t('auth.subtitle')}
          </Text>
          <Text style={styles.subtitle}>
            Sin Pay-to-Win • Habilidad Pura • Diversión Real
          </Text>
        </View>

        {/* Auth Form */}
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>
            {isLogin ? t('auth.welcome') : t('auth.welcome')}
          </Text>

          {/* Username field (only for register) */}
          {!isLogin && (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{t('auth.username')}</Text>
              <TextInput
                style={[
                  styles.input,
                  errors.username && styles.inputError
                ]}
                placeholder="Elige un nombre de usuario"
                placeholderTextColor={COLORS.textSecondary}
                value={formData.username}
                onChangeText={(value) => updateFormData('username', value)}
                autoCapitalize="none"
                autoCorrect={false}
              />
              {errors.username && (
                <Text style={styles.errorText}>{errors.username}</Text>
              )}
            </View>
          )}

          {/* Email field */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('auth.email')}</Text>
            <TextInput
              style={[
                styles.input,
                errors.email && styles.inputError
              ]}
              placeholder="tu@email.com"
              placeholderTextColor={COLORS.textSecondary}
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
            />
            {errors.email && (
              <Text style={styles.errorText}>{errors.email}</Text>
            )}
          </View>

          {/* Password field */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{t('auth.password')}</Text>
            <TextInput
              style={[
                styles.input,
                errors.password && styles.inputError
              ]}
              placeholder="Ingresa tu contraseña"
              placeholderTextColor={COLORS.textSecondary}
              value={formData.password}
              onChangeText={(value) => updateFormData('password', value)}
              secureTextEntry
              autoCapitalize="none"
              autoCorrect={false}
            />
            {errors.password && (
              <Text style={styles.errorText}>{errors.password}</Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              isLoading && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <ActivityIndicator color={COLORS.background} size="small" />
            ) : (
              <Text style={styles.submitButtonText}>
                {isLogin ? t('auth.loginButton') : t('auth.registerButton')}
              </Text>
            )}
          </TouchableOpacity>

          {/* Toggle Mode */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
            </Text>
            <TouchableOpacity onPress={toggleMode}>
              <Text style={styles.toggleLink}>
                {isLogin ? ' ' + t('auth.switchToRegister') : ' ' + t('auth.switchToLogin')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Al continuar, aceptas nuestra política de juego justo
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  logo: {
    fontSize: 48,
    fontFamily: FONTS.black,
    color: COLORS.primary,
    textAlign: 'center',
    ...SHADOWS.large,
  },
  tagline: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginTop: SPACING.sm,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
  },
  formContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...BORDERS.thick,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
  },
  formTitle: {
    fontSize: 24,
    fontFamily: FONTS.black,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.text,
    ...BORDERS.medium,
    borderColor: COLORS.border,
  },
  inputError: {
    borderColor: COLORS.error,
    borderWidth: BORDERS.thick.borderWidth,
  },
  errorText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.error,
    marginTop: SPACING.xs,
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md,
    ...BORDERS.thick,
    borderColor: COLORS.primaryDark,
    ...SHADOWS.medium,
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.disabled,
    borderColor: COLORS.disabled,
  },
  submitButtonText: {
    fontSize: 18,
    fontFamily: FONTS.black,
    color: COLORS.background,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  toggleText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
  },
  toggleLink: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  footer: {
    marginTop: SPACING.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  languageSelector: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  languageButton: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    ...BORDERS.medium,
    borderColor: COLORS.border,
    minWidth: 50,
    alignItems: 'center',
  },
  languageButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primaryDark,
    ...SHADOWS.small,
  },
  languageText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.text,
  },
  languageTextActive: {
    color: COLORS.background,
  },
});

export default AuthScreen;