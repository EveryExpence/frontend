import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

export type AccountCardItem = {
  id: string;
  name: string;
  balance: string;
  currency: string;
};

type AccountCardProps = {
  item: AccountCardItem;
  textColor: string;
  surfaceColor: string;
  cornerRadius: number;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
};

export default function AccountCard({
  item,
  textColor,
  surfaceColor,
  cornerRadius,
  onEdit,
  onDelete,
}: AccountCardProps) {
  return (
    <View
      className="mb-6 flex-row items-center justify-between px-4 py-4"
      style={{ backgroundColor: surfaceColor, borderRadius: cornerRadius }}
    >
      <View className="flex-row items-center">
        <MaterialCommunityIcons
          name="cash-multiple"
          size={34}
          color={textColor}
          style={{ marginRight: 12 }}
        />

        <View>
          <Text className="text-2xl text-theme-text">{item.name}</Text>
          <Text className="mt-1 text-2xl text-theme-text">{item.balance}</Text>
        </View>
      </View>

      <View className="items-end justify-between self-stretch py-1">
        <Text className="text-2xl text-theme-text">{item.currency}</Text>

        <View className="mt-4 flex-row items-center">
          <TouchableOpacity
            activeOpacity={0.8}
            style={{ padding: 4, marginRight: 8 }}
            onPress={() => onEdit?.(item.id)}
          >
            <MaterialCommunityIcons name="pencil-outline" size={28} color={textColor} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={{ padding: 4 }}
            onPress={() => onDelete?.(item.id)}
          >
            <MaterialCommunityIcons name="delete-outline" size={28} color={textColor} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}