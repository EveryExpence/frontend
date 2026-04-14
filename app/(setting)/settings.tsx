import React, {useState, useRef} from "react";
import {View, Text, SectionList, TouchableOpacity, Switch, Animated} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { CiGlobe, CiLock, CiUser, CiBellOn } from "react-icons/ci";
import { IoIosColorFilter, IoIosLogOut } from "react-icons/io";
import { MdKeyboardArrowRight } from "react-icons/md";
import { useRouter } from 'expo-router';

type ItemType = "default" | "switch" | "logout" | "language" | "theme";
type language = "eng" | "pl"
type theme = "light" | "dark"

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
      { title: "Name", icon: CiUser, type: "default" },
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
      { title: "Change Password", icon: CiLock, type: "default" },
      { title: "Log Out", icon: IoIosLogOut, type: "logout" },
    ],
  },
];

const SettingsScreen = () => {
    const router = useRouter()
    const [currentLanguage, setLanguage] = useState<language>("eng") // current language
    const [currentTheme, setTheme] = useState<theme>("light") // current theme
    const [currentNotifications, setNotifications ] = useState(true) // notifications state
    const scaleAnims = useRef<{[key: string]: Animated.Value}>({}) 

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
        <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }} edges={['top']}>
            <SectionList
                sections={DATA}
                keyExtractor={(item, index) => item.title + index}
                renderSectionHeader = { ({section: {title}}) => ( 
                    <Text 
                    className= "text-3xl text-black font-semibold pl-4"
                    selectable={false}
                    >
                        { title } 
                    </Text> 
                )}
                renderItem = { ({item, index}) => {
                    const Icon = item.icon;
                    const key = `${item.title}-${index}`;
                    if (!scaleAnims.current[key]) {
                        scaleAnims.current[key] = new Animated.Value(1);
                    }
                    const scaleAnim = scaleAnims.current[key];

                    const animatePress = () => {
                        Animated.sequence([
                            Animated.timing(scaleAnim, {
                                toValue: 0.95,
                                duration: 100,
                                useNativeDriver: false
                            }),
                            Animated.timing(scaleAnim, {
                                toValue: 1,
                                duration: 100,
                                useNativeDriver: false
                            })
                        ]).start();
                    };

                    return (
                        <TouchableOpacity 
                        activeOpacity={0.8}
                        className="h-[80px] bg-[#e3e3ed] mx-4 rounded-md flex-row items-center px-3 justify-between"   
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
                                if(item.type === "default"){
                                    {item.title === "Name" ? pushToProfile() : pushToChangePass()}
                                }
                            }
                        }
                        >
                            <View className="flex-row items-center">
                                <Icon size={40} className="mr-3" />
                                <Text 
                                className={`text-xl font-semibold ${item.type === "logout" ? "text-red-600" : "text-black"}`}
                                selectable={false}
                                >
                                    {item.title}
                                </Text>
                            </View>

                            <View 
                            className="flex-row items-center"
                            >
                                {item.type === "default" && // wraper for multiple components
                                    <MdKeyboardArrowRight size={35}/> 
                                }

                                {item.type === "language" && // wraper for multiple components
                                    <React.Fragment>  
                                        <Text 
                                        className="text-xl font-semibold text-gray-400"
                                        selectable={false}
                                        > 
                                            {currentLanguage == "eng" ? "English" : "Polish"} 
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
                                            {currentTheme == "light" ? "Light" : "Dark"} 
                                        </Text>
                                        
                                        <MdKeyboardArrowRight size={35}/> 
                                    </React.Fragment>
                                }

                                {item.type === "switch" && (
                                    <Switch 
                                    trackColor={{false: '#767577', true: '#81b0ff'}}
                                    thumbColor={currentNotifications ? '#f5dd4b' : '#f4f3f4'}
                                    value={currentNotifications} />
                                )}
                            </View>

                        </TouchableOpacity>
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
