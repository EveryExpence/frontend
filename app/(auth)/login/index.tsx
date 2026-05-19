import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  useColorScheme,
  ActivityIndicator,
} from "react-native";
import React from "react";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/theme";
import { useAuth } from "@/context/authContext";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Toast from "react-native-toast-message";
import EncryptedStorage from "react-native-encrypted-storage";
import ControlledInputField from "@/components/ControlledInputField";

const formSchema = z.object({
  email: z.email("Must be a valid email"),
  password: z.string().nonempty("Password is required"),
});

type FormSchema = z.infer<typeof formSchema>;

const LoginScreen = () => {
  const router = useRouter();
  const theme = useColorScheme() || "light";
  const colors = Colors[theme];
  const form = useForm<FormSchema>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { isLoading, login } = useAuth();

  const onSubmit = async ({ email, password }: FormSchema) => {
    try {
      await login(email, password);
      router.replace("/dashboard");
      setTimeout(() => {
        Toast.show({ text1: "Logged in successfully" });
      }, 100);
      await EncryptedStorage.setItem("loggedIn", "true");
    } catch (error) {
      Toast.show({ text1: `Login failed: ${error}`, type: "error" });
    }
  };

  const handleSkip = async () => {
    await EncryptedStorage.setItem("loggedIn", "true");
    router.replace("/dashboard");
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
              placeholder="Enter email"
              placeholderTextColor={colors.text}
              textContentType="emailAddress"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              className={`p-4 text-xl border rounded-md text-theme-text ${
                form.formState.errors.email
                  ? "border-red-500"
                  : "border-theme-text"
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
        <ControlledInputField
          label="Password"
          name="password"
          control={form.control}
          secureTextEntry
          placeholder="Enter password"
          placeholderTextColor={colors.text}
          inputClassName={`w-full p-4 text-xl border rounded-md text-theme-text ${
            form.formState.errors.password
              ? "border-red-500"
              : "border-theme-text"
          }`}
        />
      </View>

      <View className="w-full px-8 mt-4">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={form.handleSubmit(onSubmit)}
          disabled={!form.formState.isValid}
          className={`w-full justify-start p-4 rounded-md bg-theme-tint ${
            !form.formState.isValid ? "opacity-50" : "opacity-100"
          }`}
        >
          <Text className="text-xl text-center text-theme-textLight">
            Login
          </Text>
        </TouchableOpacity>
      </View>

      <View className="w-full px-8 mt-4">
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleSkip}
          className="w-full justify-start p-4 rounded-md bg-theme-surface"
        >
          <Text className="text-xl text-center text-theme-text">
            Continue without login
          </Text>
        </TouchableOpacity>
      </View>

      <View className="relative h-0 w-full">
        <View className="absolute top-4 gap-2 w-full">
          <Text
            onPress={() => router.push("/sign-up")}
            className="text-lg text-center underline text-theme-text"
          >
            Sign up
          </Text>
          <Text
            onPress={() => router.push("/password-reset")}
            className="text-lg text-center underline text-theme-text"
          >
            Forgot password?
          </Text>
        </View>
      </View>
    </View>
  );
};

export default LoginScreen;
