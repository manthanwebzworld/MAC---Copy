import { useContext, useEffect } from "react";
import { Redirect, router, usePathname } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { AuthContext } from "../auth/AuthContext";

export default function Index() {
  console.log('In Index.js')
  const { user } = useContext(AuthContext);

  // ⏳ 1️⃣ While checking stored login data, show a loading spinner
  // if (loading) {
  //   return (
  //     <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
  //       <ActivityIndicator size="large" color="#000" />
  //     </View>
  //   );
  // }

  // ✅ 2️⃣ If user exists (logged in) - go to DASHBOARD
  if (user) {
    console.log('✅ User is logged in, redirecting to dashboard');
    return <Redirect href="/(tabs)/dashboard" />;
  }

  // 🚪 3️⃣ Not logged in → go to sign-in
  console.log('🚪 No user found, redirecting to signin');
  return <Redirect href="/(auth)/signin_signup" />;
}
