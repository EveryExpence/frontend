import { View, TextInput, Text, Button, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'

const index = () => {
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');

    return (
        <View className="flex-1 items-center justify-center gap-3">
            <View className="w-full px-8 justify-start">
                <Text className="text-2xl pl-2">Email</Text>

                <TextInput
                    placeholder='Enter email'
                    textContentType="emailAddress"
                    value={email}
                    onChangeText={setEmail}
                    className="px-4 py-2 text-xl border border-black rounded-md"
                />
            </View>

            <View className="w-full px-8 justify-start">
                <Text className="text-2xl pl-2">Password</Text>

                <TextInput
                    placeholder='Enter password'
                    textContentType="password"
                    value={password}
                    onChangeText={setPassword}
                    className="px-4 py-2 text-xl border border-black rounded-md"
                />
            </View>

            <View className="w-full px-8 mt-4">
                <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => console.log('login...')}
                    className="w-full justify-start py-3 rounded-md"
                    style={{ backgroundColor: "#4370C7" }}
                >
                    <Text className="text-xl text-center text-white">Login</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default index