import { View, Text } from 'react-native'
import React, { Dispatch, SetStateAction, useCallback, useState } from 'react'
import { Account } from '@/types/data/account'
import { useSQLiteContext } from 'expo-sqlite';
import { getAllAccounts } from '@/data/accounts';
import { Dropdown } from 'react-native-element-dropdown';
import { Colors } from '@/constants/theme';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Props {
    selectedAccount: Account | null;
    setSelectedAccount: Dispatch<SetStateAction<Account | null>>;
    disabled?: boolean;
}

const AccountSelection = ({ selectedAccount, setSelectedAccount, disabled }: Props) => {
    const scheme = useColorScheme() ?? 'light';
    const colors = Colors[scheme];
    const db = useSQLiteContext();
    const [accounts, setAccounts] = useState<Account[]>([]);

    useFocusEffect(
        useCallback(() => {
            (async () => {
                setAccounts(await getAllAccounts(db));
            })();
        }, [db])
    );

    return (
        <View className="mb-8">
            <Text className="text-2xl text-theme-text font-bold">Account</Text>

            <Dropdown
                style={{
                    backgroundColor: colors.surface,
                    padding: 12,
                    borderRadius: 6,
                    flex: 1,
                }}
                containerStyle={{
                    backgroundColor: colors.surface,
                    borderColor: colors.icon,
                }}
                activeColor={colors.background}
                itemTextStyle={{ color: colors.text }}
                selectedTextStyle={{
                    fontSize: 17,
                    color: colors.text,
                }}
                selectedTextStyle={{
                    fontSize: 17,
                    color: colors.text,
                }}
                placeholderStyle={{
                    fontSize: 17,
                    color: colors.text,
                    opacity: 0.5,
                }}
                inputSearchStyle={{
                    fontSize: 17,
                    color: colors.text,
                }}
                searchTextStyle={{ color: colors.text }}
                data={accounts}
                search
                maxHeight={300}
                labelField="name"
                valueField="id"
                placeholder="Select account"
                searchPlaceholder="Search account..."
                disable={disabled}
                value={selectedAccount?.id ?? undefined}
                onChange={item => setSelectedAccount(item)}
                renderLeftIcon={() => (
                    <MaterialCommunityIcons
                        className="mr-6"
                        name="bank"
                        size={20}
                        color={colors.text}
                    />
                )}
                renderRightIcon={() => disabled ? <></> : (
                    <MaterialCommunityIcons
                        name="chevron-down"
                        size={20}
                        color={colors.text}
                    />
                )}
            />
        </View>
    )
}

export default AccountSelection