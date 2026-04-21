import { View, TextInput, Text, TouchableOpacity, useColorScheme } from 'react-native';
import React from 'react';
import { useRouter } from 'expo-router';
import { Colors } from '@/constants/theme';
import * as z from 'zod'
import { Controller, useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

const formSchema = z.object({
    email: z.email("Must be a valid email")
});

type FormSchema = z.infer<typeof formSchema>;

const PasswordResetScreen = () => {
    const router = useRouter();
    const theme = useColorScheme() || 'light';
    const colors = Colors[theme];
    const form = useForm<FormSchema>({
        resolver: zodResolver(formSchema),
        mode: "onChange",
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = () => {
        console.log('reset password...');
    };

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

            <View className="w-full px-8 mt-4">
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={onSubmit}
                    disabled={!form.formState.isValid}
                    className={`w-full justify-start p-4 rounded-md bg-theme-tint ${
                        !form.formState.isValid ? 'opacity-50' : 'opacity-100'
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