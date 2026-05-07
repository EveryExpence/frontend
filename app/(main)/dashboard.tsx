import React from "react";
import { FlatList, View, Dimensions, ActivityIndicator } from "react-native";
import { Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { useSQLiteContext } from "expo-sqlite";
import {
  getAllAccounts as getAllLocalAccounts,
  getAccountBalance,
} from "@/data/accounts";
import { Account } from "@/types/data/account";

const { width } = Dimensions.get("window");

type AccountWithComputed = Account & { computedBalance: number };

const Dashboard = () => {
  const colorScheme: "light" | "dark" = useColorScheme() ?? "light";
  const colors = Colors[colorScheme];
  const textColor = colorScheme === 'dark' ? colors.textLight : colors.text;

  const [accounts, setAccounts] = React.useState<AccountWithComputed[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pageIndex, setPageIndex] = React.useState(0);

  const db = useSQLiteContext();

  const fetchAccounts = React.useCallback(async () => {
    if (!db) return;
    try {
      setLoading(true);
      setError(null);

      const localAccounts = await getAllLocalAccounts(db);
      const accountsWithBalances: AccountWithComputed[] = await Promise.all(
        localAccounts.map(async (a) => {
          try {
            const computed = await getAccountBalance(db, a.id);
            return {
              ...a,
              computedBalance: Number(computed ?? a.balance ?? 0),
            };
          } catch {
            return { ...a, computedBalance: Number(a.balance ?? 0) };
          }
        }),
      );

      setAccounts(accountsWithBalances);
    } catch (e: any) {
      setError(e?.message ?? String(e));
    } finally {
      setLoading(false);
    }
  }, [db]);

  React.useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const totalsByCurrency = React.useMemo(() => {
    const map: Record<string, number> = {};
    accounts.forEach((a) => {
      map[a.currency] = (map[a.currency] || 0) + (a.computedBalance ?? 0);
    });
    return map;
  }, [accounts]);

  const pages: Array<{ type: "total" } | AccountWithComputed> = [
    { type: "total" },
    ...accounts,
  ];

  const onMomentumScrollEnd = (e: any) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / width);
    setPageIndex(newIndex);
  };

  const formatCurrency = (value: number, currency: string) => {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(value);
    } catch {
      return `${value.toFixed(2)} ${currency}`;
    }
  };

  const renderPage = ({ item }: { item: any }) => {
    if (item.type === "total") {
      return (
        <View style={{ width, padding: 24 }}>
          <Text style={{ color: textColor }} className="text-2xl mb-6">
            Total Balance
          </Text>

          {Object.keys(totalsByCurrency).length === 0 ? (
            <Text style={{ color: textColor }}>No accounts</Text>
          ) : (
            Object.entries(totalsByCurrency).map(([currency, value]) => (
              <Text key={currency} style={{ color: textColor }} className="text-4xl mb-2">
                {formatCurrency(value, currency)}
              </Text>
            ))
          )}
        </View>
      );
    }

    return (
      <View style={{ width, padding: 24 }}>
        <Text style={{ color: textColor }} className="text-xl mb-2">{item.name}</Text>
        <Text style={{ color: textColor }} className="text-3xl">
          {formatCurrency(item.computedBalance ?? item.balance, item.currency)}
        </Text>
        <Text style={{ color: textColor }} className="text-sm mt-2">
          {item.createdAt ? `Created: ${new Date(item.createdAt).toLocaleDateString()}` : null}
        </Text>
      </View>
    );
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
                      backgroundColor: i === pageIndex ? colors.tint : colors.icon,
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
