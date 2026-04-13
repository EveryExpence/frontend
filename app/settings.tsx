import React from "react";
import {View, Text, SectionList} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

const DATA = [
    {
        title: "Account",
        data: [
            {title: 'Name', icon: ''},
        ],
    },
    
    {
        title: "Preferences",
        data: [
            {title: 'Language', icon: ''},
            {title: 'Theme', icon: ''},
        ]
    },

    {
        title: "Notifications",
        data: [
            {title: 'Push Notifications', icon: ''},
        ]
    },

    {
        title: "Security",
        data: [
            {title: 'Change Password', icon: ''}, 
            {title: 'Log Out', icon: ''},
        ]
    },
]

const SettingsScreen = () => {
  return ( 
    <SafeAreaProvider >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
            <SectionList
                sections={DATA}
                keyExtractor={(item, index) => item.title + index}
                renderSectionHeader = { ({section: {title}}) => ( 
                    <Text className= "text-3xl text-black font-semibold pl-4">{ title }</Text> 
                )}
                renderItem = { ({item}) => (
                    <View style={{height: 100, backgroundColor: '#c9cccf', marginHorizontal: 16, borderRadius: 5}}>
                        <Text className= "text-2xl pl-2 text-black py-7 font-semibold">{ item.title }</Text>
                    </View>
                )}

                ItemSeparatorComponent = {() => (
                    <View style={{ height: 1, backgroundColor: '#333', marginHorizontal: 26 }} />
                )}

                SectionSeparatorComponent = {() => (
                    <View style={{ height: 15, backgroundColor: '#ffffff' }} />
                )}
            />
        </SafeAreaView>
    </SafeAreaProvider>

  );
}

export default SettingsScreen
