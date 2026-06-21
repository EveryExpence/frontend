import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native'
import React, { Dispatch, SetStateAction } from 'react'
import * as ImagePicker from 'expo-image-picker'
import { MaterialIcons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

interface Props {
    images: string[];
    setImages: Dispatch<SetStateAction<string[]>>;
}

const ImageAttachmentSelection = ({ images, setImages }: Props) => {
    const { t } = useTranslation();
    const pickImage = async () => {
        try {
            let result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsMultipleSelection: true,
                quality: 0.8,
            });

            if (!result.canceled) {
                const selectedUris = result.assets.map(asset => asset.uri);
                setImages(prev => [...prev, ...selectedUris]);
            }
        } catch (error: any) {
            console.error("Failed to pick image:", error);
            Toast.show({ text1: t('new_expense.image_picker_failed'), text2: error?.message, type: "error" });
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <View className="mb-8">
            <View className="flex-row items-center justify-between">
                <Text className="text-2xl text-theme-text font-bold">{t("new_expense.attachments")}</Text>
                <TouchableOpacity onPress={pickImage} className="bg-theme-surface px-4 py-2 rounded-md">
                    <Text className="text-theme-text font-medium">{t("new_expense.add_image")}</Text>
                </TouchableOpacity>
            </View>

            {images.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
                    {images.map((uri, index) => (
                        <View key={index} className="mr-4 relative">
                            <Image source={{ uri }} className="w-24 h-24 rounded-md" />
                            <TouchableOpacity
                                onPress={() => removeImage(index)}
                                className="absolute top-1.5 right-1.5 bg-theme-tint rounded-full p-1"
                            >
                                <MaterialIcons name="close" size={16} color="white" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    )
}

export default ImageAttachmentSelection
