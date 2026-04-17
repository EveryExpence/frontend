import { View, TextInput, Text, TouchableOpacity, useColorScheme } from 'react-native';
import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { validateEmail } from '@/utils/auth/formValidation';

const PasswordResetScreen = () => {
    const router = useRouter();
    const theme = useColorScheme() || 'light';
    const colors = Colors[theme];

    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);

    const isFormValid = email !== '' && validateEmail(email) === null;

    const onSubmit = () => {
        console.log('reset password...');
    };

    return (
        <View className="flex-1 justify-center gap-3">
            <View className="w-full px-8 justify-start">
                <Text className="text-2xl pl-2 text-theme-text">Email</Text>

                <TextInput
                    placeholder='Enter email'
                    placeholderTextColor={colors.text}
                    textContentType="emailAddress"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={(text) => {
                        setEmail(text);
                        if (error) setError(null);
                    }}
                    onBlur={() => setError(validateEmail(email))}
                    className={`p-4 text-xl border rounded-md text-theme-text ${
                        error ? 'border-red-500' : 'border-theme-text'
                    }`}
                />
                {error && <Text className="text-red-500 text-sm pl-2 mt-1">{error}</Text>}
            </View>

            <View className="w-full px-8 mt-4">
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={onSubmit}
                    disabled={!isFormValid}
                    className={`w-full justify-start p-4 rounded-md bg-theme-tint ${
                        !isFormValid ? 'opacity-50' : 'opacity-100'
                    }`}
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
    );
}

export default PasswordResetScreen;