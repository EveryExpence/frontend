import { View, Text } from 'react-native'
import React from 'react'
import { Slot } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useTranslation } from 'react-i18next'

const AuthLayout = () => {
    const { t } = useTranslation();
    return (
        <SafeAreaView className="flex-1">
            <View
                className="absolute rounded-full bg-theme-tint"
                style={{
                    width: 600,
                    height: 600,
                    top: -375,
                    left: -50,
                }}
            />

            <View
                className="absolute gap-5"
                style={{
                    top: 50,
                    right: 20,
                }}
            >
                <Text
                    className="text-6xl font-bold text-theme-textLight text-right leading-tight"
                >EveryExpense</Text>
                
                <Text className="text-2xl text-right text-theme-textLight leading-tight">
                    {t("auth.subtitle")}
                </Text>
            </View>

            <View
                className="flex-1" 
                style={{ marginTop: 150 }}
            >
                <Slot />
            </View>
        </SafeAreaView>
    )
}

export default AuthLayout