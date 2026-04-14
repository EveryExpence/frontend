import React, {useState} from "react";
import {View, Text, SectionList, TouchableOpacity} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from 'expo-router';


type ItemType = "password" | "switch" | "logout" | "language" | "theme" | "profile";
type language = "eng" | "pl"
type theme = "light" | "dark"

type Item = {
  title: string;
  email?: string;
    icon: string;
  type: ItemType;
};

const DATA: {
  title: string;
  data: Item[];
}[] = [
  {
    title: "Account",
    data: [
            { title: "Kowalus", email: "ananas@edu.p.lodz.pl", icon: "person-outline", type: "profile" },
    ],
  },

  {
    title: "Preferences",
    data: [
            { title: "Language", icon: "language-outline", type: "language" },
            { title: "Theme", icon: "contrast-outline", type: "theme" },
    ],
  },

  {
    title: "Notifications",
    data: [
            { title: "Push Notifications", icon: "notifications-outline", type: "switch" },
    ],
  },

  {
    title: "Security",
    data: [
            { title: "Change Password", icon: "lock-closed-outline", type: "password" },
            { title: "Log Out", icon: "log-out-outline", type: "logout" },
    ],
  },
];

const SettingsScreen = () => {
    const router = useRouter()
    const [currentLanguage, setLanguage] = useState<language>("eng") // current language
    const [currentTheme, setTheme] = useState<theme>("light") // current theme
    const [currentNotifications, setNotifications ] = useState(true) // notifications state

    const toggleNotifications = () => {
        setNotifications(previousState => !previousState)
    }

    const toggleTheme = () => {
        setTheme(prev => (prev === "light" ? "dark" : "light"))
    }

    const toggleLanguage = () => {
        setLanguage(prev => (prev === "eng" ? "pl" : "eng"))
    }

    const toggleLogOut = () => {
        router.push("/login")
    }

    const pushToChangePass = () => {
        router.push("/change-password")
    }

    const pushToProfile = () => {
        router.push("/profile")
    }
    
    return ( 
    <SafeAreaProvider >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
            <SectionList
                style={{marginTop: 25}}
                sections={DATA}
                keyExtractor={(item, index) => item.title + index}
                renderSectionHeader = { ({section: {title}}) => ( 
                    <Text 
                    className= "text-2xl text-black font-bold pl-4"
                    selectable={false}
                    >
                        { title } 
                    </Text> 
                )}
                renderItem = { ({item, index, section}) => {
                    const isFirst = index === 0;
                    const isLast = index === section.data.length - 1;

                    const cornerStyle = isFirst
                        ? "rounded-t-xl"
                        : isLast
                            ? "rounded-b-xl"
                            : "rounded-none";

                    return (
                        <TouchableOpacity 
                        activeOpacity={0.8}
                        className={`h-[80px] bg-[#e3e3ed] mx-4 flex-row items-center px-3 justify-between ${cornerStyle}`}
                        onPress = {() => {
                                if(item.type === "language"){
                                    toggleLanguage()
                                }
                                if(item.type === "logout"){
                                    toggleLogOut()
                                }
                                if(item.type === "switch"){
                                    toggleNotifications()
                                }
                                if(item.type === "theme"){
                                    toggleTheme()
                                }
                                if(item.type === "profile"){
                                    pushToProfile()
                                }
                                if(item.type === "password"){
                                    pushToChangePass()
                                }
                            }
                        }
                        >
                            <View className="flex-row items-center">
                                {item.type === "profile" ? (
                                <View className="w-14 h-14 rounded-full bg-white mr-3 items-center justify-center overflow-hidden">
                                    <Ionicons name={item.icon as any} size={40} color="#000000" />
                                </View>
                                ) : (
                                <View style={{ marginRight: 12 }}>
                                    <Ionicons
                                        name={item.icon as any}
                                        size={30}
                                        color={item.type === "logout" ? "#dc2626" : "#000000"}
                                    />
                                </View>
                                )}
                                <View>
                                    <Text
                                        className={`text-xl font-bold ${
                                        item.type === "logout" ? "text-red-600" : "text-black"
                                        }`}
                                        selectable={false}
                                    >
                                        {item.title}
                                    </Text>

                                    {item.type === "profile" && (
                                        <Text className="text-base text-gray-500 mt-1 font-semibold" selectable={false}>
                                            {item.email}
                                        </Text>
                                    )}
                                </View>
                            </View>

                            <View 
                            className="flex-row items-center"
                            >
                                {(item.type === "profile" || item.type === "password") && // wraper for multiple components
                                    <Ionicons name="chevron-forward" size={28} color="#000000" /> 
                                }

                                {item.type === "language" && 
                                    <React.Fragment>  
                                        <Text 
                                        className="text-xl font-semibold text-gray-400"
                                        selectable={false}
                                        > 
                                            {currentLanguage === "eng" ? "English" : "Polish"} 
                                        </Text>

                                        <Ionicons name="chevron-forward" size={28} color="#000000" /> 
                                    </React.Fragment>
                                }

                                {item.type === "theme" && 
                                    <React.Fragment>  
                                        <Text 
                                        className="text-xl font-semibold text-gray-400"
                                        selectable={false}
                                        > 
                                            {currentTheme === "light" ? "Light" : "Dark"} 
                                        </Text>
                                        
                                        <Ionicons name="chevron-forward" size={28} color="#000000" /> 
                                    </React.Fragment>
                                }

                                {item.type === "switch" && (
                                    <View
                                    className={`w-12 h-6 rounded-full px-1 justify-center ${
                                        currentNotifications ? "bg-blue-500" : "bg-gray-400"
                                    }`}
                                    >
                                        <View
                                        className={`w-6 h-5 rounded-full bg-white ${
                                            currentNotifications ? "self-end" : "self-start"
                                        }`}
                                        />
                                    </View>
                                )}
                            
                                
                            </View>

                            {!isLast && (
                                <View className="absolute bottom-0 left-6 right-6 h-px bg-[#8e8e98]" />
                            )}

                        </TouchableOpacity>
                    );
                }}

                SectionSeparatorComponent = {() => (
                    <View style={{ height: 10, backgroundColor: '#ffffff' }} />
                )}
            />
        </SafeAreaView>
    </SafeAreaProvider>

    );
}

export default SettingsScreen
