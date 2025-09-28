import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/Button';
import Input from '../components/Input';

type VerifyCodeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'VerifyCode'>;

const VerifyCodeScreen: React.FC = () => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigation = useNavigation<VerifyCodeScreenNavigationProp>();
  const { verifyCode } = useAuth();

  const handleVerify = async () => {
    if (!code.trim()) {
      setError('Doğrulama kodu gerekli');
      return;
    }

    setLoading(true);
    try {
      await verifyCode(code);
      
      // Doğrulama başarılı - kullanıcı otomatik giriş yaptı
      Alert.alert(
        'Başarılı!',
        'E-posta adresiniz doğrulandı. Dashboard\'a yönlendiriliyorsunuz.',
        [
          {
            text: 'Tamam',
            onPress: () => {
              // AuthContext otomatik olarak Dashboard'a yönlendirecek
            },
          },
        ]
      );
    } catch (error: any) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    Alert.alert(
      'Kod Gönderildi',
      'Yeni doğrulama kodu e-posta adresinize gönderildi.',
      [{ text: 'Tamam' }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>📧</Text>
          </View>
          
          <Text style={styles.title}>E-posta Doğrulama</Text>
          <Text style={styles.subtitle}>
            E-posta adresinize gönderilen 6 haneli doğrulama kodunu girin
          </Text>

          <View style={styles.form}>
            <Input
              label="Doğrulama Kodu"
              placeholder="6 haneli kod"
              value={code}
              onChangeText={(value) => {
                setCode(value);
                setError('');
              }}
              keyboardType="number-pad"
              maxLength={6}
              error={error}
              style={styles.codeInput}
            />

            <Button
              title="Doğrula"
              onPress={handleVerify}
              loading={loading}
              style={styles.verifyButton}
            />

            <Button
              title="Kodu Tekrar Gönder"
              onPress={handleResend}
              variant="outline"
              style={styles.resendButton}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  content: {
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  codeInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8,
    fontWeight: '600',
  },
  verifyButton: {
    marginTop: 16,
  },
  resendButton: {
    marginTop: 12,
  },
});

export default VerifyCodeScreen;
