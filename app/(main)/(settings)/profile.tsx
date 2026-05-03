import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {Controller, useForm} from 'react-hook-form';
import { useThemeColor } from "@/hooks/use-theme-color";
import Toast from 'react-native-toast-message';

const ProfileScreen = () => {
  const { control, watch, handleSubmit, formState: {errors} } = useForm({
    defaultValues:{
      firstName: "John",
      lastName: "Doe",
      email: "john@email.com",
    }
  });

  const iconColor = useThemeColor({}, "icon");
  const [isEditing, setIsEditing] = useState(false)

  const [displayFirstName, setDisplayFirstName] = useState("")
  const [displayLastName, setDisplayLastName] = useState("")
  const [displayEmail, setDisplayEmail] = useState("")

  const onSubmit = () => {
    setDisplayEmail(watch("email"));
    setDisplayFirstName(watch("firstName"))
    setDisplayLastName(watch("lastName"))
  }

  useEffect(() =>{
    setDisplayEmail(watch("email"));
    setDisplayFirstName(watch("firstName"))
    setDisplayLastName(watch("lastName"))
  }, []);

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
          {displayFirstName} {displayLastName}
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
            First Name 
          </Text>

          <Controller
            control={control}
            name="firstName"
            rules={{
              required:"First Name is required",
              maxLength: {
                value: 20,
                message: "First Name is too long",
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

          {errors.firstName && (
            <Text className="text-red-500 text-sm pl-2 mt-1">
                {errors.firstName.message}
            </Text>
          )}

        </View>

        <View>
          <Text className="text-2xl mb-1 text-theme-icon">
            Last Name
          </Text>

          <Controller
            control={control}
            name="lastName"
            rules={{
              required:"First Name is required",
              maxLength: {
                value: 20,
                message: "First Name is too long",
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

          {errors.lastName && (
            <Text className="text-red-500 text-sm pl-2 mt-1">
                {errors.lastName.message}
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
              required:"First Name is required",
              maxLength: {
                value: 20,
                message: "First Name is too long",
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
            handleSubmit(() => {
                setIsEditing(prev => !prev)
                if(isEditing){
                  onSubmit()
                  setTimeout(() => {
                      Toast.show({ text1: 'Changed profile successfully' });
                  }, 100);
                }
              },
              (errors) => {
                Toast.show({ text1: `Changing profile failed ${errors}`, type: "error" });
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