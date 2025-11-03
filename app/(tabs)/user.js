import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Toast from "react-native-toast-message";
import { GetAllRoles } from "../../proxy/main/Roleproxy";
import { GetAllUsers, CreateUser, UpdateUser } from "../../proxy/main/Userproxy";
import CommonHeader from "../../components/header";

export default function UsersScreen() {
  const [data, setData] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const [createForm, setCreateForm] = useState({
    username: "",
    password: "",
    fullName: "",
    email: "",
    phoneNo: "",
    roleid: "",
  });

  const [updateForm, setUpdateForm] = useState({
    fullName: "",
    email: "",
    phoneNo: "",
    roleid: "",
  });

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const users = await GetAllUsers();
        const rolesData = await GetAllRoles();
        if (Array.isArray(users)) setData(users);
        if (Array.isArray(rolesData)) setRoles(rolesData);
      } catch (e) {
        Toast.show({ type: "error", text1: "Failed to load users" });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [reload]);

  // Handle Create User
  const handleCreateUser = async () => {
    try {
      const result = await CreateUser(createForm);
      if (result.status === "success") {
        Toast.show({ type: "success", text1: "User created" });
        setIsCreateModalOpen(false);
        setCreateForm({
          username: "",
          password: "",
          fullName: "",
          email: "",
          phoneNo: "",
          roleid: "",
        });
        setReload(!reload);
      } else {
        Toast.show({ type: "error", text1: result.message || "Failed to create user" });
      }
    } catch {
      Toast.show({ type: "error", text1: "Error creating user" });
    }
  };

  // Handle Update User
  const handleUpdateUser = async () => {
    try {
      const result = await UpdateUser(selectedUser.id, updateForm);
      if (result.status === "success") {
        Toast.show({ type: "success", text1: "User updated" });
        setIsEditModalOpen(false);
        setReload(!reload);
      } else {
        Toast.show({ type: "error", text1: result.message || "Failed to update user" });
      }
    } catch {
      Toast.show({ type: "error", text1: "Error updating user" });
    }
  };

  const renderUserItem = ({ item }) => (
   <TouchableOpacity
      onPress={() => {
        setSelectedUser(item);
        setUpdateForm({
          fullName: item.fullName || "",
          email: item.email || "",
          phoneNo: item.phoneNo || "",
          roleid: String(item.roleId || ""),
        });
        setIsEditModalOpen(true);
      }}
      // Modern white card with subtle shadow and border
      className="bg-white rounded-xl p-4 mb-3 border border-gray-100 shadow-sm flex-row items-center"
    >
      {/* Profile Initial Circle */}
      {/* <View className="w-20 h-20 rounded-full bg-gray-200 justify-center items-center mr-4 p-4">
        <Text className="text-[20px] font-bold text-gray-700">
          {item.fullName[0]}
        </Text>
      </View> */}

      {/* Contact Details (Name, Email, Phone) */}
      <View className="flex-1">
        {/* Name: Prominent, dark, and bold */}
        <Text className="font-extrabold text-lg text-gray-900 tracking-tight">
          {item.fullName}
        </Text>
        {/* Email: Secondary, slightly lighter gray */}
        <Text className="text-sm text-gray-600 mt-1">
          {item.email}
        </Text>
        {/* Phone: Tertiary, muted gray */}
        <Text className="text-xs text-gray-400 mt-1">
          📞 {item.phoneNo}
        </Text>
      </View>

      {/* Role Badge on the right side */}
      <View className="ml-4 px-3 py-1 bg-green-500 rounded-full">
        <Text className="font-semibold text-xs text-white uppercase tracking-wider">
          {item.roleName}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-gray-100">
        <ActivityIndicator size="large" color="black" />
      </View>
    );
  }

  return (
    <>
    <CommonHeader title="Users Records" />
    <View  className={`px-4 pb-8 relative h-full`}>
      <View className="absolute bottom-20 right-0 flex-row justify-between items-center z-50 py-3 px-4 shadow">
        <TouchableOpacity
          onPress={() => setIsCreateModalOpen(true)}
          className="bg-black py-2 px-5 rounded-full"
        >
          <Text className="text-white font-normal text-[25px]">+</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUserItem}
        contentContainerStyle={{ paddingBottom: 50 }}
      />
    

      {/* Create Modal */}
      <Modal visible={isCreateModalOpen} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center">
          <View className="bg-white w-11/12 rounded-2xl p-6">
            <Text className="text-lg font-bold mb-3">Create User</Text>

            <TextInput
              placeholder="Username"
              className="border border-gray-300 rounded-lg px-3 py-2 mb-2"
              value={createForm.username}
              onChangeText={(v) => setCreateForm({ ...createForm, username: v })}
            />
            <TextInput
              placeholder="Password"
              secureTextEntry
              className="border border-gray-300 rounded-lg px-3 py-2 mb-2"
              value={createForm.password}
              onChangeText={(v) => setCreateForm({ ...createForm, password: v })}
            />
            <TextInput
              placeholder="Full Name"
              className="border border-gray-300 rounded-lg px-3 py-2 mb-2"
              value={createForm.fullName}
              onChangeText={(v) => setCreateForm({ ...createForm, fullName: v })}
            />
            <TextInput
              placeholder="Email"
              className="border border-gray-300 rounded-lg px-3 py-2 mb-2"
              value={createForm.email}
              onChangeText={(v) => setCreateForm({ ...createForm, email: v })}
            />
            <TextInput
              placeholder="Phone Number"
              className="border border-gray-300 rounded-lg px-3 py-2 mb-2"
              value={createForm.phoneNo}
              onChangeText={(v) => setCreateForm({ ...createForm, phoneNo: v })}
            />
            <Picker
              selectedValue={createForm.roleid}
              onValueChange={(v) => setCreateForm({ ...createForm, roleid: v })}
              style={{ backgroundColor: "#f2f2f2", borderRadius: 8, marginBottom: 10 }}
            >
              <Picker.Item label="Select Role" value="" />
              {roles.map((role) => (
                <Picker.Item key={role.id} label={role.rolename} value={role.id} />
              ))}
            </Picker>

            <View className="flex-row justify-end mt-4">
              <TouchableOpacity
                onPress={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-full mr-3"
              >
                <Text className="text-gray-800 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleCreateUser}
                className="px-4 py-2 bg-black rounded-full"
              >
                <Text className="text-white font-semibold">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Edit Modal */}
      <Modal visible={isEditModalOpen} transparent animationType="fade">
        <View className="flex-1 bg-black/60 justify-center items-center">
          <View className="bg-white w-11/12 rounded-2xl p-6">
            <Text className="text-lg font-bold mb-3">Edit User</Text>

            <TextInput
              placeholder="Full Name"
              className="border border-gray-300 rounded-lg px-3 py-2 mb-2"
              value={updateForm.fullName}
              onChangeText={(v) => setUpdateForm({ ...updateForm, fullName: v })}
            />
            <TextInput
              placeholder="Email"
              className="border border-gray-300 rounded-lg px-3 py-2 mb-2"
              value={updateForm.email}
              onChangeText={(v) => setUpdateForm({ ...updateForm, email: v })}
            />
            <TextInput
              placeholder="Phone Number"
              className="border border-gray-300 rounded-lg px-3 py-2 mb-2"
              value={updateForm.phoneNo}
              onChangeText={(v) => setUpdateForm({ ...updateForm, phoneNo: v })}
            />
            <Picker
              selectedValue={updateForm.roleid}
              onValueChange={(v) => setUpdateForm({ ...updateForm, roleid: v })}
              style={{ backgroundColor: "#f2f2f2", borderRadius: 8, marginBottom: 10 }}
            >
              <Picker.Item label="Select Role" value="" />
              {roles.map((role) => (
                <Picker.Item key={role.id} label={role.rolename} value={String(role.id)} />
              ))}
            </Picker>

            <View className="flex-row justify-end mt-4">
              <TouchableOpacity
                onPress={() => setIsEditModalOpen(false)}
                className="px-4 py-2 bg-gray-200 rounded-full mr-3"
              >
                <Text className="text-gray-800 font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleUpdateUser}
                className="px-4 py-2 bg-black rounded-full"
              >
                <Text className="text-white font-semibold">Update</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Toast />
    </View>
    </>
  );
}
