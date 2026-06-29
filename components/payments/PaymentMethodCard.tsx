import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/themeContext';

export type PaymentMethodCardItem = {
  id: string;
  name: string;
  icon?: string;
};

type PaymentMethodCardProps = {
  item: PaymentMethodCardItem;
  index?: number;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function PaymentMethodCard({ item, index = 0, onEdit, onDelete }: PaymentMethodCardProps) {
  const { theme } = useTheme();
  const colors = Colors[theme];

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).springify().mass(0.6).damping(14)}>
      <View
        className="mb-6 flex-row items-center justify-between rounded-md px-4 py-4"
        style={{ backgroundColor: colors.surface }}
      >
      <View className="flex-row items-center self-stretch min-w-0 flex-1">
        <MaterialCommunityIcons
          name={(item.icon as any) || "cash-register"}
          size={48}
          color={colors.text}
          style={{ marginRight: 12 }}
        />

        <View className="flex-1 self-stretch min-w-0 justify-center py-1">
          <Text
            className="text-2xl"
            numberOfLines={1}
            ellipsizeMode="tail"
            style={{ color: colors.text }}
          >
            {item.name}
          </Text>
        </View>
      </View>

      <View className="items-end justify-between self-stretch">
        <View className="flex-row items-center">
          <TouchableOpacity 
            accessible 
            accessibilityRole="button" 
            accessibilityLabel="Edit payment method" 
            activeOpacity={0.8} style={{ marginRight: 8, padding: 4 }} onPress={onEdit}>
            <MaterialCommunityIcons name="pencil-outline" size={32} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity 
            accessible 
            accessibilityRole="button" 
            accessibilityLabel="Delete payment method" 
            activeOpacity={0.8} style={{ padding: 4 }} onPress={onDelete}>
            <MaterialCommunityIcons name="delete-outline" size={32} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      </View>
    </Animated.View>
  );
}