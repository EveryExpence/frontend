import { View, Text, TouchableOpacity, useColorScheme, TextInput } from 'react-native'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Dropdown } from 'react-native-element-dropdown'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { PaymentMethod } from '@/types/data/paymentMethod'
import { SQLiteDatabase, useSQLiteContext } from 'expo-sqlite'
import { Colors } from '@/constants/theme'
import { createPaymentMethod, getAllPaymentMethods } from '@/data/paymentMethods'
import CustomModal from '../Modal'

interface Props {
    selectedPaymentMethod: PaymentMethod | null;
    setSelectedPaymentMethod: Dispatch<SetStateAction<PaymentMethod | null>>;
    disabled?: boolean;
}

const fetchPaymentMethods = async (db: SQLiteDatabase, callback: Dispatch<SetStateAction<PaymentMethod[]>>) => {
    callback(await getAllPaymentMethods(db));
}

const PaymentMethodSelection = ({ selectedPaymentMethod, setSelectedPaymentMethod, disabled }: Props) => {
    const scheme = useColorScheme() ?? 'light';
    const colors = Colors[scheme];
    const db = useSQLiteContext();
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newPaymentMethodName, setNewPaymentMethodName] = useState("");

    const saveNewPaymentMethod = async () => {
        await createPaymentMethod(db, { name: newPaymentMethodName });
        await fetchPaymentMethods(db, setPaymentMethods);
        setIsModalVisible(false);
        setNewPaymentMethodName("");
    }

    useEffect(() => {
        fetchPaymentMethods(db, setPaymentMethods);
    }, [db]);

    return (
        <View className="mb-8">
            <Text className="text-2xl text-theme-text font-bold">Payment method</Text>

            <View className="flex-row justify-between items-center gap-2">
                <Dropdown
                    style={{
                        backgroundColor: colors.surface,
                        padding: 12,
                        borderRadius: 6,
                        flex: 1,
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
                    data={paymentMethods}
                    search
                    maxHeight={300}
                    labelField="name"
                    valueField="id"
                    placeholder="Select payment method"
                    disable={disabled}
                    searchPlaceholder="Search payment method..."
                    value={selectedPaymentMethod?.id ?? undefined}
                    onChange={item => setSelectedPaymentMethod(item)}
                    renderLeftIcon={() => (
                        <MaterialCommunityIcons
                            className="mr-6"
                            name="cash-register"
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

                {!disabled && (
                    <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                        <MaterialCommunityIcons name="plus" size={32} color={colors.text} />
                    </TouchableOpacity>
                )}
            </View>

            <CustomModal
                isVisible={isModalVisible}
                setIsVisible={setIsModalVisible}
                title="Create a new payment method"
                cancelAction={
                    <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                        <Text className="text-xl text-theme-text">Cancel</Text>
                    </TouchableOpacity>
                }
                confirmAction={
                    <TouchableOpacity
                        onPress={saveNewPaymentMethod}
                        className="bg-theme-tint rounded-md px-5 py-3"
                    >
                        <Text className="text-xl text-theme-textLight">Save</Text>
                    </TouchableOpacity>
                }
            >
                <View className="w-full mb-4">
                    <Text className="text-xl text-theme-text opacity-85">Payment method name</Text>

                    <View className="w-full flex-row items-center">
                        <MaterialCommunityIcons
                            className="absolute pl-4 z-30"
                            name="text-long"
                            size={20}
                            color={colors.text}
                        />

                        <TextInput
                            placeholder='Enter name'
                            placeholderClassName="text-theme-text opacity-35"
                            value={newPaymentMethodName}
                            onChangeText={setNewPaymentMethodName}
                            className="px-12 w-full py-4 text-xl rounded-md bg-theme-surface text-theme-text border border-theme-text"
                        />
                    </View>
                </View>
            </CustomModal>
        </View>
    )
}

export default PaymentMethodSelection