import { View, Text, useColorScheme } from 'react-native'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Account } from '@/types/data/account'
import { useSQLiteContext } from 'expo-sqlite';
import { getAllAccounts } from '@/data/accounts';
import { Dropdown } from 'react-native-element-dropdown';
import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
    selectedAccount: Account | null;
    setSelectedAccount: Dispatch<SetStateAction<Account | null>>
}

const AccountSelection = ({ selectedAccount, setSelectedAccount }: Props) => {
    const scheme = useColorScheme() ?? 'light';
    const colors = Colors[scheme];
    const db = useSQLiteContext();
    const [accounts, setAccounts] = useState<Account[]>([]);

    useEffect(() => {
        (async () => {
            setAccounts(await getAllAccounts(db));
        })();
    }, [db]);

    return (
        <View className="mb-8">
            <Text className="text-2xl font-bold">Account</Text>

            <Dropdown
                style={{
                    backgroundColor: colors.surface,
                    padding: 12,
                    borderRadius: 6,
                }}
                selectedTextStyle={{
                    fontSize: 18,
                }}
                placeholderStyle={{
                    fontSize: 18,
                }}
                inputSearchStyle={{
                    fontSize: 18,
                }}
                data={accounts}
                search
                maxHeight={300}
                labelField="name"
                valueField="id"
                placeholder="Select account"
                searchPlaceholder="Search account..."
                value={selectedAccount ?? undefined}
                onChange={item => setSelectedAccount(item)}
                renderLeftIcon={() => (
                    <MaterialCommunityIcons
                        className="mr-6"
                        name="bank"
                        size={20}
                    />
                )}
                renderRightIcon={() => (
                    <MaterialCommunityIcons
                        name="chevron-down"
                        size={20}
                    />
                )}
            />
        </View>
    )
}

export default AccountSelection