import { View, Text, Modal, Pressable } from 'react-native'
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Colors } from "@/constants/theme";
import React, { Dispatch, ReactNode, SetStateAction } from 'react'
import { useTheme } from '@/context/themeContext';

interface Props {
    isVisible: boolean;
    setIsVisible: Dispatch<SetStateAction<boolean>>;
    title: string;
    cancelAction?: ReactNode | null;
    confirmAction?: ReactNode | null;
    showCloseIcon?: boolean;
    children: ReactNode;
}

const CustomModal = (props: Props) => {
    const onClose = () => {
        props.setIsVisible(false);
    }

    const { theme } = useTheme();

    return (
        <Modal visible={props.isVisible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable onPress={onClose} className="flex-1 bg-black/35 flex items-center justify-center">
                <Pressable onPress={() => { }} className="bg-theme-surface rounded-md w-11/12 p-6">
                    <View className="flex-row justify-between items-start mb-4">
                        <Text className="text-2xl font-semibold text-theme-text flex-1 pr-2">{props.title}</Text>
                        {props.showCloseIcon && (
                            <Pressable onPress={onClose} className="p-1 -mt-1 -mr-1">
                                <MaterialCommunityIcons name="close" size={24} color={Colors[theme].text} />
                            </Pressable>
                        )}
                    </View>

                    {props.children}

                    <View className="flex-row justify-between items-center mt-2">
                        {props.cancelAction ?? <></>}

                        {props.confirmAction ?? <></>}
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    )
}

export default CustomModal