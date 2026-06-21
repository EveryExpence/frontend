import { View, Text, TouchableOpacity, TextInput } from 'react-native'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Dropdown } from 'react-native-element-dropdown'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Category, categoryTypes, getCategoryIcon } from '@/types/data/category'
import { Colors } from '@/constants/theme'
import { SQLiteDatabase, useSQLiteContext } from 'expo-sqlite'
import { createCategory, getAllCategories } from '@/data/categories'
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { useColorScheme } from '@/hooks/use-color-scheme'
import { useFocusEffect } from 'expo-router'
import { useTranslation } from 'react-i18next'

interface Props {
    selectedCategory: Category | null;
    setSelectedCategory: Dispatch<SetStateAction<Category | null>>;
    disabled?: boolean;
    typeFilter?: "expense" | "income";
}

const fetchCategories = async (db: SQLiteDatabase, callback: Dispatch<SetStateAction<Category[]>>) => {
    callback(await getAllCategories(db));
}

const CategorySelection = ({ selectedCategory, setSelectedCategory, disabled, typeFilter }: Props) => {
    const { t } = useTranslation();
    const scheme = useColorScheme() ?? 'light';
    const colors = Colors[scheme];
    const db = useSQLiteContext();
    const [categories, setCategories] = useState<Category[]>([]);

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
                    data={typeFilter ? categories.filter(c => c.type?.toLowerCase() === typeFilter.toLowerCase() || c.type?.toLowerCase() === "varies") : categories}
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
            </View>


        </View>
    )
}

export default CategorySelection