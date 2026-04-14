import React, {useState} from "react";
import {View, Text, SectionList, TouchableOpacity} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { CiGlobe, CiLock, CiBellOn } from "react-icons/ci";
import { IoIosLogOut } from "react-icons/io";
import { MdKeyboardArrowRight } from "react-icons/md";
import { useRouter } from 'expo-router';
import { VscColorMode } from "react-icons/vsc";
import { FiUser } from "react-icons/fi";


type ItemType = "password" | "switch" | "logout" | "language" | "theme" | "profile";
type language = "eng" | "pl"
type theme = "light" | "dark"

type Item = {
  title: string;
  email?: string;
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
      { title: "Kowalus", email: "ananas@edu.p.lodz.pl", icon: FiUser, type: "profile" },
    ],
  },

  {
    title: "Preferences",
    data: [
      { title: "Language", icon: CiGlobe, type: "language" },
      { title: "Theme", icon: VscColorMode, type: "theme" },
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
      { title: "Change Password", icon: CiLock, type: "password" },
      { title: "Log Out", icon: IoIosLogOut, type: "logout" },
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
                renderItem = { ({item, index}) => {
                    const Icon = item.icon;

                    return (
                        <TouchableOpacity 
                        activeOpacity={0.8}
                        className="h-[80px] bg-[#e3e3ed] mx-4 rounded-2xl flex-row items-center px-3 justify-between"   
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
                                    <Icon size={40} color="#000000" />
                                </View>
                                ) : (
                                <Icon size={40} className="mr-3" />
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
                                    <MdKeyboardArrowRight size={35}/> 
                                }

                                {item.type === "language" && 
                                    <React.Fragment>  
                                        <Text 
                                        className="text-xl font-semibold text-gray-400"
                                        selectable={false}
                                        > 
                                            {currentLanguage === "eng" ? "English" : "Polish"} 
                                        </Text>

                                        <MdKeyboardArrowRight size={35}/> 
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
                                        
                                        <MdKeyboardArrowRight size={35}/> 
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

                        </TouchableOpacity>
                    );
                }}

                ItemSeparatorComponent = {() => (
                    <View style={{ height: 8, backgroundColor: 'transparent' }} />
                    
                )}

                SectionSeparatorComponent = {() => (
                    <View style={{ height: 10, backgroundColor: '#ffffff' }} />
                )}
            />
        </SafeAreaView>
    </SafeAreaProvider>

    );
}

export default SettingsScreen
