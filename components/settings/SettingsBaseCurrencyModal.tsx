import React, { Dispatch, SetStateAction, useMemo } from "react";
import { View, Text } from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Colors } from "@/constants/theme";
import CustomModal from "@/components/Modal";
import { CURRENCIES } from "@/constants/currencies";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useTranslation } from "react-i18next";

type Props = {
  isVisible: boolean;
  setIsVisible: Dispatch<SetStateAction<boolean>>;
  baseCurrency: string;
  onSelect: (code: string) => void;
};

const SettingsBaseCurrencyModal: React.FC<Props> = ({
  isVisible,
  setIsVisible,
  baseCurrency,
  onSelect,
}) => {
  const scheme = useColorScheme() ?? "light";
  const colors = Colors[scheme];
  const { t } = useTranslation();

  const options = useMemo(
    () =>
      CURRENCIES.map((c) => ({
        label: `${c.code} (${c.symbol}) - ${c.name}`,
        value: c.code,
      })),
    [],
  );

  return (
    <CustomModal
      isVisible={isVisible}
      setIsVisible={setIsVisible}
      title={t("settings.select_base_currency")}
      showCloseIcon
    >
      <View className="gap-3 mt-2">
        <Text className="text-sm text-theme-icon">
          {t("settings.base_currency_hint")}
        </Text>
        <Dropdown
          style={{
            backgroundColor: colors.background,
            padding: 12,
            borderRadius: 6,
          }}
          containerStyle={{
            backgroundColor: colors.surface,
            borderColor: colors.icon,
          }}
          activeColor={colors.tint}
          itemTextStyle={{ color: colors.text }}
          selectedTextStyle={{ fontSize: 17, color: colors.text }}
          placeholderStyle={{ fontSize: 17, color: colors.icon, opacity: 0.5 }}
          inputSearchStyle={{ fontSize: 17, color: colors.text }}
          data={options}
          search
          maxHeight={300}
          labelField="label"
          valueField="value"
          placeholder={t("accounts.select_currency")}
          searchPlaceholder={t("accounts.search_currency")}
          value={baseCurrency}
          onChange={(item) => {
            onSelect(item.value);
            setIsVisible(false);
          }}
        />
      </View>
    </CustomModal>
  );
};

export default SettingsBaseCurrencyModal;
