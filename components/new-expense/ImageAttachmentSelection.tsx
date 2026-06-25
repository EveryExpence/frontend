import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native'
import React, { Dispatch, SetStateAction } from 'react'
import * as ImagePicker from 'expo-image-picker'
import * as Sharing from 'expo-sharing'
import { MaterialIcons } from '@expo/vector-icons'
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';

interface Props {
    images: string[];
    setImages: Dispatch<SetStateAction<string[]>>;
    isEditing?: boolean;
}

const ImageAttachmentSelection = ({ images, setImages, isEditing = true }: Props) => {
    const { t } = useTranslation();
    const pickImage = async () => {
        try {
            const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (permissionResult?.granted === false) {
                Toast.show({ text1: t('new_expense.image_picker_failed'), text2: "Permission to access camera roll is required!", type: "error" });
                return;
            }

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

    const openImage = async (uri: string) => {
        try {
            const isAvailable = await Sharing.isAvailableAsync();
            if (isAvailable) {
                await Sharing.shareAsync(uri);
            } else {
                Toast.show({ text1: t('new_expense.cannot_open'), type: "error" });
            }
        } catch (error: any) {
            console.error("Failed to open image:", error);
        }
    };

    return (
        <View className="mb-8">
            <View className="flex-row items-center justify-between">
                <Text className="text-2xl text-theme-text font-bold">{t("new_expense.attachments")}</Text>
                {isEditing && (
                    <TouchableOpacity onPress={pickImage} className="bg-theme-surface px-4 py-2 rounded-md">
                        <Text className="text-theme-text font-medium">{t("new_expense.add_image")}</Text>
                    </TouchableOpacity>
                )}
            </View>

            {images.length > 0 && (
                <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-4">
                    {images.map((uri, index) => (
                        <View key={index} className="mr-4 relative">
                            <TouchableOpacity onPress={() => openImage(uri)}>
                                <Image source={{ uri }} className="w-24 h-24 rounded-md" />
                            </TouchableOpacity>
                            {isEditing && (
                                <TouchableOpacity
                                    onPress={() => removeImage(index)}
                                    className="absolute top-1 right-1 bg-theme-tint rounded-full w-7 h-7 items-center justify-center shadow-sm"
                                >
                                    <MaterialIcons name="close" size={18} color="white" />
                                </TouchableOpacity>
                            )}
                        </View>
                    ))}
                </ScrollView>
            )}
        </View>
    )
}

export default ImageAttachmentSelection
