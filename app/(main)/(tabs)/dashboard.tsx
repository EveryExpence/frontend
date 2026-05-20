import React, { useCallback } from "react";
import {
  FlatList,
  View,
  Dimensions,
  ActivityIndicator,
  Animated,
  ScrollView,
} from "react-native";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { Account } from "@/types/data/account";
import { useAccountsData } from "@/hooks/use-account-data";
import { TotalBalancePage } from "@/components/dashboard/TotalBalancePage";
import { AccountPage } from "@/components/dashboard/AccountPage";
import { PaginationDots } from "@/components/dashboard/PaginationDots";
import { useFocusEffect, useRouter } from "expo-router";
import { TransactionHistoryWidget } from "@/components/dashboard/widgets/TransactionHistoryWidget";

const { width } = Dimensions.get("window");

type AccountWithComputed = Account & { computedBalance: number };

const Dashboard = () => {
  const colorScheme: "light" | "dark" = useColorScheme() ?? "light";
  const router = useRouter();

  const { accounts, loading, error, totalsByCurrency, refetch } =
    useAccountsData();
  const [pageIndex, setPageIndex] = React.useState(0);
  const animatedIndex = React.useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const pages: Array<{ type: "total" } | AccountWithComputed> = [
    { type: "total" },
    ...accounts,
  ];

  React.useEffect(() => {
    Animated.spring(animatedIndex, {
      toValue: pageIndex,
      useNativeDriver: false,
      speed: 8,
    }).start();
  }, [pageIndex, animatedIndex]);

  const onMomentumScrollEnd = (e: any) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    setPageIndex(newIndex);
  };

  const renderPage = ({ item }: { item: any }) => {
    if (item.type === "total") {
      return <TotalBalancePage totalsByCurrency={totalsByCurrency} />;
    }

    return <AccountPage account={item} />;
  };

  return (
    <LinearGradient
      colors={[Colors[colorScheme].surface, Colors[colorScheme].tint]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      className="flex flex-1"
    >
      <SafeAreaView className="flex flex-1">
        {loading ? (
          <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color={Colors[colorScheme].tint} />
          </View>
        ) : error ? (
          <View className="p-4">
            <Text className="text-theme-text">Error: {error}</Text>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
            <FlatList
              style={{ flexGrow: 0 }}
              contentContainerStyle={{ flexGrow: 0 }}
              data={pages}
              keyExtractor={(i) => ("type" in i ? "total" : i.id)}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={onMomentumScrollEnd}
              renderItem={renderPage}
              getItemLayout={(_, index) => ({
                length: width,
                offset: width * index,
                index,
              })}
            />

            <PaginationDots
              pages={pages}
              pageIndex={pageIndex}
              animatedIndex={animatedIndex}
            />

            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                paddingHorizontal: 16,
                paddingBottom: 24,
              }}
            >
              <TransactionHistoryWidget
                onSeeAllPress={() => router.push("/records")}
              />
            </ScrollView>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Dashboard;
