import { View, TextInput, Text, TouchableOpacity, useColorScheme, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/authContext';
import { validateEmail, validatePassword, validatePasswordMatch } from '@/utils/auth/formValidation';
import Toast from 'react-native-toast-message';

const SignUpScreen = () => {
    const router = useRouter();
    const theme = useColorScheme() || 'light';
    const colors = Colors[theme];
    const { isLoading, register } = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    
    const [errors, setErrors] = useState<{
        email: string | null;
        password: string | null;
        confirm: string | null;
    }>({ 
        email: null, 
        password: null, 
        confirm: null 
    });

    const isFormValid = 
        email !== '' && password !== '' && passwordConfirmation !== '' &&
        validateEmail(email) === null &&
        validatePassword(password) === null &&
        validatePasswordMatch(password, passwordConfirmation) === null;

    const onSubmit = async () => {
        try {
            await register(email, password);
            Toast.show({ text1: "Signed up successfully" });
            router.replace('/login');
        } catch (error) {
            let msg = error;
            if (error === 'Duplicate data') {
                msg = 'Email already in use';
            };
            Toast.show({ text1: `Failed to sign up: ${msg}`, type: "error" });
        }
    };

    if (isLoading) {
        return (
            <View className="flex flex-1 justify-center items-center">
                <ActivityIndicator size={32} />
            </View>
        );
    }

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
                        if (errors.email) setErrors(prev => ({ ...prev, email: null }));
                    }}
                    onBlur={() => setErrors(prev => ({ ...prev, email: validateEmail(email) }))}
                    className={`p-4 text-xl border rounded-md text-theme-text ${
                        errors.email ? 'border-red-500' : 'border-theme-text'
                    }`}
                />
                {errors.email && <Text className="text-red-500 text-sm pl-2 mt-1">{errors.email}</Text>}
            </View>

            <View className="w-full px-8 justify-start">
                <Text className="text-2xl pl-2 text-theme-text">Password</Text>
                <View className="flex-row items-center gap-3">
                    <TextInput
                        secureTextEntry={!showPassword}
                        placeholderTextColor={colors.text}
                        placeholder='Enter password'
                        textContentType="password"
                        value={password}
                        onChangeText={(text) => {
                            setPassword(text);
                            if (errors.password) setErrors(prev => ({ ...prev, password: null }));
                        }}
                        onBlur={() => setErrors(prev => ({ 
                            ...prev, 
                            password: validatePassword(password),
                            ...(passwordConfirmation ? { confirm: validatePasswordMatch(password, passwordConfirmation) } : {})
                        }))}
                        className={`p-4 flex-1 text-xl border rounded-md text-theme-text ${
                            errors.password ? 'border-red-500' : 'border-theme-text'
                        }`}
                    />
                    <MaterialCommunityIcons
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={24}
                        color={colors.text}
                        onPress={() => setShowPassword(prev => !prev)}
                        className="absolute right-4 text-theme-icon"
                    />
                </View>
                {errors.password && <Text className="text-red-500 text-sm pl-2 mt-1">{errors.password}</Text>}
            </View>

            <View className="w-full px-8 justify-start">
                <Text className="text-2xl pl-2 text-theme-text">Confirm Password</Text>
                <View className="flex-row items-center gap-3">
                    <TextInput
                        secureTextEntry={!showPasswordConfirmation}
                        placeholder='Confirm password'
                        placeholderTextColor={colors.text}
                        textContentType="password"
                        value={passwordConfirmation}
                        onChangeText={(text) => {
                            setPasswordConfirmation(text);
                            if (errors.confirm) setErrors(prev => ({ ...prev, confirm: null }));
                        }}
                        onBlur={() => setErrors(prev => ({ ...prev, confirm: validatePasswordMatch(password, passwordConfirmation) }))}
                        className={`p-4 flex-1 text-xl border rounded-md text-theme-text ${
                            errors.confirm ? 'border-red-500' : 'border-theme-text'
                        }`}
                    />
                    <MaterialCommunityIcons
                        name={showPasswordConfirmation ? 'eye-off' : 'eye'}
                        size={24}
                        color={colors.text}
                        onPress={() => setShowPasswordConfirmation(prev => !prev)}
                        className="absolute right-4 text-theme-icon"
                    />
                </View>
                {errors.confirm && <Text className="text-red-500 text-sm pl-2 mt-1">{errors.confirm}</Text>}
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
    );
}

export default SignUpScreen;