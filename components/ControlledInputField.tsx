import React, { useState } from "react";
import { Text, TextInput, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Control, Controller, FieldValues, Path, RegisterOptions } from "react-hook-form";
import { useThemeColor } from "@/hooks/use-theme-color";

type ControlledInputFieldProps<T extends FieldValues> = {
  label: string;
  name: Path<T>;
  control: Control<T>;
  rules?: RegisterOptions<T>;
  editable?: boolean;
  secureTextEntry?: boolean;
  showToggle?: boolean;
  placeholder?: string;
  placeholderTextColor?: string;
  inputClassName?: string;
};

const ControlledInputField = <T extends FieldValues>({
  label,
  name,
  control,
  rules,
  editable = true,
  secureTextEntry = false,
  showToggle = true,
  placeholder,
  placeholderTextColor,
  inputClassName,
}: ControlledInputFieldProps<T>) => {
  const iconColor = useThemeColor({}, "icon");
  const [isVisible, setIsVisible] = useState(false);
  const shouldShowToggle = secureTextEntry && showToggle;

  return (
    <Controller
      control={control}
      name={name}
      rules={rules}
      render={({ field, fieldState }) => (
        <View>
          <Text className="text-2xl mb-1 text-theme-icon">
            {label}
          </Text>

          <View className="flex-row items-center">
            <TextInput
              editable={editable}
              value={field.value ?? ""}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              secureTextEntry={secureTextEntry && !isVisible}
              placeholder={placeholder}
              placeholderTextColor={placeholderTextColor}
              className={
                inputClassName ||
                "w-full p-4 text-xl border border-theme-text rounded-md bg-theme-background text-theme-text"
              }
            />
            {shouldShowToggle && (
              <MaterialCommunityIcons
                name={isVisible ? "eye-off" : "eye"}
                size={24}
                color={iconColor}
                onPress={() => setIsVisible((prev) => !prev)}
                className="absolute right-4 text-theme-icon"
              />
            )}
          </View>

          {fieldState.error?.message && (
            <Text className="text-red-500 text-sm pl-2 mt-1">
              {fieldState.error.message}
            </Text>
          )}
        </View>
      )}
    />
  );
};

export default ControlledInputField;
