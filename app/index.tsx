import React from 'react'
import { useAuth } from '@/context/authContext';
import { TouchableOpacity, Text, View } from 'react-native';

const Main = () => {
  const { user, logout } = useAuth();

  const onPress = async () => {
    await logout();
  };

  return (
    <View className="flex flex-1 justify-center items-center">
      <Text className="2xl">
        { user?.email } { user?.publicUsername }
      </Text>

      <TouchableOpacity onPress={onPress}>
        <Text className="2xl">
          Logout
        </Text>
      </TouchableOpacity>
    </View>
  )
}

export default Main
