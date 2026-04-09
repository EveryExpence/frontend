import { View, Text, StyleSheet, TextInput, TextInputChangeEvent } from 'react-native'
import React, { useState } from 'react'

const index = () => {
    const styles = StyleSheet.create({
        container: {
            paddingHorizontal: 20,
        }
    });

    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    return (
        <View className="flex-1 items-center justify-center" style={styles.container}>
            <TextInput
                placeholder='Enter email'
                textContentType="emailAddress"
                value={email}
                onChangeText={setEmail}
            />

            <TextInput
                placeholder='Enter password'
                textContentType="password"
                value={password}
                onChangeText={setPassword}
            />
        </View>
    )
}

export default index