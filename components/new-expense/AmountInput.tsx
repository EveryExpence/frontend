import { View, Text, useColorScheme, TextInput } from 'react-native'
import React, { Dispatch, SetStateAction } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Colors } from '@/constants/theme';
import { Account } from '@/types/data/account';

interface Props {
    selectedAccount: Account | null;
    amount: string;
    setAmount: Dispatch<SetStateAction<string>>;
    isValid: boolean;
}

const AmountInput = ({ selectedAccount, amount, setAmount, isValid }: Props) => {
    const scheme = useColorScheme() ?? 'light';
    const colors = Colors[scheme];

    return (
        <View className="w-full mb-8">
            <Text className="text-2xl text-theme-text font-bold">Amount</Text>

            <View className="w-full flex flex-row items-center">
                <MaterialCommunityIcons
                    name="cash"
                    size={20}
                    color={colors.text}
                    className="absolute left-3 text-theme-icon z-50"
                />
                <TextInput
                    placeholder='Enter amount'
                    placeholderClassName="text-theme-text opacity-35"
                    value={amount}
                    onChangeText={setAmount}
                    className={`px-16 w-full py-4 text-xl rounded-md bg-theme-surface text-theme-text
                        ${amount !== "" && selectedAccount !== null ? 'pr-16' : 'pr-4'}
                        ${isValid ? '' : "border border-red-500"}`}
                />
                {
                    amount !== "" && selectedAccount !== null ?
                        <Text className="absolute text-xl text-theme-text right-4">{selectedAccount.currency}</Text> : <></>
                }
            </View>

            <View className="relative h-0">
                <Text className="absolute text-red-500">{isValid ? "" : "Must be a valid number"}</Text>
            </View>
        </View>
    )
}

export default AmountInput