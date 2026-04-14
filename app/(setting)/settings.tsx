import React, {useState} from "react";
import {View, Text, SectionList, TouchableOpacity, Switch} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { CiGlobe, CiLock, CiBellOn } from "react-icons/ci";
import { IoIosColorFilter, IoIosLogOut } from "react-icons/io";
import { MdKeyboardArrowRight } from "react-icons/md";
import { useRouter } from 'expo-router';
import { PiUserCircle } from "react-icons/pi";

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
      { title: "Kowalus", email: "ananas@edu.p.lodz.pl", icon: PiUserCircle, type: "profile" },
    ],
  },

  {
    title: "Preferences",
    data: [
      { title: "Language", icon: CiGlobe, type: "language" },
      { title: "Theme", icon: IoIosColorFilter, type: "theme" },
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
                    className= "text-2xl text-black font-semibold pl-4"
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
                        className="h-[80px] bg-[#e3e3ed] mx-4  flex-row items-center px-3 justify-between"   
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
                                <Icon size={60} className="mr-3" />
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
                                    <Switch 
                                    trackColor={{false: '#767577', true: '#81b0ff'}}
                                    thumbColor={currentNotifications ? '#fffffd' : '#f4f3f4'}
                                    value={currentNotifications} />
                                )}
                            </View>

                        </TouchableOpacity>
                    );
                }}

                ItemSeparatorComponent = {() => (
                    <View style={{ height: 1, backgroundColor: '#333', marginHorizontal: 17 }} />
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
