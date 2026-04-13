import { View } from 'react-native'
import React from 'react'
import { Slot } from 'expo-router'
import './global.css'

const _layout = () => {
    return (
        <View
            style={{
                flex: 1,
            }}
            className="bg-theme-background"
        >
            <Slot />
        </View>
    )
}

export default _layout