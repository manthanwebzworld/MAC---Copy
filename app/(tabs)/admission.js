import React, { useContext, useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  ScrollView,
  Linking,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Toast from "react-native-toast-message";
import { GetAllAdmission, UpdateAdmissionStatusProxy } from "../../proxy/main/Admissionproxy"; // adjust path
import CommonHeader from "../../components/header";
import StatusDropdown from "../../components/StatusDropdown";
import { AuthContext } from "../../auth/AuthContext";
import { max } from "date-fns";

export default function AdmissionList() {
  const { user } = useContext(AuthContext)
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filteredStatus, setFilteredStatus] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await GetAllAdmission();
        setData(result);
      } catch (err) {
        Toast.show({ type: "error", text1: "Failed to load admissions" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await UpdateAdmissionStatusProxy(user?.userId, id, newStatus);
      setData((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      Toast.show({ type: "success", text1: "Status updated!" });
    } catch (err) {
      Toast.show({ type: "error", text1: "Update failed" });
    }
  };

  const filteredData =
    filteredStatus === "All"
      ? data
      : data.filter((item) => item.status === filteredStatus);

  if (loading)
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="black" />
      </View>
    );

  return (
    <>
      <CommonHeader title="Admission Records" />
      <View className={`px-4 h-full relative pb-10`}>
        <View className="absolute bottom-20 right-0 flex-row justify-between items-center z-50 py-3 px-4 shadow">
          <TouchableOpacity
            onPress={() => []}
            className="bg-black py-2 px-5 rounded-full"
          >
            <Text className="text-white font-normal text-[25px]">+</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => <AdmissionItem item={item} onUpdate={handleStatusUpdate} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        />

        <Toast />
      </View>
    </>
  );
}

const AdmissionItem = ({ item, onUpdate }) => {
  const [expanded, setExpanded] = useState(false);

  const statusColor = {
    DRAFT: "#ccc",
    SUBMITTED: "#2196F3",
    UNDER_REVIEW: "#FFC107",
    APPROVED: "#4CAF50",
    REJECTED: "#F44336",
  }[item.status] || "#ddd";

  return (
    <View style={styles.card}>
      <Pressable onPress={() => setExpanded(!expanded)} className={`flex-col gap-2`}>
        <View className={`flex-row items-center`}>
          <View className={`flex-1 flex-col`}>
            <Text className={`font-semibold text-[12px] text-gray-400`}>Default Clause</Text>
            <Text className={`font-semibold text-[14px] `}>{item.defaultClause.length > 15
              ? item.defaultClause.slice(0, 25) + "..."
              : item.defaultClause}</Text></View>
          <View style={[styles.status, { backgroundColor: statusColor }]} className={`h-7 justify-center items-center`}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>
        <View className={`flex-row justify-between`}>
          <View className={`flex-col`}>
            <Text className={`font-semibold text-[12px] text-gray-400`}>Jurisdiction</Text>
            <Text className={`font-semibold text-[14px] `}>{item.jurdisction}</Text></View>
          <View className={`flex-col items-end`}>
            <Text className={`font-semibold text-[12px] text-gray-400`}>Claim Amount</Text>
            <Text className={`font-semibold text-[14px]`}>{item.claimAmount.toLocaleString('en-IN')} ₹</Text></View>
        </View>
      </Pressable>

      {expanded && (
        <View style={styles.details}>
          <View className={`flex-col`}>
            <Text className={`font-semibold text-[12px] text-gray-400`}>Arbitration Clause</Text>
            <Text className={`font-semibold text-[14px] `}>{item.arbitrationClause}</Text></View>

          <Text className={`font-semibold text-[12px] text-gray-400 mt-2`}>Documents</Text>
          <View className={`flex-row justify-between`}>
          <Pressable onPress={() => Linking.openURL(item.documents.poaLoaIdCard)}>
            <Text style={styles.link}>POA/LOA</Text>
          </Pressable>
          <Pressable onPress={() => Linking.openURL(item.documents.lrnDemandNotice)}>
            <Text style={styles.link}>LRN Notice</Text>
          </Pressable>
          <Pressable onPress={() => Linking.openURL(item.documents.agreementContract)}>
            <Text style={styles.link}>Agreement</Text>
          </Pressable>
          <Pressable onPress={() => Linking.openURL(item.documents.orders)}>
            <Text style={styles.link}>Orders</Text>
          </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Claimants</Text>
            {item.claimants.map((c, i) => (
              <View key={i} className={`bg-gray-50 rounded-xl p-3 px-4 mx-2 my-1 shadow-md shadow-gray-200 flex-col gap-2 border-2 border-solid border-gray-500`}>
                <View className={`flex-row justify-between items-center`}>
                <View className={`flex-col`}>
                <Text className={`font-semibold text-[12px] text-gray-400`}>Name</Text>
                <Text className={`font-semibold text-[14px] `}>{c.fullName}</Text></View>
                <View className={`flex-col`}>
                <Text className={`font-semibold text-[12px] text-gray-400`}>Phone</Text>
                <Text className={`font-semibold text-[14px] `}>{c.phoneNumber}</Text></View>
                </View>
                <View className={`flex-col gap-2`}>
                <View className={`flex-col`}>
                <Text className={`font-semibold text-[12px] text-gray-400`}>Email</Text>
                <Text className={`font-semibold text-[14px] `}>{c.email}</Text></View>
                <View className={`flex-col`}>
                <Text className={`font-semibold text-[12px] text-gray-400`}>Address</Text>
                <Text className={`font-semibold text-[14px] `}>{`${c.address}, ${c.city}, ${c.state}, ${c.country} - ${c.zipCode}`}</Text></View>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Respondents</Text>
            {item.respondants.map((c, i) => (
              <View key={i} className={`bg-gray-50 rounded-xl p-3 px-4 mx-2 my-1 shadow-md shadow-gray-200 flex-col gap-2 border-2 border-solid border-gray-500`}>
                <View className={`flex-row justify-between items-center`}>
                <View className={`flex-col`}>
                <Text className={`font-semibold text-[12px] text-gray-400`}>Name</Text>
                <Text className={`font-semibold text-[14px] `}>{c.fullName}</Text></View>
                <View className={`flex-col`}>
                <Text className={`font-semibold text-[12px] text-gray-400`}>Phone</Text>
                <Text className={`font-semibold text-[14px] `}>{c.phoneNumber}</Text></View>
                </View>
                <View className={`flex-col gap-2`}>
                <View className={`flex-col`}>
                <Text className={`font-semibold text-[12px] text-gray-400`}>Email</Text>
                <Text className={`font-semibold text-[14px] `}>{c.email}</Text></View>
                <View className={`flex-col`}>
                <Text className={`font-semibold text-[12px] text-gray-400`}>Address</Text>
                <Text className={`font-semibold text-[14px] `}>{`${c.address}, ${c.city}, ${c.state}, ${c.country} - ${c.zipCode}`}</Text></View>
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle} className={`mt-2`}>Relief Sought</Text>
          <Text style={styles.relief} className={`mb-2`} >{item.refiefSought}</Text>

          {/* <Pressable
            onPress={() => onUpdate(item.id, "APPROVED")}
            style={styles.approveButton}
          >
            <Text style={{ color: "#fff" }}>Approve</Text>
          </Pressable> */}
          <StatusDropdown
            currentStatus={item.status}
            onStatusChange={(newStatus) => onUpdate(item.id, newStatus)}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#000" },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#000",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  addText: { color: "#fff", marginLeft: 4 },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  clause: { fontWeight: "600", color: "#000" },
  status: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusText: { color: "#fff", fontSize: 12 },
  details: { marginTop: 8 },
  link: { color: "#007bff", marginVertical: 2, textDecorationLine: "underline" },
  section: { marginTop: 8 },
  sectionTitle: { fontWeight: "bold", color: "#000", marginBottom: 4 },
  detailText: { color: "#444" },
  relief: { backgroundColor: "#eee", padding: 8, borderRadius: 6 },
  approveButton: {
    marginTop: 10,
    backgroundColor: "#4CAF50",
    padding: 8,
    alignItems: "center",
    borderRadius: 6,
  },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
