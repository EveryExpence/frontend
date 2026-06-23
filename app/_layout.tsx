import { View } from 'react-native'
import React from 'react'
import { Slot } from 'expo-router'
import './global.css'
import '@/locales/i18n'
import { AuthProvider } from '@/context/authContext'
import { ThemeProvider } from '@/context/themeContext'
import CustomizedToast from '@/components/Toast'
import { SQLiteProvider } from 'expo-sqlite';
import { migrateDatabase } from '@/data/init'
import 'react-native-get-random-values';
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { SyncProvider } from '@/context/syncContext'
import * as Notifications from 'expo-notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

const RootLayout = () => {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <View
          style={{
            flex: 1,
          }}
          className="bg-theme-background"
        >
          <ThemeProvider>
            <AuthProvider>
                <SQLiteProvider
                  databaseName="app.db"
                  onInit={migrateDatabase}
                >
                  <SyncProvider>
                    <Slot />
                  </SyncProvider>
                </SQLiteProvider>
            </AuthProvider>
          </ThemeProvider>
          <CustomizedToast />
        </View>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}

export default RootLayout