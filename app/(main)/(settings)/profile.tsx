import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {Controller, useForm} from 'react-hook-form';
import { useThemeColor } from "@/hooks/use-theme-color";
import Toast from 'react-native-toast-message';
import { updateUserEmail, updateUserName } from '@/context/userContext'
import EncryptedStorage from "react-native-encrypted-storage";
import { accessTokenKey } from "@/constants/encryptedStorageKeys";
import { getUserData } from '@/context/authContext'

const ProfileScreen = () => {
  const { control, handleSubmit, reset, formState: {errors} } = useForm({
    defaultValues:{
      userName: "",
      email: "",
    }
  });

  const iconColor = useThemeColor({}, "icon");
  const [isEditing, setIsEditing] = useState(false)
  const [displayUserName, setDisplayUserName] = useState("")
  const [displayEmail, setDisplayEmail] = useState("")

  const loadUser = async () => {
    try{
      const token = await EncryptedStorage.getItem(accessTokenKey)

      if (!token) throw new Error("No access token");

      const data = await getUserData(token)

      const nextUserName = data.publicUsername || "";
      const nextEmail = data.email || "";

      reset({
        userName: nextUserName,
        email: nextEmail,
      });

      setDisplayUserName(nextUserName);
      setDisplayEmail(nextEmail);

    }catch(err){
      console.error(err)
    }
  }

  useEffect(() =>{
    loadUser()
  }, []);

  const handleUpdate = async (email: string, userName: string) => {
    try{
      const token = await EncryptedStorage.getItem(accessTokenKey)

      if (!token) throw new Error("No access token");

      await Promise.all([
        updateUserEmail(token, email),
        updateUserName(token, userName)
      ]);

      await loadUser();
      setDisplayUserName(userName);
      setDisplayEmail(email);
    }catch (err: any){
      console.error(err);
      Toast.show({ 
        text1: err?.message || "Something went wrong", 
        type: "error" 
      });
    }
  }

  return (
    <View
      className="px-6 pt-10 bg-theme-background"
    >
      <View className="items-center mb-8">
        <View
          className="items-center justify-center rounded-full bg-theme-surface"
          style={{ width: 100, height: 100 }}
        >
          <Ionicons name="person" size={70} color={iconColor} />
        </View>

        <Text className="mt-4 text-3xl font-semibold text-theme-text">
          {displayUserName}
        </Text>

        <Text className="text-2xl text-theme-icon">
          {displayEmail}
        </Text>
      </View>

      <View
        className="p-5 rounded-md gap-4 bg-theme-surface"
      >
        <View>
          <Text className="text-2xl mb-1 text-theme-icon">
            Username
          </Text>

          <Controller
            control={control}
            name="userName"
            rules={{
              required:"Username is required",
              maxLength: {
                value: 20,
                message: "Username is too long",
              },
              minLength: {
                value: 3,
                message: "Username is too short",
              },
            }}
            render={({ field: {onChange, value}}) => (
              <TextInput
                editable={isEditing}
                value={value}
                className="p-4 text-xl border border-theme-text rounded-md bg-theme-background text-theme-text"
                onChangeText={onChange}
              />
            )}
          />

          {errors.userName && (
            <Text className="text-red-500 text-sm pl-2 mt-1">
                {errors.userName.message}
            </Text>
          )}

        </View>

        <View>
          <Text className="text-2xl mb-1 text-theme-icon">
            Email
          </Text>

          <Controller
            control={control}
            name="email"
            rules={{
              required:"Email is required",
              maxLength: {
                value: 40,
                message: "Email is too long",
              },
              pattern: {
                value: /^\S+@\S+\.\S+$/,
                message: "Invalid email format",
              },
            }}
            render={({ field: {onChange, value}}) => (
              <TextInput
                editable={isEditing}
                value={value}
                className="p-4 text-xl border border-theme-text rounded-md bg-theme-background text-theme-text"
                onChangeText={onChange}
              />
            )}
          />

          {errors.email && (
            <Text className="text-red-500 text-sm pl-2 mt-1">
                {errors.email.message}
            </Text>
          )}
          
        </View>
      </View>

      <TouchableOpacity
        className={`mt-6 p-4 rounded-md items-center ${isEditing ? 'bg-theme-success' : 'bg-theme-tint' }`}
        onPress={() => {
            handleSubmit((data) => {
                if(isEditing){
                  handleUpdate(data.email, data.userName)
                  setIsEditing(false)

                  setTimeout(() => {
                      Toast.show({ text1: 'Changed profile successfully' });
                  }, 100);

                }else{
                  setIsEditing(true)
                }
              },
              (errors) => {
                Toast.show({ text1: `Changing profile failed`, type: "error" });
              }
            )();
          }}
      >
        <Text 
        className="text-xl text-center text-theme-textLight font-semibold"
        >
          {isEditing ? "Save Changes" : "Edit Profile"}
          
        </Text>
      </TouchableOpacity>

    </View>
  );
};

export default ProfileScreen;