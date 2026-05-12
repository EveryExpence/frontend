import { View, Text, TouchableOpacity } from 'react-native'
import React, { Dispatch, SetStateAction, useState } from 'react'
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface Props {
    selectedDateTime: Date;
    setSelectedDateTime: Dispatch<SetStateAction<Date>>;
}

const DateTimeSelection = ({ selectedDateTime, setSelectedDateTime }: Props) => {
    const scheme = useColorScheme() ?? 'light';
    const colors = Colors[scheme];
    const [showDateSelection, setShowDateSelection] = useState(false);
    const [showTimeSelection, setShowTimeSelection] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedTime, setSelectedTime] = useState<Date>(new Date());

    return (
        <View className="mb-8">
            <Text className="text-2xl text-theme-text font-bold">Expense timestamp</Text>

            <TouchableOpacity
                onPress={() => setShowDateSelection(true)}
                className="bg-theme-surface py-4 px-3 rounded-md flex-row items-center gap-2"
            >
                <MaterialCommunityIcons name="clock" size={20} color={colors.text} />
                <Text className="text-xl text-theme-text pl-5">{selectedDateTime.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })} </Text>
            </TouchableOpacity>

            {showDateSelection ?
                <DateTimePicker
                    display="calendar"
                    mode="date"
                    value={selectedDate}
                    onValueChange={(_, value) => {
                        setSelectedDate(value);
                        setSelectedDateTime(value)
                        setShowDateSelection(false);
                        setShowTimeSelection(true);
                    }}
                    onDismiss={() => {
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
                    onValueChange={(_, value) => {
                        setSelectedTime(value);
                        setSelectedDateTime(prev => {
                            const newDate = new Date(prev);
                            newDate.setHours(value.getHours());
                            newDate.setMinutes(value.getMinutes());
                            return newDate;
                        })
                        setShowTimeSelection(false);
                    }}
                    onDismiss={() => setShowTimeSelection(false)}
                /> : <></>}
        </View>
    )
}

export default DateTimeSelection