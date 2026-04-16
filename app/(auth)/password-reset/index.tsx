import { View, TextInput, Text, TouchableOpacity, useColorScheme } from 'react-native'
import React, { useState } from 'react'
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';

const PasswordResetScreen = () => {
    const router = useRouter();
    const [email, setEmail] = useState<string>('');
    const theme = useColorScheme() || 'light';
    const colors = Colors[theme];

    return (
        <View className="flex-1 justify-center gap-3">
            <View className="w-full px-8 justify-start">
                <Text className="text-2xl pl-2 text-theme-text">Email</Text>

                <TextInput
                    placeholder='Enter email'
                    placeholderTextColor={colors.text}
                    textContentType="emailAddress"
                    value={email}
                    onChangeText={setEmail}
                    className="p-4 text-xl border rounded-md border-theme-text text-theme-text"
                />
            </View>

            <View className="w-full px-8 mt-4">
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => console.log('reset password...')}
                    className="w-full justify-start p-4 rounded-md bg-theme-tint"
                >
                    <Text className="text-xl text-center text-theme-textLight">
                        Reset password
                    </Text>
                </TouchableOpacity>
            </View>

            <View className="relative h-0 w-full">
                <View className="absolute top-4 gap-2 w-full">
                    <Text
                        onPress={() => router.push("/login")}
                        className="text-lg text-center underline text-theme-text"
                    >Login</Text>
                </View>
            </View>
        </View>
    )
}

export default PasswordResetScreen