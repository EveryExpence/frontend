import { View, Text, TouchableOpacity, useColorScheme } from 'react-native'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Dropdown } from 'react-native-element-dropdown'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { PaymentMethod } from '@/types/data/paymentMethod'
import { useSQLiteContext } from 'expo-sqlite'
import { Colors } from '@/constants/theme'
import { getAllPaymentMethods } from '@/data/paymentMethods'

interface Props {
    selectedPaymentMethod: PaymentMethod | null;
    setSelectedPaymentMethod: Dispatch<SetStateAction<PaymentMethod | null>>;
}

const PaymentMethodSelection = ({ selectedPaymentMethod, setSelectedPaymentMethod }: Props) => {
    const scheme = useColorScheme() ?? 'light';
    const colors = Colors[scheme];
    const db = useSQLiteContext();
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);

    useEffect(() => {
        (async () => {
            setPaymentMethods(await getAllPaymentMethods(db));
        })();
    }, [db]);

    return (
        <View className="mb-8">
            <Text className="text-2xl font-bold">Payment method</Text>

            <View className="flex-row justify-between items-center gap-2">
                <Dropdown
                    style={{
                        backgroundColor: colors.surface,
                        padding: 12,
                        borderRadius: 6,
                        flex: 1,
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
                    data={paymentMethods}
                    search
                    maxHeight={300}
                    labelField="name"
                    valueField="id"
                    placeholder="Select payment method"
                    searchPlaceholder="Search payment method..."
                    value={selectedPaymentMethod ?? undefined}
                    onChange={item => setSelectedPaymentMethod(item)}
                    renderLeftIcon={() => (
                        <MaterialCommunityIcons
                            className="mr-6"
                            name="cash-register"
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

                <TouchableOpacity>
                    <MaterialCommunityIcons name="plus" size={32} />
                </TouchableOpacity>
            </View>
        </View>
    )
}

export default PaymentMethodSelection