import React, { useCallback } from "react";
import {
  FlatList,
  View,
  Dimensions,
  ActivityIndicator,
  Animated,
  RefreshControl,
  ScrollView,
  Text,
  LayoutAnimation,
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
import { useSync } from "@/context/syncContext";

const { width } = Dimensions.get("window");

type AccountWithComputed = Account & { computedBalance: number };

const Dashboard = () => {
  const { t } = useTranslation();
  const colorScheme: "light" | "dark" = useColorScheme() ?? "light";
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const { accounts, loading, error, totalsByCurrency, refetch } =
    useAccountsData();
  const { triggerSync, isSyncing } = useSync();
  const [pageIndex, setPageIndex] = React.useState(0);
  const [scrollEnabled, setScrollEnabled] = React.useState(true);
  const animatedIndex = React.useRef(new Animated.Value(0)).current;
  const flatListRef = React.useRef<FlatList>(null);
  const [listHeight, setListHeight] = React.useState<number | null>(null);
  const pageHeights = React.useRef<{ [key: string]: number }>({}).current;

  const pages: ({ type: "total" } | AccountWithComputed)[] =
    accounts.length <= 1 ? accounts : [{ type: "total" }, ...accounts];

  React.useEffect(() => {
    if (pages.length > 0 && pageIndex >= pages.length) {
      setPageIndex(pages.length - 1);
    }
  }, [pages.length, pageIndex]);

  React.useEffect(() => {
    Animated.spring(animatedIndex, {
      toValue: pageIndex,
      useNativeDriver: false,
      speed: 8,
    }).start();

    const currentKey = pages[pageIndex] && ("type" in pages[pageIndex] ? "total" : pages[pageIndex].id);
    if (currentKey && pageHeights[currentKey]) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setListHeight(pageHeights[currentKey]);
    }
  }, [pageIndex, animatedIndex, pages]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const onRefresh = useCallback(async () => {
    await triggerSync();
    await refetch();
  }, [triggerSync, refetch]);

  const onViewableItemsChanged = React.useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0 && viewableItems[0].index !== null) {
      setPageIndex(viewableItems[0].index);
    }
  }).current;

  const viewabilityConfig = React.useRef({ itemVisiblePercentThreshold: 50 }).current;

  const activePage = pages[pageIndex];
  const isTotalScope = !!activePage && "type" in activePage;
  const activeAccountId =
    activePage && "id" in activePage ? activePage.id : undefined;
  const widgetScope: "total" | "account" = isTotalScope
    ? "total"
    : "account";

  const renderPage = ({ item }: { item: any }) => {
    const isTotal = item.type === "total";
    const key = isTotal ? "total" : item.id;
    
    return (
      <View 
        onLayout={(e) => {
          const height = e.nativeEvent.layout.height;
          pageHeights[key] = height;
          if (pages[pageIndex] && ("type" in pages[pageIndex] ? "total" : pages[pageIndex].id) === key) {
             if (listHeight !== height) {
               LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
               setListHeight(height);
             }
          }
        }}
      >
        {isTotal ? (
          <TotalBalancePage totalsByCurrency={totalsByCurrency} />
        ) : (
          <AccountPage account={item} />
        )}
      </View>
    );
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
            <Text className="text-theme-text">
              {t("common.error")}: {error}
            </Text>
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
            refreshControl={
              <RefreshControl
                refreshing={isSyncing}
                onRefresh={onRefresh}
                tintColor={Colors[colorScheme].tint}
                colors={[Colors[colorScheme].tint]}
                progressBackgroundColor={Colors[colorScheme].surface}
              />
            }
          >
            <FlatList
              ref={flatListRef}
              initialScrollIndex={pageIndex}
              style={{ flexGrow: 0, marginHorizontal: -16, height: listHeight ?? undefined }}
              contentContainerStyle={{ flexGrow: 0, alignItems: 'flex-start' }}
              data={pages}
              keyExtractor={(i) => ("type" in i ? "total" : i.id)}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onViewableItemsChanged={onViewableItemsChanged}
              viewabilityConfig={viewabilityConfig}
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
              accountId={activeAccountId}
              scope={widgetScope}
              onSeeAllPress={() => {
                router.push(
                  activeAccountId
                    ? { pathname: "/records", params: { accountId: activeAccountId } }
                    : "/records",
                );
              }}
            />

            <SpendingInsidesWidget
              accountId={activeAccountId}
              scope={widgetScope}
              onShowMore={() => {
                router.push(
                  activeAccountId
                    ? {
                        pathname: "/spending-insights",
                        params: { accountId: activeAccountId },
                      }
                    : "/spending-insights",
                );
              }}
            />

            <IncomeInsightsWidget
              accountId={activeAccountId}
              scope={widgetScope}
              onShowMore={() => {
                router.push(
                  activeAccountId
                    ? {
                        pathname: "/income-insights",
                        params: { accountId: activeAccountId },
                      }
                    : "/income-insights",
                );
              }}
            />

            <BalanceTrendWidget
              accountId={activeAccountId}
              onShowMore={() => {
                router.push(
                  activeAccountId
                    ? { pathname: "/balance-trend", params: { accountId: activeAccountId } }
                    : "/balance-trend",
                );
              }}
            />

            <ExpenseMapWidget
              accountId={
                pages[pageIndex] && "id" in pages[pageIndex]
                  ? pages[pageIndex].id
                  : undefined
              }
              setScrollEnabled={setScrollEnabled}
            />
          </ScrollView>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Dashboard;
