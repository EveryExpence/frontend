import { View } from 'react-native'
import React from 'react'
import { Slot } from 'expo-router'
import './global.css'
import { AuthProvider } from '@/context/authContext'
import CustomizedToast from '@/components/Toast'
import { SQLiteProvider } from 'expo-sqlite';
import { migrateDatabase } from '@/data/init'
import 'react-native-get-random-values';
import { SafeAreaProvider } from 'react-native-safe-area-context'

const RootLayout = () => {
  return (
    <SafeAreaProvider>
      <View
        style={{
          flex: 1,
        }}
        className="bg-theme-background"
      >
        <AuthProvider>
          <SQLiteProvider 
            databaseName="app.db"
            onInit={migrateDatabase}
          >
              <Slot />
          </SQLiteProvider>
        </AuthProvider>
        <CustomizedToast />
      </View>
    </SafeAreaProvider>
  )
}

export default RootLayout