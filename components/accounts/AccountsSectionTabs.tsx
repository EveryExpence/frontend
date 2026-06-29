import { Colors } from "@/constants/theme";
import { usePathname, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "@/context/themeContext";

type SectionKey = "accounts" | "payments" | "categories";
type SectionPath =
    | "/accounts"
    | "/accounts/payments"
    | "/accounts/categories";

export default function AccountsSectionTabs() {
    const { t } = useTranslation();
    const router = useRouter()
    const pathname = usePathname();
    const { theme } = useTheme();
    const colors = Colors[theme];

    const sections: { key: SectionKey; label: string; path: SectionPath }[] = [
        { key: "accounts", label: t("tabs.accounts"), path: "/accounts" },
        { key: "payments", label: t("tabs.payments"), path: "/accounts/payments" },
        { key: "categories", label: t("tabs.categories"), path: "/accounts/categories" },
    ];

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
                        onPress={() => router.replace(section.path)}
                    >
                        <Text
                            numberOfLines={1}
                            className={`text-center text-[15px] font-semibold leading-5 ${isActive ? "text-theme-textLight" : "text-theme-text"}`}
                            style={!isActive ? { opacity: 0.6 } : undefined}
                        >
                            {section.label}
                        </Text>
                    </Pressable>
                );
            })}
        </View>
    );
}