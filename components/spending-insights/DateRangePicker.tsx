import React, { useState } from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";

interface DateRangePickerProps {
    startDate: Date;
    endDate: Date;
    onStartDateChange: (date: Date) => void;
    onEndDateChange: (date: Date) => void;
    backgroundColor: string;
    textColor: string;
    iconColor: string;
}

function formatDateDisplay(date: Date): string {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
}

export function DateRangePicker({
    startDate,
    endDate,
    onStartDateChange,
    onEndDateChange,
    backgroundColor,
    textColor,
    iconColor,
}: DateRangePickerProps) {
    const [showStartPicker, setShowStartPicker] = useState(false);
    const [showEndPicker, setShowEndPicker] = useState(false);

    return (
        <>
            <View
                className="flex-row items-stretch mb-6"
                style={{
                    backgroundColor,
                    borderRadius: 3,
                    overflow: "hidden",
                }}
            >
                <View
                    style={{
                        paddingHorizontal: 10,
                        justifyContent: "center",
                        alignItems: "center",
                        borderRightWidth: 1,
                        borderRightColor: textColor,
                    }}
                >
                    <MaterialCommunityIcons
                        name="calendar-month"
                        size={20}
                        color={iconColor}
                    />
                </View>

                <TouchableOpacity
                    onPress={() => setShowStartPicker(true)}
                    style={{
                        flex: 1,
                        paddingVertical: 10,
                        justifyContent: "center",
                        alignItems: "center",
                        borderRightWidth: 1,
                        borderRightColor: textColor,
                    }}
                >
                    <Text style={{ color: textColor, fontSize: 15, fontWeight: "600" }}>
                        {formatDateDisplay(startDate)}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setShowEndPicker(true)}
                    style={{
                        flex: 1,
                        paddingVertical: 10,
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Text style={{ color: textColor, fontSize: 15, fontWeight: "600" }}>
                        {formatDateDisplay(endDate)}
                    </Text>
                </TouchableOpacity>
            </View>

            {showStartPicker && (
                <DateTimePicker
                    display="calendar"
                    mode="date"
                    value={startDate}
                    onChange={(event, value) => {
                        if (Platform.OS !== "ios") { setShowStartPicker(false); }
                        if (event.type === "dismissed") { return; }
                        if (!value) { return; }
                        onStartDateChange(value);
                    }}
                />
            )}

            {showEndPicker && (
                <DateTimePicker
                    display="calendar"
                    mode="date"
                    value={endDate}
                    onChange={(event, value) => {
                        if (Platform.OS !== "ios") { setShowEndPicker(false); }
                        if (event.type === "dismissed") { return; }
                        if (!value) { return; }
                        const eod = new Date(value);
                        eod.setHours(23, 59, 59, 999);
                        onEndDateChange(eod);
                    }}
                />
            )}
        </>
    );
}
