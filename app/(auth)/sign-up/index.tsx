import { View, TextInput, Text, TouchableOpacity, useColorScheme, ActivityIndicator } from 'react-native'
import React, { useState } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/authContext';
import { Snackbar } from 'react-native-snackbar';

const SignUpScreen = () => {
    const router = useRouter();
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [showPassword, setShowPassword] = useState(false);
    const [passwordConfirmation, setPasswordConfirmation] = useState<string>('');
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const theme = useColorScheme() || 'light';
    const colors = Colors[theme];

    const { isLoading, register } = useAuth();

    const onPress = async () => {
        if (password !== passwordConfirmation) {
            console.warn('Passwords are not the same');
            return;
        }

        try {
            await register(email, password);
            router.replace('/login');
        } catch (error) {
            Snackbar.show({
                text: `${error}`,
                duration: Snackbar.LENGTH_LONG,
            });
        }
    }

    if (isLoading) {
        return (
            <View className="flex flex-1 justify-center items-center">
                <ActivityIndicator size={32} />
            </View>
        )
    }

    return (
        <View className="flex-1 justify-center gap-3">
            <View className="w-full px-8 justify-start">
                <Text className="text-2xl pl-2 text-theme-text">Email</Text>

                <TextInput
                    placeholder='Enter email'
                    textContentType="emailAddress"
                    value={email}
                    onChangeText={setEmail}
                    className="p-4 text-xl border rounded-md border-theme-text placeholder:text-theme-text"
                />
            </View>

            <View className="w-full px-8 justify-start">
                <Text className="text-2xl pl-2 text-theme-text">Password</Text>

                <View className="flex-row items-center gap-3">
                    <TextInput
                        secureTextEntry={!showPassword}
                        placeholder='Enter password'
                        textContentType="password"
                        value={password}
                        onChangeText={setPassword}
                        className="p-4 flex-1 text-xl border rounded-md border-theme-text placeholder:text-theme-text"
                    />

                    <MaterialCommunityIcons
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={24}
                        color={colors.text}
                        onPress={() => setShowPassword(prev => !prev)}
                        className="absolute right-4 text-theme-icon"
                    />
                </View>
            </View>

            <View className="w-full px-8 justify-start">
                <Text className="text-2xl pl-2 text-theme-text">Password</Text>

                <View className="flex-row items-center gap-3">
                    <TextInput
                        secureTextEntry={!showPassword}
                        placeholder='Confirm password'
                        textContentType="password"
                        value={passwordConfirmation}
                        onChangeText={setPasswordConfirmation}
                        className="p-4 flex-1 text-xl border rounded-md border-theme-text placeholder:text-theme-text"
                    />

                    <MaterialCommunityIcons
                        name={showPasswordConfirmation ? 'eye-off' : 'eye'}
                        size={24}
                        color={colors.text}
                        onPress={() => setShowPasswordConfirmation(prev => !prev)}
                        className="absolute right-4 text-theme-icon"
                    />
                </View>
            </View>

            <View className="w-full px-8 mt-4">
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={onPress}
                    className="w-full justify-start p-4 rounded-md bg-theme-tint"
                >
                    <Text className="text-xl text-center text-theme-textLight">
                        Sign up
                    </Text>
                </TouchableOpacity>
            </View>

            <View className="relative h-0 w-full">
                <View className="absolute top-4 gap-2 w-full">
                    <Text
                        onPress={() => router.replace("/login")}
                        className="text-lg text-center underline text-theme-text"
                    >Already have an account?</Text>
                </View>
            </View>
        </View>
    )
}

export default SignUpScreen