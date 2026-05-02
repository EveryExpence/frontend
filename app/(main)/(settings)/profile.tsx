import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useThemeColor } from "@/hooks/use-theme-color";

const ProfileScreen = () => {
  const iconColor = useThemeColor({}, "icon");

  const [isEditing, setIsEditing] = useState(false)

  const [form, setForm] = useState({
    firstName: "John",
    lastName: "Doe",
    email: "john@email.com"
  })

  const handleChange = (key: any, value: any) => {
      setForm((prev) => 
      ({
        ...prev,
        [key]: value,
      })
    );
  }

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
          {form.firstName} {form.lastName}
        </Text>

        <Text className="text-2xl text-theme-icon">
          {form.email}
        </Text>
      </View>

      <View
        className="p-5 rounded-md gap-4 bg-theme-surface"
      >
        <View>
          <Text className="text-2xl mb-1 text-theme-icon">
            {form.firstName}
          </Text>

          <TextInput
            editable={isEditing}
            value={form.firstName}
            className="p-4 text-xl border border-theme-text rounded-md bg-theme-background text-theme-text"
            onChangeText={(text) => handleChange("firstName", text)}
          />
        </View>

        <View>
          <Text className="text-2xl mb-1 text-theme-icon">
            {form.lastName}
          </Text>

          <TextInput
            editable={isEditing}
            value={form.lastName}
            className="p-4 text-xl border border-theme-text rounded-md bg-theme-background text-theme-text"
            onChangeText={(text) => handleChange("lastName", text)}
          />
        </View>

        <View>
          <Text className="text-2xl mb-1 text-theme-icon">
            {form.email}
          </Text>

          <TextInput
            editable={isEditing}
            value={form.email}
            className="p-4 text-xl border border-theme-text rounded-md bg-theme-background text-theme-text"
            onChangeText={(text) => handleChange("email", text)}
          />
        </View>
      </View>

      <TouchableOpacity
        className={`mt-6 p-4 rounded-md items-center ${isEditing ? 'bg-theme-tint' : 'bg-theme-tint' }`}
        onPress={() => setIsEditing((prev) => !prev)}
      >
        <Text 
        className="text-xl text-center text-theme-textLight font-semibold"
        >
          {isEditing ? "Save Changes" : "Edit Profile"}
          
        </Text>
      </TouchableOpacity>

    </View>
  );
};

export default ProfileScreen;