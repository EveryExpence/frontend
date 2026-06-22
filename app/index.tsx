import { ActivityIndicator } from 'react-native'
import React, { useEffect } from 'react'
import { useRouter } from 'expo-router';
import EncryptedStorage from 'react-native-encrypted-storage';

const Index = () => {
  const router = useRouter();

  useEffect(() => {
    const checkFlag = async () => {
      try {
        const isLoggedIn = await EncryptedStorage.getItem("loggedIn");
        if (isLoggedIn !== null) {
          router.replace("/dashboard");
        } else {
          router.replace("/login");
        }
      } catch (e) {
        console.error("Storage error:", e);
        router.replace("/login");
      }
    }

    checkFlag();
  }, [router])
  
  return (
    <ActivityIndicator />
  )
}

export default Index