import React from "react";
import { useAuth } from "@/context/authContext";
import { TouchableOpacity, Text, View } from "react-native";
import Toast from "react-native-toast-message";

const Main = () => {
  const { user, logout } = useAuth();

  const onPress = async () => {
    try {
      await logout();
    } catch (error) {
      Toast.show({ text1: `${error}`, type: "error" });
    }
  };

  return (
    <View className="flex flex-1 justify-center items-center">
      <Text className="2xl">
        {user?.email} {user?.publicUsername}
      </Text>

      <TouchableOpacity onPress={onPress}>
        <Text className="2xl">Logout</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Main;
