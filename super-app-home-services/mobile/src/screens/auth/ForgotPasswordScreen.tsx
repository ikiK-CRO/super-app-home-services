import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView, Dimensions } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../navigation';
import { useI18n } from '../../i18n';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

const { height } = Dimensions.get('window');

const ForgotPasswordScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useI18n();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = async () => {
    if (!email) {
      setError('Please enter your email');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1500);
  };
  
  if (sent) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>{t('reset_password')}</Text>
        <Text style={styles.message}>
          We have sent password reset instructions to your email.
        </Text>
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('Login')}
          style={styles.button}
        >
          {t('back')} {t('login')}
        </Button>
      </View>
    );
  }
  
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Text style={styles.title}>{t('forgot_password')}</Text>
      
      <Text style={styles.description}>
        Enter your email address and we'll send you instructions to reset your password.
      </Text>
      
      {error && <Text style={styles.error}>{error}</Text>}
      
      <TextInput
        label={t('email')}
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        mode="outlined"
      />
      
      <Button 
        mode="contained" 
        onPress={handleSubmit}
        style={styles.button}
        loading={loading}
        disabled={loading}
      >
        {t('reset_password')}
      </Button>
      
      <Button 
        mode="text" 
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        {t('back')}
      </Button>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
    marginTop: Platform.OS === 'ios' ? height * 0.03 : height * 0.02,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#757575',
  },
  input: {
    marginBottom: 24,
  },
  button: {
    padding: 5,
    borderRadius: 5,
    height: 50,
    justifyContent: 'center',
    marginVertical: 20,
  },
  buttonContent: {
    height: 50,
  },
  backButton: {
    marginTop: 16,
  },
  error: {
    color: 'red',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    color: '#4CAF50',
  },
});

export default ForgotPasswordScreen; 