import { View, Text, useColorScheme, TextInput } from 'react-native'
import React, { useState } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Colors } from '@/constants/theme';
import { Account } from '@/types/data/account';

interface Props {
    selectedAccount: Account | null;
}

const AmountInput = ({ selectedAccount }: Props) => {
    const scheme = useColorScheme() ?? 'light';
    const colors = Colors[scheme];
    const [amount, setAmount] = useState("");

    return (
        <View className="w-full mb-8">
            <Text className="text-2xl font-bold">Amount</Text>

            <View className="w-full flex flex-row items-center">
                <MaterialCommunityIcons
                    name="cash"
                    size={20}
                    color={colors.text}
                    className="absolute left-4 text-theme-icon z-50"
                />
                <TextInput
                    placeholder='Enter amount'
                    placeholderTextColor={colors.text}
                    value={amount}
                    onChangeText={setAmount}
                    className={`w-full py-4 pl-12 text-xl rounded-md bg-theme-surface text-theme-text
                        ${amount != "" && selectedAccount !== null ? 'pr-16' : 'pr-4'}`}
                />
                {
                    amount != "" && selectedAccount !== null ?
                        <Text className="absolute text-xl right-4">{selectedAccount.currency}</Text> : <></>
                }
            </View>
        </View>
    )
}

export default AmountInput