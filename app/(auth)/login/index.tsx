import { View, TextInput, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons';

const index = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState(false);

    return (
        <View className="flex-1 items-center justify-center gap-3">
            <View className="w-full px-8 justify-start">
                <Text className="text-2xl pl-2">Email</Text>

                <TextInput
                    placeholder='Enter email'
                    textContentType="emailAddress"
                    value={email}
                    onChangeText={setEmail}
                    className="px-4 py-2 text-xl border border-black rounded-md"
                />
            </View>

            <View className="w-full px-8 justify-start">
                <Text className="text-2xl pl-2">Password</Text>

                <View className="flex-row items-center gap-3">
                    <TextInput
                        secureTextEntry={!showPassword}
                        placeholder='Enter password'
                        textContentType="password"
                        value={password}
                        onChangeText={setPassword}
                        className="px-4 py-2 flex-1 text-xl border border-black rounded-md"
                    />

                    <MaterialCommunityIcons
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={24}
                        onPress={() => setShowPassword(prev => !prev)}
                        className="absolute right-4"
                    />
                </View>
            </View>

            <View className="w-full px-8 mt-4">
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => console.log('login...')}
                    className="w-full justify-start py-3 rounded-md"
                    style={{ backgroundColor: "#4370C7" }}
                >
                    <Text className="text-xl text-center text-white">Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default index