import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useGameStore from '../stores/GameStore';
import AuthScreen from '../screens/AuthScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import GameScreen from '../screens/GameScreen';
import { COLORS } from '../constants/NeoBrutalTheme';

const AppNavigator = () => {
  const [currentRoute, setCurrentRoute] = useState('Loading');
  const [isLoading, setIsLoading] = useState(true);
  const { initializeSync, syncEnabled } = useGameStore();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Check authentication status
      const accessToken = await AsyncStorage.getItem('accessToken');
      const isAuthenticated = !!accessToken;

      // Check onboarding completion
      const onboardingComplete = await AsyncStorage.getItem('onboardingComplete');
      const hasCompletedOnboarding = onboardingComplete === 'true';

      // Determine initial route based on user state
      let initialRoute = 'Auth';
      
      if (isAuthenticated) {
        if (hasCompletedOnboarding) {
          initialRoute = 'Game';
          // Initialize sync for authenticated users
          await initializeSync();
        } else {
          initialRoute = 'Onboarding';
        }
      }

      console.log('App initialization:', {
        isAuthenticated,
        hasCompletedOnboarding,
        initialRoute,
        syncEnabled
      });

      setCurrentRoute(initialRoute);
    } catch (error) {
      console.error('Error initializing app:', error);
      setCurrentRoute('Auth');
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToOnboarding = () => {
    setCurrentRoute('Onboarding');
  };

  const navigateToGame = async () => {
    try {
      // Mark onboarding as complete
      await AsyncStorage.setItem('onboardingComplete', 'true');
      
      // Initialize sync if authenticated
      if (syncEnabled) {
        await initializeSync();
      }
      
      setCurrentRoute('Game');
    } catch (error) {
      console.error('Error navigating to game:', error);
    }
  };

  const navigateToAuth = async () => {
    try {
      // Clear onboarding state when going back to auth
      await AsyncStorage.removeItem('onboardingComplete');
      setCurrentRoute('Auth');
    } catch (error) {
      console.error('Error navigating to auth:', error);
    }
  };

  // Loading screen
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Route to appropriate screen
  switch (currentRoute) {
    case 'Auth':
      return (
        <AuthScreen 
          onAuthSuccess={navigateToOnboarding}
        />
      );

    case 'Onboarding':
      return (
        <OnboardingScreen 
          onComplete={navigateToGame}
          onSkip={navigateToGame}
        />
      );

    case 'Game':
      return (
        <GameScreen 
          onLogout={navigateToAuth}
        />
      );

    default:
      return (
        <AuthScreen 
          onAuthSuccess={navigateToOnboarding}
        />
      );
  }
};

const styles = {
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
};

export default AppNavigator;