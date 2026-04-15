import React from 'react'
import { useAuth } from '@/context/authContext';
import { Text } from 'react-native';

const Main = () => {
  const { user } = useAuth();

  return <Text>{ user?.email }</Text>;
}

export default Main
