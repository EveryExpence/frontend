import { View } from 'react-native'
import React from 'react'
import { Slot } from 'expo-router'
import './global.css'
import { AuthProvider } from '@/context/authContext'
import { ThemeProvider } from '@/context/themeContext'
import CustomizedToast from '@/components/Toast'
import { SQLiteProvider } from 'expo-sqlite';
import { migrateDatabase } from '@/data/init'
import 'react-native-get-random-values';
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { SyncProvider } from '@/context/syncContext'

const RootLayout = () => {
  return (
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
  )
}

export default RootLayout