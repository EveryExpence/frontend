import { View, Text, useColorScheme, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native'
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react'
import { Dropdown } from 'react-native-element-dropdown'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import { Category, categoryTypes } from '@/types/data/category'
import { Colors } from '@/constants/theme'
import { SQLiteDatabase, useSQLiteContext } from 'expo-sqlite'
import { createCategory, getAllCategories } from '@/data/categories'
import CustomModal from '../Modal'
import SegmentedControl from '@react-native-segmented-control/segmented-control';

interface Props {
    selectedCategory: Category | null;
    setSelectedCategory: Dispatch<SetStateAction<Category | null>>;
}

const fetchCategories = async (db: SQLiteDatabase, callback: Dispatch<SetStateAction<Category[]>>) => {
    callback(await getAllCategories(db));
}

const CategorySelection = ({ selectedCategory, setSelectedCategory }: Props) => {
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

    useEffect(() => {
        fetchCategories(db, setCategories);
    }, [db]);

    return (
        <View className="mb-8">
            <Text className="text-2xl font-bold text-theme-text">Category</Text>

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
                            color={colors.text}
                        />
                    )}
                    renderRightIcon={() => (
                        <MaterialCommunityIcons
                            name="chevron-down"
                            size={20}
                            color={colors.text}
                        />
                    )}
                />

                <TouchableOpacity onPress={() => setIsModalVisible(true)}>
                    <MaterialCommunityIcons name="plus" size={32} color={colors.text} />
                </TouchableOpacity>
            </View>

            <CustomModal
                isVisible={isModalVisible}
                setIsVisible={setIsModalVisible}
                title="Create a new category"
                cancelAction={
                    <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                        <Text className="text-xl text-theme-text">Cancel</Text>
                    </TouchableOpacity>
                }
                confirmAction={
                    <TouchableOpacity
                        onPress={saveNewCategory}
                        className="bg-theme-tint rounded-md px-5 py-3"
                    >
                        <Text className="text-xl text-theme-textLight">Save</Text>
                    </TouchableOpacity>
                }
            >
                <View className="w-full mb-4">
                    <Text className="text-xl text-theme-text opacity-85">Category name</Text>

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
                            value={newCategoryName}
                            onChangeText={setNewCategoryName}
                            className="px-12 w-full py-4 text-xl rounded-md bg-theme-surface text-theme-text border border-theme-text"
                        />
                    </View>
                </View>

                <View className="w-full mb-4">
                    <Text className="text-xl text-theme-text opacity-85">Category name</Text>

                    <SegmentedControl
                        tintColor={colors.tint}
                        fontStyle={{
                            color: colors.text,
                        }}
                        activeFontStyle={{
                            color: colors.textLight,
                        }}
                        backgroundColor={colors.background}
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