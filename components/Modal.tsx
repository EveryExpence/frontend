import { View, Text, Modal, Pressable } from 'react-native'
import React, { Dispatch, ReactNode, SetStateAction } from 'react'

interface Props {
    isVisible: boolean;
    setIsVisible: Dispatch<SetStateAction<boolean>>;
    title: string;
    cancelAction: ReactNode | null;
    confirmAction: ReactNode | null;
    children: ReactNode;
}

const CustomModal = (props: Props) => {
    const onClose = () => {
        props.setIsVisible(false);
    }

    return (
        <Modal visible={props.isVisible} transparent animationType="fade" onRequestClose={onClose}>
            <Pressable onPress={onClose} className="flex-1 bg-black/35 flex items-center justify-center">
                <Pressable onPress={() => { }} className="bg-theme-surface rounded-md w-11/12 p-6">
                    <Text className="text-2xl font-semibold text-theme-text mb-4">{props.title}</Text>

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