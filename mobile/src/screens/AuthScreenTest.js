import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { COLORS, SPACING, FONTS } from '../constants/NeoBrutalTheme';

const AuthScreenTest = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
  });

  const toggleMode = () => {
    console.log('Toggle - Current isLogin:', isLogin);
    setIsLogin(!isLogin);
    console.log('Toggle - New isLogin will be:', !isLogin);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {isLogin ? 'Login Mode' : 'Register Mode'}
        </Text>

        {/* Username field (only for register) */}
        {!isLogin && (
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter username"
              value={formData.username}
              onChangeText={(value) => 
                setFormData(prev => ({ ...prev, username: value }))
              }
            />
          </View>
        )}

        {/* Email field */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter email"
            value={formData.email}
            onChangeText={(value) => 
              setFormData(prev => ({ ...prev, email: value }))
            }
          />
        </View>

        {/* Password field */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter password"
            value={formData.password}
            secureTextEntry
            onChangeText={(value) => 
              setFormData(prev => ({ ...prev, password: value }))
            }
          />
        </View>

        {/* Toggle Button */}
        <TouchableOpacity style={styles.toggleButton} onPress={toggleMode}>
          <Text style={styles.toggleText}>
            {isLogin ? 'Switch to Register' : 'Switch to Login'}
          </Text>
        </TouchableOpacity>

        {/* Debug Info */}
        <View style={styles.debug}>
          <Text>Current Mode: {isLogin ? 'Login' : 'Register'}</Text>
          <Text>Show Username: {!isLogin ? 'YES' : 'NO'}</Text>
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
    padding: SPACING.lg,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.black,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  inputContainer: {
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  input: {
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: COLORS.border,
    fontSize: 16,
    fontFamily: FONTS.normal,
  },
  toggleButton: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  toggleText: {
    color: COLORS.background,
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  debug: {
    marginTop: SPACING.lg,
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: 8,
  },
});

export default AuthScreenTest;