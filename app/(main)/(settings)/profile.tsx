import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useThemeColor } from "@/hooks/use-theme-color";

const ProfileScreen = () => {
  const iconColor = useThemeColor({}, "icon");

  return (
    <View
      className="px-6 pt-10 bg-theme-background"
    >
      <View className="items-center mb-8">
        <View
          className="items-center justify-center rounded-full bg-theme-surface"
          style={{ width: 100, height: 100 }}
        >
          <Ionicons name="person" size={70} color={iconColor} />
        </View>

        <Text className="mt-4 text-3xl font-semibold text-theme-text">
          John Doe
        </Text>

        <Text className="text-2xl text-theme-icon">
          john@email.com
        </Text>
      </View>

      <View
        className="p-5 rounded-md gap-4 bg-theme-surface"
      >
        <View>
          <Text className="text-2xl mb-1 text-theme-icon">
            First Name
          </Text>

          <TextInput
            editable={false}
            value="John"
            className="p-4 text-xl border border-theme-surface rounded-md bg-theme-background text-theme-text"
          />
        </View>

        <View>
          <Text className="text-2xl mb-1 text-theme-icon">
            Last Name
          </Text>

          <TextInput
            editable={false}
            value="Doe"
            className="p-4 text-xl border border-theme-surface rounded-md bg-theme-background text-theme-text"
          />
        </View>

        <View>
          <Text className="text-2xl mb-1 text-theme-icon">
            Email
          </Text>

          <TextInput
            editable={false}
            value="john@email.com"
            className="p-4 text-xl border border-theme-surface rounded-md bg-theme-background text-theme-text"
          />
        </View>
      </View>

      <TouchableOpacity
        className="mt-6 p-4 rounded-md items-center bg-theme-tint"
      >
        <Text className="text-xl text-center text-theme-textLight font-semibold">
          Edit Profile
        </Text>
      </TouchableOpacity>

    </View>
  );
};

export default ProfileScreen;