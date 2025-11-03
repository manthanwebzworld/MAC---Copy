import React, { useState, useContext } from "react";
import { View, Text, Pressable } from "react-native";
import { AuthContext } from "../auth/AuthContext";
import { router } from "expo-router";

export default function CommonHeader({ title = "Metro Arbitration Center" }) {
  const { user, logout } = useContext(AuthContext);
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = async () => {
    try {
      await logout(); // clears AsyncStorage + user context
      // Small delay to ensure re-render completes before navigating
      setTimeout(() => {
        router.replace("/signin_signup");
      }, 100);
    } catch (err) {
      // console.log("Logout error:", err);
    }
  };

  return (
    <View className="flex-row justify-between items-center mb-5 relative bg-white p-3">
      {/* Title */}
      <Text className="font-bold text-[20px] text-gray-900">{title}</Text>

      {/* User Initial Circle */}
      <Pressable
        onPress={() => setShowLogout(!showLogout)}
        className={`justify-center items-center flex-row gap-2`}
      >
        <View
          className="rounded-full flex-row bg-black w-10 h-10 justify-center items-center"
        >
          <Text className="text-white capitalize font-bold text-[18px]">
            {user?.username?.[0]?.toUpperCase() || "U"}
          </Text>
        </View>
        <Text className="text-black capitalize font-bold text-[14px]">
          {user?.username}
        </Text>
      </Pressable>

      {/* Logout Dropdown */}
      {showLogout && (
        <View className="absolute top-14 right-4 bg-white shadow-lg border border-gray-200 h-10 z-50 w-[100px] rounded-md items-center justify-center">
          <Pressable onPress={handleLogout}>
            <Text className="text-red-500 font-semibold">Logout</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
