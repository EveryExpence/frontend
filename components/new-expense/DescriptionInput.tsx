import { View, Text, TextInput } from 'react-native'
import React, { Dispatch, SetStateAction } from 'react'

interface Props {
    description: string;
    setDescription: Dispatch<SetStateAction<string>>;
    disabled?: boolean;
}

const DescriptionInput = ({ description, setDescription, disabled }: Props) => {
    return (
        <View className="mb-8">
            <Text className="text-2xl text-theme-text font-bold">Description</Text>

            <TextInput
                placeholder='Enter description'
                placeholderClassName="text-theme-text opacity-35"
                value={description}
                onChangeText={setDescription}
                editable={!disabled}
                multiline
                textAlignVertical="top"
                className="w-full min-h-36 text-xl rounded-md bg-theme-surface text-theme-text px-4 py-6"
            />
        </View>
    )
}

export default DescriptionInput