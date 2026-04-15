import { View } from 'react-native'
import React, { useEffect } from 'react'
import { Redirect, Slot, useRootNavigationState, useRouter, useSegments } from 'expo-router'
import './global.css'
import { AuthProvider, useAuth } from '@/context/authContext'

const RooLayout = () => {
    return (
        <View
            style={{
                flex: 1,
            }}
            className="bg-theme-background"
        >
            <AuthProvider>
                <Helper />
            </AuthProvider>
        </View>
    )
}

const Helper = () => {
    const { user } = useAuth();
    const segments = useSegments();
    const router = useRouter();
    const navigationState = useRootNavigationState();

    const inAuthGroup = segments[0] === '(auth)';

    useEffect(() => {
        if (!navigationState?.key) return;

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
    }, [user, inAuthGroup, navigationState])

    return <Slot />;
}

export default RooLayout
