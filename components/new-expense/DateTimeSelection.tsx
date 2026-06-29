import { View, Text, TouchableOpacity, useColorScheme } from 'react-native'
import React, { Dispatch, SetStateAction, useState } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '@/constants/theme';
import { useTranslation } from 'react-i18next';

interface Props {
    selectedDateTime: Date;
    setSelectedDateTime: Dispatch<SetStateAction<Date>>;
    disabled?: boolean;
}

const DateTimeSelection = ({ selectedDateTime, setSelectedDateTime, disabled }: Props) => {
    const { t, i18n } = useTranslation();
    const scheme = useColorScheme() ?? 'light';
    const colors = Colors[scheme];
    const [showDateSelection, setShowDateSelection] = useState(false);
    const [showTimeSelection, setShowTimeSelection] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<Date>(new Date());

    return (
        <View className="mb-8">
            <Text className="text-2xl text-theme-text font-bold">{t("new_expense.date")}</Text>

            <TouchableOpacity
                accessible
                accessibilityRole="button"
                accessibilityLabel={t("new_expense.date")}
                accessibilityHint="Double tap to change the date and time"
                onPress={() => disabled ? null : setShowDateSelection(true)}
                activeOpacity={disabled ? 1 : 0.2}
                className="bg-theme-surface py-4 px-3 rounded-md flex-row items-center gap-2"
            >
                <MaterialCommunityIcons name="clock" size={20} color={colors.text} />
                <Text className="text-xl text-theme-text pl-5">{selectedDateTime.toLocaleDateString(i18n.language, { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })} </Text>
            </TouchableOpacity>

            {showDateSelection ?
                <DateTimePicker
                    display="calendar"
                    mode="date"
                    value={selectedDate}
                    onChange={(event, value) => {
                        if (event.type === 'dismissed') {
                            setShowDateSelection(false);
                            setShowTimeSelection(true);
                            return;
                        }
                        if (!value) { return; }
                        setSelectedDate(value);
                        setSelectedDateTime(value)
                        setShowDateSelection(false);
                        setShowTimeSelection(true);
                    }}
                    maximumDate={new Date()}
                /> : <></>}

            {showTimeSelection ?
                <DateTimePicker
                    display="clock"
                    mode="time"
                    value={selectedTime}
                    onChange={(event, value) => {
                        if (event.type === 'dismissed') {
                            setShowTimeSelection(false);
                            return;
                        }
                        if (!value) { return; }
                        setSelectedTime(value);
                        setSelectedDateTime(prev => {
                            const newDate = new Date(prev);
                            newDate.setHours(value.getHours());
                            newDate.setMinutes(value.getMinutes());
                            return newDate;
                        })
                        setShowTimeSelection(false);
                    }}
                /> : <></>}
        </View>
    )
}

export default DateTimeSelection