import React from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import useGameStore from '../stores/GameStore';

const TapButton = () => {
  const { tap, coins, coinsPerTap } = useGameStore();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;
  
  const handleTap = () => {
    tap();
    
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 75,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 75,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handleTap}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.button,
          {
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={styles.buttonText}>💰</Text>
        <Text style={styles.coinsText}>+{coinsPerTap}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  button: {
    width: 200,
    height: 200,
    backgroundColor: '#FFD700',
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  buttonText: {
    fontSize: 80,
  },
  coinsText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#8B4513',
    marginTop: 5,
  },
});

export default TapButton;