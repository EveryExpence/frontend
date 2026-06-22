import React, { useCallback } from "react";
import {
  FlatList,
  View,
  Dimensions,
  ActivityIndicator,
  Animated,
  ScrollView,
  Text,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
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
import SpendingInsidesWidget from "@/components/dashboard/widgets/SpendingInsidesWidget";
import IncomeInsightsWidget from "@/components/dashboard/widgets/IncomeInsightsWidget";
import BalanceTrendWidget from "@/components/dashboard/widgets/BalanceTrendWidget";
import { ExpenseMapWidget } from "@/components/dashboard/widgets/ExpenseMapWidget";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

type AccountWithComputed = Account & { computedBalance: number };

const Dashboard = () => {
  const { t } = useTranslation();
  const colorScheme: "light" | "dark" = useColorScheme() ?? "light";
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { accounts, loading, error, totalsByCurrency, refetch } =
    useAccountsData();
  const [pageIndex, setPageIndex] = React.useState(0);
  const [scrollEnabled, setScrollEnabled] = React.useState(true);
  const animatedIndex = React.useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const pages: ({ type: "total" } | AccountWithComputed)[] = 
    accounts.length <= 1 ? accounts : [{ type: "total" }, ...accounts];

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
            <Text className="text-theme-text">{t("common.error")}: {error}</Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            scrollEnabled={scrollEnabled}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: 16,
              paddingTop: Math.max(insets.top, 8),
              paddingBottom: 50 + insets.bottom,
            }}
          >
            <FlatList
              style={{ flexGrow: 0, marginHorizontal: -16 }}
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

            <TransactionHistoryWidget
              accountId={pages[pageIndex] && "id" in pages[pageIndex] ? pages[pageIndex].id : undefined}
              onSeeAllPress={() => {
                const id = pages[pageIndex] && "id" in pages[pageIndex] ? pages[pageIndex].id : undefined;
                router.push(id ? { pathname: "/records", params: { accountId: id } } : "/records");
              }}
            />

            <SpendingInsidesWidget
              accountId={pages[pageIndex] && "id" in pages[pageIndex] ? pages[pageIndex].id : undefined}
              onShowMore={() => {
                const id = pages[pageIndex] && "id" in pages[pageIndex] ? pages[pageIndex].id : undefined;
                router.push(id ? { pathname: "/spending-insights", params: { accountId: id } } : "/spending-insights");
              }}
            />

            <IncomeInsightsWidget
              accountId={pages[pageIndex] && "id" in pages[pageIndex] ? pages[pageIndex].id : undefined}
              onShowMore={() => {
                const id = pages[pageIndex] && "id" in pages[pageIndex] ? pages[pageIndex].id : undefined;
                router.push(id ? { pathname: "/income-insights", params: { accountId: id } } : "/income-insights");
              }}
            />

            <BalanceTrendWidget 
              accountId={pages[pageIndex] && "id" in pages[pageIndex] ? pages[pageIndex].id : undefined}
              onShowMore={() => {
                const id = pages[pageIndex] && "id" in pages[pageIndex] ? pages[pageIndex].id : undefined;
                router.push(id ? { pathname: "/balance-trend", params: { accountId: id } } : "/balance-trend");
              }}
            />

            <ExpenseMapWidget
              accountId={pages[pageIndex] && "id" in pages[pageIndex] ? pages[pageIndex].id : undefined}
              setScrollEnabled={setScrollEnabled}
            />
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Dashboard;
