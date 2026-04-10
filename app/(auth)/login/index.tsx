import { View, TextInput, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const LoginScreen = () => {
    const router = useRouter();
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

            <View className="relative h-0 w-full">
                <View className="absolute top-4 gap-2 w-full">
                    <Text
                        onPress={() => router.push("/sign-up")}
                        className="text-lg text-center underline"
                    >Sign up</Text>
                    <Text
                        onPress={() => router.push("/password-reset")}
                        className="text-lg text-center underline"
                    >Forgot password?</Text>
                </View>
            </View>
        </View>
    )
}

export default LoginScreen