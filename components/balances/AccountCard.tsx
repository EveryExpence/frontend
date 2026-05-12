import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export type AccountCardItem = {
  id: string;
  name: string;
  balance: string;
  currency: string;
};

type AccountCardProps = {
  item: AccountCardItem;
  cornerRadius: number;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export default function AccountCard({
  item,
  cornerRadius,
  onEdit,
  onDelete,
}: AccountCardProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <View
      className="mb-6 flex-row items-center justify-between px-4 py-4"
      style={{ backgroundColor: colors.surface, borderRadius: cornerRadius }}
    >
      <View className="flex-row items-center self-stretch flex-1 min-w-0">
        <MaterialCommunityIcons
          name="cash-multiple"
          size={48}
          color={colors.text}
          style={{ marginRight: 12 }}
        />

        <View className="self-stretch justify-between py-1 flex-1 min-w-0">
          <Text
            className="text-2xl"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ color: colors.text }}
          >
            {item.name}
          </Text>
          <Text className="text-2xl" style={{ color: colors.text }}>{item.balance}</Text>
        </View>
      </View>

      <View className="items-end justify-between self-stretch">
        <Text className="text-2xl" style={{ color: colors.text }}>{item.currency}</Text>

        <View className="flex-row items-center">
          <TouchableOpacity
            activeOpacity={0.8}
            style={{ padding: 4, marginRight: 8 }}
            onPress={() => onEdit?.(item.id)}
          >
            <MaterialCommunityIcons name="pencil-outline" size={32} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={{ padding: 4 }}
            onPress={() => onDelete?.(item.id)}
          >
            <MaterialCommunityIcons name="delete-outline" size={32} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}