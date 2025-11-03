import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  Modal,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ScrollView,
} from "react-native";
import { format } from "date-fns";
import { CreateAdvocate, GetAllAdvocates, UpdateAdvocate } from "../../proxy/main/Advocateproxy";
import { Ionicons } from "@expo/vector-icons";
import CommonHeader from "../../components/header";

export default function AdvocatePage() {
  const [data, setData] = useState([]);
  const [reload, setReload] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAdvocate, setEditingAdvocate] = useState(null);
  const [mode, setMode] = useState("create");
  const [form, setForm] = useState({
    name: "",
    barRegistrationNumber: "",
    email: "",
    phoneNumber: "",
    enrollmentDate: "",
  });

  const clearForm = () => {
    setForm({
      name: "",
      barRegistrationNumber: "",
      email: "",
      phoneNumber: "",
      enrollmentDate: "",
    });
    setEditingAdvocate(null);
  };

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const payload = { ...form };

      let result;
      if (mode === "edit" && editingAdvocate?.id) {
        result = await UpdateAdvocate(editingAdvocate.id, payload);
      } else {
        result = await CreateAdvocate(payload);
      }

      if (result.status === "success") {
        Alert.alert("Success", result.message);
        clearForm();
        setIsModalOpen(false);
        setReload((prev) => !prev);
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to save advocate");
    }
  };

  const handleRowClicked = (row) => {
    setEditingAdvocate(row);
    setForm({
      name: row.name,
      barRegistrationNumber: row.barRegistrationNumber,
      email: row.email,
      phoneNumber: row.phoneNumber,
      enrollmentDate: row.enrollmentDate?.split("T")[0] || "",
    });
    setMode("edit");
    setIsModalOpen(true);
  };

  useEffect(() => {
    async function getAllAdvocates() {
      const result = await GetAllAdvocates();
      if (Array.isArray(result)) {
        setData(result);
      } else {
        Alert.alert("Error", result?.detail || result?.message || "Failed to load data");
      }
    }
    getAllAdvocates();
  }, [reload]);

  const renderItem = ({ item }) => (
   <Pressable
  onPress={() => handleRowClicked(item)}
  // Clean card style: slightly larger padding, stronger shadow, subtle active state
  className="bg-white p-5 rounded-2xl mb-4 shadow-md active:bg-gray-50"
>
  <View className="flex-row justify-between items-start mb-2">
    {/* Name: Largest, boldest text for primary focus */}
    <Text className="font-extrabold text-xl text-gray-900 tracking-tight flex-1 mr-4">
      {item.name}
    </Text>

    {/* Bar Registration Number: Highlighted as a key badge */}
    <View className="px-3 py-1 bg-blue-500 rounded-lg">
      <Text className="font-bold text-sm text-white uppercase tracking-wider">
        #{item.barRegistrationNumber}
      </Text>
    </View>
  </View>

  {/* Contact Information Group */}
  <View className="mt-2 space-y-1">
    {/* Email: Secondary focus, slightly muted gray */}
    <Text className="text-base text-gray-600">
      <Text className="font-semibold text-gray-700">Email:</Text> {item.email}
    </Text>

    {/* Phone: Secondary focus, slightly muted gray */}
    <Text className="text-base text-gray-600">
      <Text className="font-semibold text-gray-700">Phone:</Text> {item.phoneNumber}
    </Text>
  </View>
  
  {/* Enrolled Date: Subtle separator and smaller text for tertiary detail */}
  <View className="mt-4">
    <Text className="text-sm text-gray-500">
      Enrolled: {format(new Date(item.enrollmentDate), "MMM dd, yyyy")}
    </Text>
  </View>
</Pressable>
  );

  return (
    <>
      <CommonHeader title="Advocate Records" />
      <View className={`px-4 h-full pb-8 `}>
        <View className="absolute bottom-20 right-0 flex-row justify-between items-center z-50 py-3 px-4 shadow">
          <TouchableOpacity
            onPress={() => {
              clearForm();
              setMode("create");
              setIsModalOpen(true);
            }}
            className="bg-black py-2 px-5 rounded-full"
          >
            <Text className="text-white font-normal text-[25px]">+</Text>
          </TouchableOpacity>
        </View>
        <FlatList
          data={data}
          keyExtractor={(item, i) => i.toString()}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        />

        {/* Modal */}
        <Modal
          animationType="slide"
          transparent
          visible={isModalOpen}
          onRequestClose={() => {
            setIsModalOpen(false);
            clearForm();
          }}
        >
          <View className="flex-1 bg-black/70 justify-center items-center">
            <View className="bg-white rounded-2xl p-5 w-11/12 shadow-lg">
              <Text className="text-xl font-bold mb-4 text-gray-900 border-b border-gray-100 pb-2">
                {editingAdvocate ? "Edit" : "Add"} Advocate
              </Text>
              <ScrollView showsVerticalScrollIndicator={false}>
                {[
                  { label: "Name", name: "name", placeholder: "Name" },
                  {
                    label: "Bar Registration #",
                    name: "barRegistrationNumber",
                    placeholder: "Bar Registration #",
                  },
                  { label: "Email", name: "email", placeholder: "Email" },
                  { label: "Phone Number", name: "phoneNumber", placeholder: "Phone Number" },
                  { label: "Enrollment Date", name: "enrollmentDate", placeholder: "YYYY-MM-DD" },
                ].map((field) => (
                  <View key={field.name} className="mb-3">
                    <Text className="text-xs text-gray-700 mb-1 font-semibold uppercase tracking-wider">
                      {field.label}
                    </Text>
                    <TextInput
                      value={form[field.name]}
                      placeholder={field.placeholder}
                      onChangeText={(text) => handleChange(field.name, text)}
                      className="border border-gray-300 px-4 py-2 rounded-xl text-gray-900"
                    />
                  </View>
                ))}
              </ScrollView>

              <View className="flex-row justify-end gap-3 mt-4">
                <TouchableOpacity
                  onPress={() => {
                    setIsModalOpen(false);
                    clearForm();
                  }}
                  className="bg-gray-100 px-5 py-2 rounded-full"
                >
                  <Text className="text-gray-800 font-semibold">Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleSave}
                  className="bg-black px-5 py-2 rounded-full"
                >
                  <Text className="text-white font-bold">
                    {editingAdvocate ? "Update" : "Save"}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </>
  );
}
