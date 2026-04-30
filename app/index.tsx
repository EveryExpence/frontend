import { ActivityIndicator } from 'react-native'
import React, { useEffect } from 'react'
import { useRouter } from 'expo-router';
import EncryptedStorage from 'react-native-encrypted-storage';

const index = () => {
  const router = useRouter();

  useEffect(() => {
    const checkFlag = async () => {
      const isLoggedIn = await EncryptedStorage.getItem("loggedIn");
      if (isLoggedIn !== null) {
        router.replace("/dashboard");
      } else {
        router.replace("/login");
      }
    }

    checkFlag();
  }, [])
  
  return (
    <ActivityIndicator />
  )
}

export default index