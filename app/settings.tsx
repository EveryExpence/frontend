import React from "react";
import {View, Text, SectionList, Pressable, Switch} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { CiGlobe, CiLock, CiUser, CiBellOn } from "react-icons/ci";
import { IoIosColorFilter, IoIosLogOut } from "react-icons/io";
import { MdKeyboardArrowRight } from "react-icons/md";

type ItemType = "list" | "switch" | "logout";

type Item = {
  title: string;
  icon: any;
  type: ItemType;
};

const DATA: {
  title: string;
  data: Item[];
}[] = [
  {
    title: "Account",
    data: [
      { title: "Name", icon: CiUser, type: "list" },
    ],
  },

  {
    title: "Preferences",
    data: [
      { title: "Language", icon: CiGlobe, type: "list" },
      { title: "Theme", icon: IoIosColorFilter, type: "list" },
    ],
  },

  {
    title: "Notifications",
    data: [
      { title: "Push Notifications", icon: CiBellOn, type: "switch" },
    ],
  },

  {
    title: "Security",
    data: [
      { title: "Change Password", icon: CiLock, type: "list" },
      { title: "Log Out", icon: IoIosLogOut, type: "logout" },
    ],
  },
];

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
                renderItem = { ({item}) => {
                    const Icon = item.icon;

                    return (
                        <Pressable className="h-[80px] bg-[#e3e3ed] mx-4 rounded-md flex-row items-center px-3 justify-between">
                            <View className="flex-row items-center">
                                <Icon size={40} className="mr-3" />
                                <Text className={`text-xl font-semibold ${item.type === "logout" ? "text-red-600" : "text-black"}`}>
                                    {item.title}
                            </Text>

                            </View>
                            {item.type === "list" && (
                                <MdKeyboardArrowRight size={35}/>
                            )}

                            {item.type === "switch" && (
                                <Switch value={false} />
                            )}
                        </Pressable>
                    );
                }}

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
