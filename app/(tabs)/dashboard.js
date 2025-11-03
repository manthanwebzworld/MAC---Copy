import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  Pressable,
} from "react-native";
import { AuthContext } from "../../auth/AuthContext";
import { router } from "expo-router";
import { Briefcase, Gavel, Plus, Users } from "lucide-react-native";
import CommonHeader from "../../components/header";
import { CustomCalendar } from "../../components/CustomCalendar ";
import { FlashCalendar } from "../../components/FlashCalendar ";
import { GetAllCount, GetAllRecentActivity } from "../../proxy/main/Dashboardproxy";

const MOCK_DASHBOARD_STATS = [
  { label: "Total Cases", name: "totalCases", value: 328, icon: Briefcase, color: "text-blue-600", bg: "bg-blue-50" },
  { label: "New Admissions", name: "totalNewAdmission", value: 14, icon: Plus, color: "text-green-600", bg: "bg-green-50" },
  { label: "Active Users", name: "activeUser", value: 105, icon: Users, color: "text-yellow-600", bg: "bg-yellow-50" },
  { label: "Total Arbitrator", name: "totalAdvocates", value: 45, icon: Gavel, color: "text-red-600", bg: "bg-red-50" },
];

const MOCK_RECENT_ACTIVITY = [
  { type: "Log Added", case: "ADR/2024/7890", date: "2024-11-01", detail: "Case Management Hearing Order filed." },
  { type: "New Admission", case: "ADR/2025/1001", date: "2024-10-28", detail: "Claim filed by Stark Industries." },
  { type: "Log Added", case: "ADR/2024/7890", date: "2024-10-15", detail: "Discovery Motion approved." },
  { type: "User Registered", case: "N/A", date: "2024-10-10", detail: "New Advocate, L. Kenobi, registered." },
  { type: "New Admission", case: "ADR/2025/1000", date: "2024-10-05", detail: "Arbitration request received." },
];


// // Dummy data for next hearing dates
// const nextHearingDates = [
//   {
//     caseId: 'CIV-2025-001',
//     nextHearing: new Date(2025, 10, 15), // November 15, 2025
//     status: 'SCHEDULED',
//     caseTitle: 'Smith vs Johnson Property Dispute'
//   },
//   {
//     caseId: 'CR-2025-045',
//     nextHearing: new Date(2025, 10, 5), // November 5, 2025
//     status: 'HEARING',
//     caseTitle: 'State vs Robert Wilson'
//   },
//   // Add some hearings for the current month you're viewing (January 2025)
//   {
//     caseId: 'CIV-2025-003',
//     nextHearing: new Date(2025, 0, 10), // January 10, 2025
//     status: 'SCHEDULED',
//     caseTitle: 'Current Month Hearing'
//   },
//   {
//     caseId: 'CR-2025-046',
//     nextHearing: new Date(2025, 0, 20), // January 20, 2025
//     status: 'HEARING',
//     caseTitle: 'Another Current Month Case'
//   },
// ];

// // Get today's hearings for display
// const getTodaysHearings = () => {
//   const today = new Date();
//   return nextHearingDates.filter(
//     hearing => new Date(hearing.nextHearing).toDateString() === today.toDateString()
//   );
// };

// const todaysHearings = getTodaysHearings();


export default function DashboardPage() {
  const { user, loading } = useContext(AuthContext);
  const [showLogout, setShowLogout] = useState(false);
  const [calendarValue, setCalendarValue] = useState(new Date());
  const [dashboardStats, setDashboardStats] = useState(MOCK_DASHBOARD_STATS);
  const [recentActivity,setRecentActivity] = useState([{
        date: "",
        type: "",
        id: "",
        details: ""
    }]);


  const fetchDashboardStats = async () => {
    try {
      const result = await GetAllCount();
      if (result) {
        setDashboardStats((prev) =>
          prev.map((item) => ({
            ...item,
            value: result[item.name] ?? item.value,
          }))
        );
      }
    } catch (error) {
      // console.error("Error fetching dashboard stats:", error);
    }
  };

    const fetchRecentActivity = async () => {
    try {
      const result = await GetAllRecentActivity();
      if (result) {
        setRecentActivity(result);
      }
      else{
        null
      }
    } catch (error) {
      // console.log("Error fetching recent activity:", error);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentActivity();
  }, []);
  // console.log(dashboardStats)
  return (  
    <View className="flex-1 relative">
      {/* Header */}
      <CommonHeader title="Dashboard" />

      {/* Scrollable Dashboard */}
      <ScrollView className={`px-4`}>

        {/* Stats */}
        <View className="flex-row flex-wrap justify-between mb-4">
          {dashboardStats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </View>

        <CustomCalendar 
        calendarValue={calendarValue}
        setCalendarValue={setCalendarValue}
      />
        {/* <CustomCalendar
          nextHearingDates={nextHearingDates}
          calendarValue={calendarValue}
          setCalendarValue={setCalendarValue}
        /> */}

        {/* <FlashCalendar
          nextHearingDates={nextHearingDates}
          calendarValue={calendarValue}
          setCalendarValue={setCalendarValue}
        /> */}

        {/* Recent Activity */}
        <View className="bg-white rounded-2xl shadow p-4 mt-6">
          <Text className="text-lg font-bold mb-3 text-gray-900 border-b border-gray-100 pb-2">
            Recent Activity
          </Text>
          {recentActivity.map((activity, index) => (
            <ActivityLog key={index} {...activity} />
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const StatCard = ({ label, value, icon: Icon, color, bg }) => (
  <View className="w-[48%] bg-white p-4 mb-3 rounded-2xl shadow flex-row items-center justify-between">
    <View>
      <Text className="text-xl font-bold text-gray-900">{value}</Text>
      <Text className={`${color} text-sm font-medium`}>{label}</Text>
    </View>
    <View className={`p-3 rounded-xl ${bg}`}>
      <Icon size={24} color="black" />
    </View>
  </View>
);

const ActivityLog = ({ type, case: caseId, date, detail }) => (
  <View className="flex-row items-start space-x-3 p-2 rounded-xl">
    <View
      className={`w-2 h-2 rounded-full mt-2 ${type.includes("New")
          ? "bg-green-500"
          : type.includes("Log")
            ? "bg-blue-500"
            : "bg-yellow-500"
        }`}
    />
    <View className="flex-1">
      <View className="flex-row justify-between items-center mb-1">
        <Text className="text-sm font-semibold text-gray-800">{type}</Text>
        <Text className="text-xs text-gray-400">{date}</Text>
      </View>
      <Text className="text-xs text-gray-600">
        {caseId !== "N/A" && (
          <Text className="font-mono text-black mr-1">#{caseId} </Text>
        )}
        {detail}
      </Text>
    </View>
  </View>
);
