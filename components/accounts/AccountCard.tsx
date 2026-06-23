import { Text, TouchableOpacity, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown, Layout } from 'react-native-reanimated';
import { Colors } from '@/constants/theme';
import { useTheme } from '@/context/themeContext';
import { getAccountIconName } from '@/utils/accountIcon';

export type AccountCardItem = {
  id: string;
  name: string;
  balance: string;
  initialBalance?: string;
  currency: string;
};

type AccountCardProps = {
  item: AccountCardItem;
  index?: number;
  onEdit?: () => void;
  onDelete?: () => void;
};

export default function AccountCard({
  item,
  index = 0,
  onEdit,
  onDelete,
}: AccountCardProps) {
  const { theme } = useTheme();
  const colors = Colors[theme];
  const accountIcon = getAccountIconName(item.id);

  return (
    <Animated.View entering={FadeInDown.delay(index * 100).springify().mass(0.6).damping(14)}>
      <View
        className="mb-6 flex-row items-center justify-between px-4 py-4 rounded-md"
        style={{ backgroundColor: colors.surface }}
      >
      <View className="flex-row items-center self-stretch flex-1 min-w-0">
        <MaterialCommunityIcons
          name={accountIcon}
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
          <Text className="text-xl" style={{ color: colors.text }}>
            {item.balance} {item.initialBalance && <Text className="text-lg opacity-60">({item.initialBalance})</Text>}
          </Text>
        </View>
      </View>

      <View className="items-end justify-between self-stretch">
        <Text className="text-2xl" style={{ color: colors.text }}>{item.currency}</Text>

        <View className="flex-row items-center">
          <TouchableOpacity
            activeOpacity={0.8}
            style={{ padding: 4, marginRight: 8 }}
            onPress={onEdit}
          >
            <MaterialCommunityIcons name="pencil-outline" size={32} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={{ padding: 4 }}
            onPress={onDelete}
          >
            <MaterialCommunityIcons name="delete-outline" size={32} color={colors.text} />
          </TouchableOpacity>
        </View>
        </View>
      </View>
    </Animated.View>
  );
}