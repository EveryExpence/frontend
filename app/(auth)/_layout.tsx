import { View, Text } from 'react-native'
import React from 'react'
import { Slot } from 'expo-router'

const _layout = () => {
  return (
    <View className="flex-1">
        <View
            className="absolute rounded-full"
            style={{
                backgroundColor: "#4370C7",
                width: 600,
                height: 600,
                top: -350,
                left: -20,
            }}
        />

        <View
            className="absolute gap-5"
            style={{
                top: 50,
                right: 10,
            }}
        >
            <Text className="text-6xl font-bold text-white text-right">EveryExpense</Text>
            <Text className="text-2xl text-white text-right">Be aware of your expenses</Text>
        </View>

        <Slot />
    </View>
  )
}

export default _layout