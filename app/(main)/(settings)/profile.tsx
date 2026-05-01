import { View, Text, TextInput, useColorScheme, TouchableOpacity } from 'react-native'
import { Colors } from "@/constants/theme";
import { Ionicons } from '@expo/vector-icons';
import React from 'react'

const ProfileScreen = () => {
  const theme = useColorScheme() || "light";
  const colors = Colors[theme];

  return (
    <View
      className="px-6"
      style={{ backgroundColor: colors.background, paddingTop: 40 }}
    >
      <View className="items-center mb-8">
        <View
          className="items-center justify-center rounded-full"
          style={{
            width: 100,
            height: 100,
            backgroundColor: colors.surface,
          }}
        >
          <Ionicons name="person" size={70} color={colors.icon} />
        </View>

        <Text
          className="mt-4 text-3xl font-semibold"
          style={{ color: colors.text }}
        >
          John Doe
        </Text>

        <Text
          className="text-2xl"
          style={{ color: colors.icon }}
        >
          john@email.com
        </Text>
      </View>

      <View
        className="p-5 rounded-md gap-4"
        style={{ backgroundColor: colors.surface }}
      >
        <View>
          <Text
            className="text-2xl mb-1"
            style={{ color: colors.icon }}
          >
            First Name
          </Text>

          <TextInput
            editable={false}
            value="John"
            className="p-4 text-xl border rounded-md text-theme-text"
            style={{
              backgroundColor: colors.background,
              color: colors.text,
            }}
          />
        </View>

        <View>
          <Text
            className="text-2xl mb-1"
            style={{ color: colors.icon }}
          >
            Last Name
          </Text>

          <TextInput
            editable={false}
            value="Doe"
            className="p-4 text-xl border rounded-md text-theme-text"
            style={{
              backgroundColor: colors.background,
              color: colors.text,
            }}
          />
        </View>

        <View>
          <Text
            className="text-2xl mb-1"
            style={{ color: colors.icon }}
          >
            Email
          </Text>

          <TextInput
            editable={false}
            value="john@email.com"
            className="p-4 text-xl border rounded-md text-theme-text"
            style={{
              backgroundColor: colors.background,
              color: colors.text,
            }}
          />
        </View>
      </View>

      <TouchableOpacity
        className="mt-6 p-4 rounded-md items-center"
        style={{ backgroundColor: colors.tint }}
      >
        <Text className="text-xl text-center text-theme-textLight font-semibold">
          Edit Profile
        </Text>
      </TouchableOpacity>

    </View>
  );
};

export default ProfileScreen;