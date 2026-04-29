import { ActivityIndicator, View } from 'react-native'
import React, { useEffect } from 'react'
import { Slot, useRootNavigationState, useRouter, useSegments } from 'expo-router'
import './global.css'
import { AuthProvider, useAuth } from '@/context/authContext'
import CustomizedToast from '@/components/Toast'
import { SQLiteProvider } from 'expo-sqlite';
import { migrateDatabase } from '@/data/init'
import 'react-native-get-random-values';

const RooLayout = () => {
    return (
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
                    <Helper />
                </SQLiteProvider>
            </AuthProvider>
            <CustomizedToast />
        </View>
    )
}

const Helper = () => {
    const { user, isInitializing } = useAuth();
    const segments = useSegments();
    const router = useRouter();
    const navigationState = useRootNavigationState();
    const inAuthGroup = segments[0] === '(auth)';

    useEffect(() => {
        if (isInitializing) {
            return;
        }

        if (!navigationState?.key) {
            return;
        }

        if (user === null && !inAuthGroup) {
            setTimeout(() => {
                router.replace("/login");
            }, 0);
        }
    
        if (user !== null && inAuthGroup) {
            setTimeout(() => {
                router.replace("/");
            }, 0);
        }
    }, [user, inAuthGroup, navigationState,, isInitializing, router])

    if (isInitializing) {
        return (
            <View className="flex flex-1 justify-center items-center">
                <ActivityIndicator size={32} />
            </View>
        )
    }

    return <Slot />;
}

export default RooLayout
