import { View, TextInput, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import React, { useState } from 'react';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import { useAuth } from '@/context/authContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import * as z from 'zod'
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Toast from 'react-native-toast-message';

export const formSchema = z.object({
  email: z.email("Must be a valid email"),
  password: z
    .string()
    .nonempty("Password is required")
    .min(8, "Must be at least 8 character long")
    .max(64, "Must be shorter than 64 characters")
    .regex(/[a-z]/, "Must include at least 1 lowercase character")
    .regex(/[A-Z]/, "Must include at least 1 uppercase character")
    .regex(/[0-9]/, "Must include at least 1 digit")
    .regex(/[^a-zA-Z0-9]/, "Must include at least 1 special character"),
  passwordConfirmation: z.string(),
}).superRefine(({ password, passwordConfirmation }, ctx) => {
  if (password !== passwordConfirmation) {
    ctx.addIssue({
      code: "custom",
      message: "Passwords do not match",
      path: ["passwordConfirmation"],
    })
  }
});

type FormSchema = z.infer<typeof formSchema>;

const SignUpScreen = () => {
    const router = useRouter();
    const theme = useColorScheme() || 'light';
    const colors = Colors[theme];
    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const { isLoading, register } = useAuth();
    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            email: "",
            password: "",
            passwordConfirmation: "",
        },
    })

    const onSubmit = async ({ email, password, passwordConfirmation }: FormSchema) => {
        if (password !== passwordConfirmation) {
            return;
        }

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
                <Controller
                    control={form.control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                        <TextInput
                            placeholder='Enter email'
                            placeholderTextColor={colors.text}
                            textContentType="emailAddress"
                            autoCapitalize="none"
                            value={value}
                            onChangeText={onChange}
                            onBlur={onBlur}
                            className={`p-4 text-xl border rounded-md text-theme-text ${
                                form.formState.errors.email ? 'border-red-500' : 'border-theme-text'
                            }`}
                        />
                    )}
                />
                {form.formState.errors.email && (
                    <Text className="text-red-500 text-sm pl-2 mt-1">
                        {form.formState.errors.email.message}
                    </Text>
                )}
            </View>

            <View className="w-full px-8 justify-start">
                <Text className="text-2xl pl-2 text-theme-text">Password</Text>

                <View className="flex-row items-center gap-3">
                    <Controller
                        control={form.control}
                        name="password"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                secureTextEntry={!showPassword}
                                placeholder='Enter password'
                                placeholderTextColor={colors.text}
                                textContentType="password"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                className={`w-full p-4 text-xl border rounded-md text-theme-text ${
                                    form.formState.errors.password ? 'border-red-500' : 'border-theme-text'
                                }`}
                            />
                        )}
                    />
                    <MaterialCommunityIcons
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={24}
                        color={colors.text}
                        onPress={() => setShowPassword(prev => !prev)}
                        className="absolute right-4 text-theme-icon"
                    />
                </View>
                {form.formState.errors.password && (
                    <Text className="text-red-500 text-sm pl-2 mt-1">
                        {form.formState.errors.password.message}
                    </Text>
                )}
            </View>

            <View className="w-full px-8 justify-start">
                <Text className="text-2xl pl-2 text-theme-text">Password</Text>

                <View className="flex-row items-center gap-3">
                    <Controller
                        control={form.control}
                        name="passwordConfirmation"
                        render={({ field: { onChange, onBlur, value } }) => (
                            <TextInput
                                secureTextEntry={!showPasswordConfirmation}
                                placeholder='Enter password again'
                                placeholderTextColor={colors.text}
                                textContentType="password"
                                value={value}
                                onChangeText={onChange}
                                onBlur={onBlur}
                                className={`w-full p-4 text-xl border rounded-md text-theme-text ${
                                    form.formState.errors.password ? 'border-red-500' : 'border-theme-text'
                                }`}
                            />
                        )}
                    />
                    <MaterialCommunityIcons
                        name={showPasswordConfirmation ? 'eye-off' : 'eye'}
                        size={24}
                        color={colors.text}
                        onPress={() => setShowPasswordConfirmation(prev => !prev)}
                        className="absolute right-4 text-theme-icon"
                    />
                </View>
                {form.formState.errors.passwordConfirmation && (
                    <Text className="text-red-500 text-sm pl-2 mt-1">
                        {form.formState.errors.passwordConfirmation.message}
                    </Text>
                )}
            </View>

            <View className="w-full px-8 mt-4">
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={form.handleSubmit(onSubmit)}
                    disabled={!form.formState.isValid}
                    className={`w-full justify-start p-4 rounded-md bg-theme-tint ${
                        !form.formState.isValid ? 'opacity-50' : 'opacity-100'
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