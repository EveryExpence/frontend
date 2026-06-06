import { View, Text, TouchableOpacity, TextInput } from 'react-native'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Dropdown } from 'react-native-element-dropdown'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Category, categoryTypes, getCategoryIcon } from '@/types/data/category'
import { Colors } from '@/constants/theme'
import { SQLiteDatabase, useSQLiteContext } from 'expo-sqlite'
import { createCategory, getAllCategories } from '@/data/categories'
import CustomModal from '../Modal'
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useFocusEffect } from 'expo-router'
import { useTranslation } from 'react-i18next'

interface Props {
    selectedCategory: Category | null;
    setSelectedCategory: Dispatch<SetStateAction<Category | null>>;
    disabled?: boolean;
}

const fetchCategories = async (db: SQLiteDatabase, callback: Dispatch<SetStateAction<Category[]>>) => {
    callback(await getAllCategories(db));
}

const CategorySelection = ({ selectedCategory, setSelectedCategory, disabled }: Props) => {
    const { t } = useTranslation();
    const scheme = useColorScheme() ?? 'light';
    const colors = Colors[scheme];
    const db = useSQLiteContext();
    const [categories, setCategories] = useState<Category[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState("");
    const [newCategoryTypeIndex, setNewCategoryTypeIndex] = useState(2);

    const saveNewCategory = async () => {
        await createCategory(db, { name: newCategoryName, type: categoryTypes[newCategoryTypeIndex] });
        await fetchCategories(db, setCategories);
        setIsModalVisible(false);
        setNewCategoryName("");
        setNewCategoryTypeIndex(2);
    }

    useFocusEffect(
        React.useCallback(() => {
            fetchCategories(db, setCategories);
        }, [db])
    );

    return (
        <View className="mb-8">
            <Text className="text-2xl font-bold text-theme-text">{t("new_expense.category")}</Text>

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
                    data={categories}
                    search
                    maxHeight={300}
                    labelField="name"
                    valueField="id"
                    placeholder={t("new_expense.select_category")}
                    disable={disabled}
                    searchPlaceholder={t("new_expense.search_category")}
                    value={selectedCategory?.id ?? undefined}
                    onChange={item => setSelectedCategory(item)}
                    renderLeftIcon={() => (
                        <MaterialCommunityIcons
                            className="mr-6"
                            name={selectedCategory ? getCategoryIcon(selectedCategory.name) : "chart-waterfall"}
                            size={20}
                            color={colors.text}
                        />
                    )}
                    renderItem={(item) => (
                        <View className="flex-row items-center p-3 gap-3">
                            <MaterialCommunityIcons 
                                name={getCategoryIcon(item.name)} 
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

                {!disabled && (
                    <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                        <MaterialCommunityIcons name="plus" size={32} color={colors.text} />
                    </TouchableOpacity>
                )}
            </View>

            <CustomModal
                isVisible={isModalVisible}
                setIsVisible={setIsModalVisible}
                title={t("new_expense.create_category")}
                cancelAction={
                    <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                        <Text className="text-xl text-theme-text">{t("common.cancel")}</Text>
                    </TouchableOpacity>
                }
                confirmAction={
                    <TouchableOpacity
                        onPress={saveNewCategory}
                        className="bg-theme-tint rounded-md px-5 py-3"
                    >
                        <Text className="text-xl text-theme-text">{t("common.save")}</Text>
                    </TouchableOpacity>
                }
            >
                <View className="w-full mb-4">
                    <Text className="text-xl text-theme-text opacity-85">{t("new_expense.category_name")}</Text>

                    <View className="w-full flex-row items-center">
                        <MaterialCommunityIcons
                            className="absolute pl-4 z-30"
                            name="text-long"
                            size={20}
                            color={colors.text}
                        />

                        <TextInput
                            placeholder={t("new_expense.enter_name")}
                            placeholderClassName="text-theme-text opacity-35"
                            value={newCategoryName}
                            onChangeText={setNewCategoryName}
                            className="px-12 w-full py-4 text-xl rounded-md bg-theme-surface text-theme-text border border-theme-text"
                        />
                    </View>
                </View>

                <View className="w-full mb-4">
                    <Text className="text-xl text-theme-text opacity-85">{t("new_expense.category_name")}</Text>

                    <SegmentedControl
                        tintColor={colors.tint}
                        fontStyle={{
                            color: colors.text,
                        }}
                        activeFontStyle={{
                            color: colors.textLight,
                        }}
                        backgroundColor={colors.surface}
                        style={{
                            height: 36
                        }}
                        values={categoryTypes}
                        selectedIndex={newCategoryTypeIndex}
                        onChange={(event) => {
                            setNewCategoryTypeIndex(event.nativeEvent.selectedSegmentIndex);
                        }}
                    />
                </View>
            </CustomModal>
        </View>
    )
}

export default CategorySelection