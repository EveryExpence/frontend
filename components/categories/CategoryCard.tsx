import React from 'react';
import { Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { getCategoryIcon } from '@/types/data/category';

export type CategoryCardItem = {
  id: string;
  name: string;
  type: 'expense' | 'income' | 'varies';
};

type CategoryCardProps = {
  item: CategoryCardItem;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function CategoryCard({ item, onEdit, onDelete }: CategoryCardProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <View
      className="mb-6 flex-row items-center justify-between rounded-md px-4 py-4"
      style={{ backgroundColor: colors.surface }}
    >
      <View className="flex-row items-center self-stretch min-w-0 flex-1">
        <MaterialCommunityIcons
          name={getCategoryIcon(item.name)}
          size={48}
          color={colors.text}
          style={{ marginRight: 12 }}
        />

        <View className="flex-1 self-stretch min-w-0 justify-between py-1">
          <Text
            className="text-2xl"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ color: colors.text }}
          >
            {item.name}
          </Text>
          <Text className="text-base uppercase tracking-wide" style={{ color: colors.icon }}>
            {item.type}
          </Text>
        </View>
      </View>

      <View className="items-end justify-between self-stretch">
        <View className="flex-row items-center">
          <TouchableOpacity activeOpacity={0.8} style={{ marginRight: 8, padding: 4 }} onPress={onEdit}>
            <MaterialCommunityIcons name="pencil-outline" size={32} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8} style={{ padding: 4 }} onPress={onDelete}>
            <MaterialCommunityIcons name="delete-outline" size={32} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}