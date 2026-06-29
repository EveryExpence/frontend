import React from 'react';
import { ScrollView, TouchableOpacity, StyleSheet, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '@/context/themeContext';
import { Colors } from '@/constants/theme';

type Props = {
    icons: string[];
    selectedIcon: string;
    onSelect: (icon: string) => void;
};

export default function IconPicker({ icons, selectedIcon, onSelect }: Props) {
    const { theme } = useTheme();
    const colors = Colors[theme];

    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {icons.map((icon) => (
                    <TouchableOpacity
                        accessible
                        accessibilityRole="button"
                        accessibilityLabel={`Select icon ${icon}`}
                        key={icon}
                        onPress={() => onSelect(icon)}
                        style={[
                            styles.iconContainer,
                            { 
                                backgroundColor: selectedIcon === icon ? colors.tint : colors.surface,
                                borderColor: selectedIcon === icon ? colors.tint : colors.surface
                            }
                        ]}
                    >
                        <MaterialCommunityIcons 
                            name={icon as any} 
                            size={24} 
                            color={selectedIcon === icon ? colors.textLight : colors.text} 
                        />
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 16,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    }
});
