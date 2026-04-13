import React from "react";
import {View, Text, SectionList} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const DATA = [
    {
        title: "Account",
        data: ['Name'],
    },
    
    {
        title: "Preferences",
        data: ['Language', 'Theme']
    },

    {
        title: "Notifications",
        data: ['Push Notifications']
    },

    {
        title: "Security",
        data: ['Change Password', 'Log Out']
    },
]

const SettingsScreen = () => {
  return ( 
    <SafeAreaProvider >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
            <SectionList
                sections={DATA}
                keyExtractor={(item, index) => item + index}
                renderSectionHeader = { ({section: {title}}) => ( 
                    <Text className= "text-3xl pl-2 text-theme-text text-black font-semibold">{ title }</Text> 
                )}
                renderItem = { ({item}) => (
                    <View style={{height: 100, backgroundColor: '#c9cccf'}}>
                        <Text className= "text-2xl pl-2 text-theme-text text-black py-7 font-semibold">{ item }</Text>
                    </View>
                )}

                ItemSeparatorComponent = {() => (
                    <View style={{ height: 1, backgroundColor: '#333', marginHorizontal: 10 }} />
                )}
            />
        </SafeAreaView>
    </SafeAreaProvider>

  );
}

export default SettingsScreen
