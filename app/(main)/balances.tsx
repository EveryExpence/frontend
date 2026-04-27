import React from 'react';
import { FlatList, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

type AccountItem = {
  id: string;
  name: string;
  balance: string;
  currency: string;
};

const accounts: AccountItem[] = [
  { id: '1', name: 'Account #1', balance: '1 023,68 zl', currency: 'PLN' },
  { id: '2', name: 'Account #2', balance: '725 €', currency: 'EUR' },
  { id: '3', name: 'Account #3', balance: '521 $', currency: 'USD' },
  { id: '4', name: 'Account #4', balance: '1057 zl', currency: 'PLN' },
];

const BOTTOM_NAV_HEIGHT = 84;
const FLOATING_BUTTON_HEIGHT = 56;
const FLOATING_BUTTON_GAP = 12;
const LIST_BOTTOM_GAP = 16;
const CORNER_RADIUS = 6;

export default function Balances() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const insets = useSafeAreaInsets();

const fixedButtonBottom = insets.bottom + BOTTOM_NAV_HEIGHT + FLOATING_BUTTON_GAP;
const listBottomPadding = fixedButtonBottom + FLOATING_BUTTON_HEIGHT + LIST_BOTTOM_GAP;


  const renderItem = ({ item }: { item: AccountItem }) => {
    return (
      <View
        className="mb-6 flex-row items-center justify-between px-4 py-4"
        style={{ backgroundColor: colors.surface, borderRadius: CORNER_RADIUS }}
      >
        <View className="flex-row items-center">
          <MaterialCommunityIcons
            name="cash-multiple"
            size={34}
            color={colors.text}
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
            <TouchableOpacity activeOpacity={0.8} style={{ padding: 4, marginRight: 8 }}>
              <MaterialCommunityIcons name="pencil-outline" size={28} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.8} style={{ padding: 4 }}>
              <MaterialCommunityIcons name="delete-outline" size={28} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-theme-background">
      <View className="flex-1 px-4 pt-4">
        <View className="mb-5 flex-row items-center justify-between">
          <Text className="text-xl font-semibold text-theme-text">Your accounts</Text>
          <Text className="text-lg font-semibold text-theme-tint">
            {accounts.length} Total accounts
          </Text>
        </View>

        <FlatList
          data={accounts}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: listBottomPadding }}
        />
      </View>

      <View
        pointerEvents="box-none"
        style={{ position: 'absolute', left: 16, right: 16, bottom: fixedButtonBottom }}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          className="w-full flex-row items-center justify-center bg-theme-tint py-4"
          style={{ borderRadius: CORNER_RADIUS }}
        >
          <MaterialCommunityIcons
            name="plus"
            size={22}
            color={colors.textLight}
            style={{ marginRight: 8 }}
          />
          <Text className="text-xl font-semibold text-theme-textLight">Add new account</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}