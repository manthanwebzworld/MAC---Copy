import { Tabs } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useEffect, useState, useContext } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ActivityIndicator, View } from "react-native";

import { setPermissions } from "../../redux/slices/permissionSlice";
import { AuthContext } from "../../auth/AuthContext";
import { GetRoleById } from "../../proxy/main/Roleproxy";
import Toast from 'react-native-toast-message';

const TAB_CONFIG = {
  dashboard: { title: "Dashboard", icon: "home", permissionKey: "dashboard" },
  user: { title: "User", icon: "users", permissionKey: "users" },
  arbitrator: { title: "Arbitrator", icon: "bookmark", permissionKey: "advocates" },
  admission: { title: "Admission", icon: "plus", permissionKey: "admissions" },
  case: { title: "Case", icon: "file", permissionKey: "cases" },
};

export default function TabLayout() {
  const dispatch = useDispatch();
  const { user } = useContext(AuthContext);
  const roleId = user?.roleId;
  const [isLoaded, setIsLoaded] = useState(false);

  const permissions = useSelector((state) => state.permissions.permissions) || {};

  useEffect(() => {
    async function fetchPermissions() {
      try {
        if (roleId) {
          const res = await GetRoleById(roleId);
          dispatch(setPermissions(res.permissions));
        }
      } catch (err) {
        Toast.show({
                    type: 'error',
                    text1: err || "An unexpected error occurred. Please try again later.",
                    position: 'top',
                })
      } finally {
        setIsLoaded(true);
      }
    }
    fetchPermissions();
  }, [roleId, dispatch]);

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Tabs screenOptions={{ headerShown: false }}>
      {Object.entries(TAB_CONFIG).map(([name, config]) => {
        const allowed = permissions[config.permissionKey]?.menu === "yes";
        return (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              title: config.title,
              tabBarIcon: ({ color }) => (
                <FontAwesome size={24} name={config.icon} color={color} />
              ),
              href: allowed ? `/${name}` : null, // 👈 hide if not allowed
            }}
          />
        );
      })}
    </Tabs>
  );
}
