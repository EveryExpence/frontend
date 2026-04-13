import { View, Text } from 'react-native'
import React from 'react'
import { Slot } from 'expo-router'

const _layout = () => {
    return (
        <View className="flex-1">
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
                    right: 10,
                }}
            >
                <Text
                    className="text-6xl font-bold text-theme-textLight text-right"
                >EveryExpense</Text>
                
                <Text className="text-2xl text-right text-theme-textLight">Be aware of your expenses</Text>
            </View>

            <View className="size-full">
                <Slot />
            </View>
        </View>
    )
}

export default _layout