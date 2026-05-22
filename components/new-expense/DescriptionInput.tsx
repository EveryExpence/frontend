import { View, Text, TextInput, useColorScheme } from 'react-native'
import React, { Dispatch, SetStateAction } from 'react'
import { Colors } from '@/constants/theme'

interface Props {
    description: string;
    setDescription: Dispatch<SetStateAction<string>>;
    disabled?: boolean;
}

const DescriptionInput = ({ description, setDescription, disabled }: Props) => {
    const scheme = useColorScheme() ?? 'light';
    const colors = Colors[scheme];

    return (
        <View className="mb-8">
            <Text className="text-2xl text-theme-text font-bold">Description</Text>

            <TextInput
                placeholder='Enter description'
                placeholderTextColor={colors.icon}
                value={description}
                onChangeText={setDescription}
                editable={!disabled}
                multiline
                textAlignVertical="top"
                style={{ color: colors.text }}
                className="w-full min-h-36 text-xl rounded-md bg-theme-surface text-theme-text px-4 py-6"
            />
        </View>
    )
}

export default DescriptionInput