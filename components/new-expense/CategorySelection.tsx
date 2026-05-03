import { View, Text, useColorScheme, TouchableOpacity } from 'react-native'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Dropdown } from 'react-native-element-dropdown'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Category } from '@/types/data/category'
import { Colors } from '@/constants/theme'
import { useSQLiteContext } from 'expo-sqlite'
import { getAllCategories } from '@/data/categories'

interface Props {
    selectedCategory: Category | null;
    setSelectedCategory: Dispatch<SetStateAction<Category | null>>;
}

const CategorySelection = ({ selectedCategory, setSelectedCategory }: Props) => {
    const scheme = useColorScheme() ?? 'light';
    const colors = Colors[scheme];
    const db = useSQLiteContext();
    const [categories, setCategories] = useState<Category[]>([]);

    useEffect(() => {
        (async () => {
            setCategories(await getAllCategories(db));
        })();
    }, [db]);

    return (
        <View className="mb-8">
            <Text className="text-2xl font-bold">Category</Text>

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
                    data={categories}
                    search
                    maxHeight={300}
                    labelField="name"
                    valueField="id"
                    placeholder="Select category"
                    searchPlaceholder="Search category..."
                    value={selectedCategory ?? undefined}
                    onChange={item => setSelectedCategory(item)}
                    renderLeftIcon={() => (
                        <MaterialCommunityIcons
                            className="mr-6"
                            name="chart-waterfall"
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

export default CategorySelection