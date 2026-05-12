import { Colors } from '@/constants/theme';
import { useSegments } from 'expo-router';
import React from 'react'
import { useColorScheme } from '@/hooks/use-color-scheme';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';

function CustomizedToast() {
  const theme = useColorScheme() ?? 'light';
  const colors = Colors[theme];
  const segments = useSegments();
  const inAuthGroup = segments[0] === '(auth)';

  const toastConfig = {
    success: (props: any) => (
      <BaseToast
        {...props}
        style={{ borderLeftColor: colors.success, backgroundColor: colors.surface }}
        text1Style={{ color: colors.text, fontSize: 14 }}
        text2Style={{ color: colors.icon }}
      />
    ),
    error: (props: any) => (
      <ErrorToast
        {...props}
        style={{ borderLeftColor: colors.error, backgroundColor: colors.surface }}
        text1Style={{ color: colors.text, fontSize: 14 }}
        text2Style={{ color: colors.icon }}
      />
    ),
  };

  return (
    <Toast config={toastConfig} bottomOffset={inAuthGroup ? 40 : 120} position="bottom" />
  )
}

export default CustomizedToast
