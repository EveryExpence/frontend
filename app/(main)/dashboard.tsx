import React from "react";
import { FlatList, View, Dimensions, ActivityIndicator } from "react-native";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { useSQLiteContext } from "expo-sqlite";
import { Account } from "@/types/data/account";
import { formatCurrency } from "@/utils/formatCurrency";
import { useAccountsData } from "@/hooks/use-account-data";
import { TotalBalancePage } from "@/components/dashboard/TotalBalancePage";
import { AccountPage } from "@/components/dashboard/AccountPage";

const { width } = Dimensions.get("window");

type AccountWithComputed = Account & { computedBalance: number };

const Dashboard = () => {
  const colorScheme: "light" | "dark" = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const textColor = colorScheme === "dark" ? colors.textLight : colors.text;

  const { accounts, loading, error, totalsByCurrency } = useAccountsData();
  const [pageIndex, setPageIndex] = React.useState(0);

  const db = useSQLiteContext();

  const pages: Array<{ type: "total" } | AccountWithComputed> = [
    { type: "total" },
    ...accounts,
  ];

  const onMomentumScrollEnd = (e: any) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    setPageIndex(newIndex);
  };

  const renderPage = ({ item }: { item: any }) => {
    if (item.type === "total") {
      return (
        <TotalBalancePage
          totalsByCurrency={totalsByCurrency}
          textColor={textColor}
        />
      );
    }

    return <AccountPage account={item} textColor={textColor} />;
  };

  return (
    <LinearGradient
      colors={[colors.surface, colors.tint]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex flex-1"
    >
      <SafeAreaView className="flex flex-1">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={colors.tint} />
          </View>
        ) : error ? (
          <View className="p-4">
            <Text style={{ color: textColor }}>Error: {error}</Text>
          </View>
        ) : (
          <>
            <FlatList
              data={pages}
              keyExtractor={(i) => ("type" in i ? "total" : i.id)}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onMomentumScrollEnd}
              renderItem={renderPage}
            />

            <View className="flex-row justify-center py-3">
              {pages.map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: i === pageIndex ? 24 : 8,
                    height: 8,
                    borderRadius: 8,
                    backgroundColor:
                      i === pageIndex ? colors.tint : colors.icon,
                    marginHorizontal: 4,
                  }}
                />
              ))}
            </View>
          </>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Dashboard;
