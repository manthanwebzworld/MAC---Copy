import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  ScrollView,
  Pressable,
} from "react-native";
import Toast from "react-native-toast-message";
import { CreateRole, DeleteRoleById, GetAllRoles, UpdateRole } from "../../proxy/main/Roleproxy";
import { useSelector } from "react-redux";
import CommonHeader from "../../components/header";

const defaultPermissions = {
  advocates: { read: "yes", create: "yes", menu: "yes", update: "yes", delete: "no" },
  admissions: { read: "yes", create: "yes", menu: "yes", update: "yes", delete: "no" },
  cases: { read: "yes", create: "yes", menu: "yes", update: "yes", delete: "no" },
  dashboard: { read: "yes", create: "yes", menu: "yes", update: "yes", delete: "no" },
  roles: { read: "yes", create: "yes", menu: "yes", update: "yes", delete: "no" },
  users: { read: "yes", create: "yes", menu: "yes", update: "yes", delete: "no" },
};

const PERMISSION_ACTIONS = ["read", "create", "menu", "update", "delete"];

export default function RoleScreen() {
  const [role, setRole] = useState({ name: "", description: "" });
  const [permissions, setPermission] = useState(defaultPermissions);
  const [allRoles, setAllRoles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [action, setAction] = useState("Create");
  const [selectedRole, setSelectedRole] = useState(null);
  const [reload, setReload] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const userPermission = useSelector((state) => state.permissions.permissions) || [];

  useEffect(() => {
    (async () => {
      const result = await GetAllRoles();
      setAllRoles(result);
    })();
  }, [reload]);

  const handleSubmit = async () => {
    if (!role.name || !role.description) {
      Toast.show({ type: "error", text1: "Please fill all fields" });
      return;
    }

    const body = {
      rolename: role.name,
      description: role.description,
      permissions,
    };

    try {
      const res =
        action === "Create"
          ? await CreateRole(body)
          : await UpdateRole(selectedRole.id, body);

      if (res?.status === "success") {
        Toast.show({ type: "success", text1: `${action} successful` });
        setReload((prev) => !prev);
        setShowModal(false);
      } else {
        Toast.show({ type: "error", text1: res?.message || "Error occurred" });
      }
    } catch (err) {
      Toast.show({ type: "error", text1: "Unexpected error" });
    }
  };

  const handleDelete = async (id) => {
    try {
      await DeleteRoleById(id);
      Toast.show({ type: "success", text1: "Deleted successfully" });
      setReload((prev) => !prev);
    } catch {
      Toast.show({ type: "error", text1: "Failed to delete" });
    }
  };

  const renderRole = ({ item }) => (
    <View className="bg-white p-4 rounded-xl mb-3 shadow">
      <Text className="text-lg font-bold">{item.rolename}</Text>
      <Text className="text-gray-500">{item.description}</Text>

      <View className="flex-row justify-end mt-3 gap-3">
        <TouchableOpacity
          onPress={() => {
            setRole({ name: item.rolename, description: item.description });
            setPermission(item.permissions || defaultPermissions);
            setSelectedRole(item);
            setAction("Edit");
            setShowModal(true);
          }}
          className="bg-black px-4 py-2 rounded-lg"
        >
          <Text className="text-white">Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setConfirmDelete(item.id)}
          className="bg-red-500 px-4 py-2 rounded-lg"
        >
          <Text className="text-white">Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
    <CommonHeader title="Advocate Records" />
    <View className="px-4 pb-8 relative h-full">
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
        data={allRoles}
        keyExtractor={(item) => item.id?.toString()}
        renderItem={renderRole}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      />

      {/* Modal for Create/Edit */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white w-11/12 rounded-2xl p-5">
            <Text className="text-xl font-bold mb-3">
              {action} Role & Permissions
            </Text>

            <TextInput
              placeholder="Name"
              value={role.name}
              onChangeText={(t) => setRole({ ...role, name: t })}
              className="border border-gray-300 rounded-lg px-3 py-2 mb-3"
            />

            <TextInput
              placeholder="Description"
              value={role.description}
              onChangeText={(t) => setRole({ ...role, description: t })}
              className="border border-gray-300 rounded-lg px-3 py-2 mb-5"
            />

            <ScrollView style={{ maxHeight: 250 }}>
              {Object.keys(defaultPermissions).map((moduleKey) => (
                <View
                  key={moduleKey}
                  className="bg-gray-50 rounded-xl p-3 mb-2 border border-gray-200"
                >
                  <Text className="font-semibold mb-2">{moduleKey}</Text>
                  <View className="flex-row flex-wrap gap-3">
                    {PERMISSION_ACTIONS.map((perm) => (
                      <Pressable
                        key={perm}
                        onPress={() =>
                          setPermission((prev) => ({
                            ...prev,
                            [moduleKey]: {
                              ...prev[moduleKey],
                              [perm]:
                                prev[moduleKey][perm] === "yes" ? "no" : "yes",
                            },
                          }))
                        }
                        className={`px-3 py-1 rounded-full border ${permissions[moduleKey]?.[perm] === "yes"
                            ? "bg-black"
                            : "bg-gray-200"
                          }`}
                      >
                        <Text
                          className={`${permissions[moduleKey]?.[perm] === "yes"
                              ? "text-white"
                              : "text-gray-700"
                            }`}
                        >
                          {perm}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>

            <View className="flex-row justify-end mt-4 gap-3">
              <TouchableOpacity
                onPress={() => setShowModal(false)}
                className="bg-gray-300 px-4 py-2 rounded-full"
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmit}
                className="bg-black px-4 py-2 rounded-full"
              >
                <Text className="text-white">
                  {action === "Create" ? "Create" : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete confirmation */}
      <Modal visible={!!confirmDelete} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center">
          <View className="bg-white p-5 rounded-xl w-4/5">
            <Text className="text-lg mb-4">
              Are you sure you want to delete this role?
            </Text>
            <View className="flex-row justify-end gap-3">
              <TouchableOpacity
                onPress={() => setConfirmDelete(null)}
                className="bg-gray-300 px-4 py-2 rounded-full"
              >
                <Text>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  handleDelete(confirmDelete);
                  setConfirmDelete(null);
                }}
                className="bg-red-500 px-4 py-2 rounded-full"
              >
                <Text className="text-white">Delete</Text>
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
