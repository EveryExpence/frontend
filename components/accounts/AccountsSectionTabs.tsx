import { Colors } from "@/constants/theme";
import { usePathname, useRouter } from "expo-router";
import { Pressable, Text, useColorScheme, View } from "react-native";

type SectionKey = "accounts" | "payments" | "categories";
type SectionPath =
    | "/accounts"
    | "/accounts/payments"
    | "/accounts/categories";

const sections: Array<{ key: SectionKey; label: string; path: SectionPath }> = [
    { key: "accounts", label: "Accounts", path: "/accounts" },
    { key: "payments", label: "Payments", path: "/accounts/payments" },
    { key: "categories", label: "Categories", path: "/accounts/categories" },
];

export default function AccountsSectionTabs() {
    const router = useRouter()
    const pathname = usePathname();
    const scheme = useColorScheme() ?? "light";
    const colors = Colors[scheme];

    return (
        <View className="flex-row flex-nowrap gap-2 rounded-2xl bg-theme-surface p-1.5">
            {sections.map((section) => {
                const isActive = pathname === section.path || pathname === `/${section.key}`;

                return (
                    <Pressable
                        key={section.key}
                        className={`flex-1 rounded-xl px-2.5 py-2.5 ${isActive ? "bg-theme-tint" : "bg-transparent"}`}
                        accessibilityRole="button"
                        accessibilityState={{ selected: isActive }}
                        onPress={() => router.push(section.path)}
                    >
                        <Text
                            numberOfLines={1}
                            className={`text-center text-[15px] font-semibold leading-5 ${isActive ? "text-theme-textLight" : "text-theme-textDark"}`}
                            style={!isActive ? { color: colors.textDark } : undefined}
                        >
                            {section.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}