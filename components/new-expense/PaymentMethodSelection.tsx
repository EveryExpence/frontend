import { View, Text, TouchableOpacity, TextInput } from 'react-native'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Dropdown } from 'react-native-element-dropdown'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { PaymentMethod } from '@/types/data/paymentMethod'
import { SQLiteDatabase, useSQLiteContext } from 'expo-sqlite'
import { Colors } from '@/constants/theme'
import { createPaymentMethod, getAllPaymentMethods } from '@/data/paymentMethods'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useFocusEffect } from 'expo-router'
import { useTranslation } from 'react-i18next';

interface Props {
    selectedPaymentMethod: PaymentMethod | null;
    setSelectedPaymentMethod: Dispatch<SetStateAction<PaymentMethod | null>>;
    disabled?: boolean;
}

const fetchPaymentMethods = async (db: SQLiteDatabase, callback: Dispatch<SetStateAction<PaymentMethod[]>>) => {
    callback(await getAllPaymentMethods(db));
}

const getPaymentMethodIcon = (name: string): any => {
    const lowercaseName = name.toLowerCase();
    if (lowercaseName.includes("cash") || lowercaseName.includes("gotówka")) return "cash";
    if (lowercaseName.includes("card") || lowercaseName.includes("karta")) return "credit-card";
    if (lowercaseName.includes("blik") || lowercaseName.includes("phone") || lowercaseName.includes("telefon")) return "cellphone-nfc";
    if (lowercaseName.includes("bank") || lowercaseName.includes("transfer") || lowercaseName.includes("przelew")) return "bank-transfer";
    return "cash-register";
}

const PaymentMethodSelection = ({ selectedPaymentMethod, setSelectedPaymentMethod, disabled }: Props) => {
    const { t } = useTranslation();
    const scheme = useColorScheme() ?? 'light';
    const colors = Colors[scheme];
    const db = useSQLiteContext();
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

    useFocusEffect(
        React.useCallback(() => {
            fetchPaymentMethods(db, setPaymentMethods);
        }, [db])
    );

    return (
        <View className="mb-8">
            <Text className="text-2xl text-theme-text font-bold">{t("new_expense.payment_method")}</Text>

            <View className="flex-row justify-between items-center gap-2">
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
                    placeholderStyle={{
                        fontSize: 17,
                        color: colors.text,
                        opacity: 0.5,
                    }}
                    inputSearchStyle={{
                        fontSize: 17,
                        color: colors.text,
                    }}
                    data={paymentMethods}
                    search
                    maxHeight={300}
                    labelField="name"
                    valueField="id"
                    placeholder={t("new_expense.select_payment_method")}
                    disable={disabled}
                    searchPlaceholder={t("new_expense.search_payment_method")}
                    value={selectedPaymentMethod?.id ?? undefined}
                    onChange={item => setSelectedPaymentMethod(item)}
                    renderLeftIcon={() => (
                        <MaterialCommunityIcons
                            className="mr-6"
                            name={selectedPaymentMethod ? getPaymentMethodIcon(selectedPaymentMethod.name) : "cash-register"}
                            size={20}
                            color={colors.text}
                        />
                    )}
                    renderItem={(item) => (
                        <View className="flex-row items-center p-3 gap-3">
                            <MaterialCommunityIcons 
                                name={getPaymentMethodIcon(item.name)} 
                                size={20} 
                                color={colors.text} 
                            />
                            <Text className="text-[17px]" style={{ color: colors.text }}>{item.name}</Text>
                        </View>
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


        </View>
    )
}

export default PaymentMethodSelection