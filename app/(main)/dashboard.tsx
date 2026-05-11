import React from "react";
import {
  FlatList,
  View,
  Dimensions,
  ActivityIndicator,
  Animated,
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

const { width } = Dimensions.get("window");

type AccountWithComputed = Account & { computedBalance: number };

const Dashboard = () => {
  const colorScheme: "light" | "dark" = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const textColor = colorScheme === "dark" ? colors.textLight : colors.text;

  const { accounts, loading, error, totalsByCurrency } = useAccountsData();
  const [pageIndex, setPageIndex] = React.useState(0);
  const animatedIndex = React.useRef(new Animated.Value(0)).current;

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

            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                paddingVertical: 12,
              }}
            >
              {pages.map((_, i) => {
                const dotWidth = animatedIndex.interpolate({
                  inputRange: [i - 1, i, i + 1],
                  outputRange: [8, 64, 8],
                  extrapolate: "clamp",
                });

                return (
                  <Animated.View
                    key={i}
                    style={{
                      width: dotWidth,
                      height: 8,
                      borderRadius: 8,
                      backgroundColor:
                        i === pageIndex ? colors.tint : "#FFFFFF",
                      marginHorizontal: 4,
                    }}
                  />
                );
              })}
            </View>
          </View>
        )}
      </SafeAreaView>
    </LinearGradient>
  );
};

export default Dashboard;
