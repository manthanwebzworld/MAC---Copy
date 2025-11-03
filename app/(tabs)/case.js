import React, { useEffect, useState, useRef, useCallback, useContext } from "react";
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Modal,
    TextInput,
    ScrollView,
    StyleSheet,
    ActivityIndicator,
    Alert,
    Platform,
    Pressable,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { router, useRouter } from "expo-router";
import { GetAllCases, IsCaseExist, RegisterCase } from "../../proxy/main/Caseproxy";
import { GetAdmissionDetailByAdmissionIdAndUserEmail, getAdmissionFormDetails } from "../../proxy/main/Admissionproxy";
import { Ionicons } from "@expo/vector-icons";
import CommonHeader from "../../components/header";
import { AuthContext } from "../../auth/AuthContext";
import Toast from "react-native-toast-message";
import SelectDocument from "../../components/doc_select";

export default function CasePage() {
    const { user } = useContext(AuthContext)
    const [data, setData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [admissionId, setAdmissionId] = useState("");
    const [claimants, setClaimants] = useState([]);
    const [respondents, setRespondents] = useState([]);
    const [reliefSought, setReliefSought] = useState("");
    const [caseNo, setCaseNo] = useState("");
    const [section17DocPath, setSection17DocPath] = useState(null);
    const [statementOfClaimPath, setStatementOfClaimPath] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [registerrrror, setregisterrrror] = useState("")

    const userId = user?.userId; // replace with AsyncStorage.getItem('userId') etc.
    const username = user?.username;
    const userRole = user?.roleName;

    const loadData = async () => {
        try{
        if(userRole != 'ADMIN'){
        const exist = await IsCaseExist(userId);
        if (exist.status === "error") setIsModalOpen(true);
        }

        const result = await GetAllCases(userId);
        if (result) setData(result);

        }catch(err){
            Toast.show({
            type: 'error',
            text1: err || "An unexpected error occurred. Please try again later.",
            position: 'top',
        })
        }
    };

    useEffect(() => {
        loadData()
    }, []);

    const fetchAdmissionDetails = async (id) => {
        try {
            const result = await GetAdmissionDetailByAdmissionIdAndUserEmail(id, user.userEmail);
            setClaimants(result.claimants);
            setRespondents(result.respondants);
            setReliefSought(result.refiefSought);
            // console.log('Here is Case ID Result', result)
        } catch {
            // Toast.show({ type: "error", text1: "Invalid Admission ID or unable to fetch data" });
            setregisterrrror("You are not associated with this admission")
        }
    };

    const handleDocumentPick = async (field) => {
        const res = await DocumentPicker.getDocumentAsync({
            type: ["application/pdf", "application/msword"],
        });
        if (res.canceled) return;
        if (field === "section17DocPath") setSection17DocPath(res.assets[0]);
        else setStatementOfClaimPath(res.assets[0]);
    };

    const handleSubmit = async () => {
        if (!admissionId || !section17DocPath || !statementOfClaimPath) {
            Alert.alert("Missing Data", "Please fill all required fields.");
            return;
        }

        setIsSubmitting(true);

        try {
            // In Expo, you'd upload via fetch(FormData)
            const payload = {
                createdBy: username,
                updatedBy: username,
                caseNo,
                admissionFormId: admissionId,
                section17DocPath: section17DocPath.uri,
                statementOfClaimPath: statementOfClaimPath.uri,
                status: "DRAFT",
            };
            const result = await RegisterCase(payload);
            if (result.status === "success") {
                Alert.alert("Success", "Case Registered");
                setIsModalOpen(false);
            } else {
                Alert.alert("Error", result.message || "Failed to register");
            }
        } finally {
            setIsSubmitting(false);
            loadData()
        }
    };

    const renderItem = ({ item }) => {
        const statusColor = {
            DRAFT: "#ccc",
            SUBMITTED: "#2196F3",
            UNDER_REVIEW: "#FFC107",
            APPROVED: "#4CAF50",
            REJECTED: "#F44336",
        }[item.status] || "#ddd";

        return (<TouchableOpacity
            style={styles.row}
            onPress={() => router.push(`/cases/${item.caseid}`)}
        >
            <View className={`flex-col `}>
                <View className={`flex-row justify-between items-center w-full mb-2`}>
                    <View className={`flex-col`}>
                        <Text className={`font-semibold text-[12px] text-gray-400`}>Case No</Text>
                        <Text className={`font-semibold text-[14px] `}>{item.caseNo}</Text></View>
                    <View style={{ backgroundColor: statusColor }} className={`h-7 justify-center items-center rounded-full px-3`}>
                        <Text className={`text-white font-semibold text-[10px]`}>{item.status}</Text>
                    </View>
                </View>
                <View className={`flex-col gap-2`}>
                    <View className={`flex-col`}>
                        <Text className={`font-semibold text-[12px] text-gray-400`}>Claimants</Text>
                        <Text className={`font-semibold text-[14px] `}>{item.claimants?.join(", ")}</Text></View>

                    <View className={`flex-col`}>
                        <Text className={`font-semibold text-[12px] text-gray-400`}>Respondants</Text>
                        <Text className={`font-semibold text-[14px] `}>{item.respondants?.join(", ")}</Text></View>
                </View>
                <View className={`flex-col mt-2 w-full items-end`}>
                    <Text className={`font-semibold text-[12px] text-gray-400`}>Created AT</Text>
                    <Text className={`font-semibold text-[14px] `}>{new Date(item.createdAt).toLocaleString("en-US", {
                        month: "2-digit",
                        day: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                        hour12: true,
                    })}</Text></View>
            </View>


        </TouchableOpacity>)
    };

    return (
        <>
            <CommonHeader title="Case Records" />
            <View className={`px-4 h-full relative pb-10`}>

                <View className="absolute bottom-20 right-0 flex-row justify-between items-center z-50 py-3 px-4 shadow">
                    <TouchableOpacity
                        onPress={() => setIsModalOpen(!isModalOpen)}
                        className="bg-black py-2 px-5 rounded-full"
                    >
                        <Text className="text-white font-normal text-[25px]">+</Text>
                    </TouchableOpacity>
                </View>
                <FlatList
                    data={data}
                    keyExtractor={(item) => item.caseid?.toString()}
                    renderItem={renderItem}
                    ListEmptyComponent={
                        <Text style={styles.empty}>No cases available</Text>
                    }
                />

                {/* Modal */}
                <Modal visible={isModalOpen} transparent animationType="slide">
                    <View style={styles.modalOverlay}>
                        <ScrollView style={styles.modal} className={`h-[100px]`}>
                            <View className={`flex-row justify-between items-center mb-3`}>
                                <Text style={styles.modalTitle}>Register New Case</Text>
                                <Pressable
                                    onPress={() => { setIsModalOpen(!isModalOpen) }}
                                >
                                    <Text className={`text-red-500 `}>Cancel</Text>
                                </Pressable>
                            </View>

                            <TextInput
                                style={styles.input}
                                placeholder="Admission ID"
                                value={admissionId}
                                onChangeText={(t) => {
                                    setAdmissionId(t);
                                    if (t.length > 0) fetchAdmissionDetails(t);
                                }}
                                className={'mt-5'}
                            />

                            {claimants.length > 0 ? (
                                <>
                                    {/* Claimants Section */}
                                    <Text className="text-xl font-bold text-gray-900 mt-4 mb-2 border-b border-gray-200 pb-2">Claimants</Text>
                                    {claimants.map((c, i) => (
                                        <Text key={i} className="text-base text-gray-700 ml-3 mb-1">
                                            • {c.fullName}
                                        </Text>
                                    ))}

                                    {/* Respondents Section */}
                                    <Text className="text-xl font-bold text-gray-900 mt-4 mb-2 border-b border-gray-200 pb-2">Respondents</Text>
                                    {respondents.map((r, i) => (
                                        <Text key={i} className="text-base text-gray-700 ml-3 mb-1">
                                            • {r.fullName}
                                        </Text>
                                    ))}

                                    {/* Relief Sought Section */}
                                    <Text className="text-xl font-bold text-gray-900 mt-4 mb-2 border-b border-gray-200 pb-2">Relief Sought</Text>
                                    <Text className="text-base text-gray-800 bg-gray-100 p-3 rounded border-l-4 border-gray-400 mb-5">
                                        {reliefSought}
                                    </Text>

                                    {/* Case Number Input */}
                                    <Text className="text-xl font-bold text-gray-900 mt-4 mb-2 border-b border-gray-200 pb-2">Case Number</Text>
                                    <TextInput
                                        className="h-11 border border-gray-300 rounded-md px-4 text-base text-gray-800 focus:border-gray-500 mt-3"
                                        placeholder="Case Number"
                                        placeholderTextColor="#a0aec0" // Tailwind's gray-400
                                        value={caseNo}
                                        onChangeText={setCaseNo}
                                    />

                                    {/* Section 17 Document Upload Button */}
                                    {/* <TouchableOpacity
                                        className="bg-gray-200 p-3 rounded-md items-center mt-3 border border-gray-300 active:bg-gray-300"
                                        onPress={() => handleDocumentPick("section17DocPath")}
                                    >
                                        <Text className="text-base text-gray-800 font-medium">
                                            {section17DocPath
                                                ? section17DocPath.name
                                                : "Select Section 17 Document"}
                                        </Text>
                                    </TouchableOpacity> */}
                                    <View className={`flex-col gap-4 mt-2`}>
                                    <SelectDocument
                                        onFileSelect={setSection17DocPath}
                                        file={section17DocPath}
                                    />
                                    <SelectDocument
                                        onFileSelect={setStatementOfClaimPath}
                                        file={statementOfClaimPath}
                                    />
                                    </View>
                                    {/* Statement of Claim Upload Button */}
                                    {/* <TouchableOpacity
                                        className="bg-gray-200 p-3 rounded-md items-center mt-3 border border-gray-300 active:bg-gray-300"
                                        onPress={() => handleDocumentPick("statementOfClaimPath")}
                                    >
                                        <Text className="text-base text-gray-800 font-medium">
                                            {statementOfClaimPath
                                                ? statementOfClaimPath.name
                                                : "Select Statement of Claim"}
                                        </Text>
                                    </TouchableOpacity> */}

                                    {/* Button Row */}
                                    <View className="flex-row justify-between mt-6">
                                        {/* Cancel Button */}
                                        <TouchableOpacity
                                            className="flex-1 bg-gray-300 p-3 rounded-md items-center mr-2 active:bg-gray-400"
                                            onPress={() => setIsModalOpen(false)}
                                        >
                                            <Text className="text-base font-semibold text-gray-900">Cancel</Text>
                                        </TouchableOpacity>

                                        {/* Submit Button */}
                                        <TouchableOpacity
                                            className={`flex-1 p-3 rounded-md items-center ml-2 ${isSubmitting ? 'bg-gray-500' : 'bg-black active:bg-gray-800'}`}
                                            onPress={handleSubmit}
                                            disabled={isSubmitting}
                                        >
                                            {isSubmitting ? (
                                                <ActivityIndicator color="#fff" />
                                            ) : (
                                                <Text className="text-base font-semibold text-white">Submit</Text>
                                            )}
                                        </TouchableOpacity>
                                    </View>

                                </>
                            ) : (

                                <Text className={`text-center mt-4 ${registerrrror ? 'text-red-600' : 'text-gray-300'}`}>{registerrrror ? registerrrror : "Noting to show!"}</Text>

                            )}
                        </ScrollView>
                    </View>
                </Modal>
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: "#fff", padding: 16 },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
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
    addButtonText: { color: "#fff", marginLeft: 5 },
    row: {
        flexDirection: "row",
        justifyContent: "space-between",
        padding: 12,
        backgroundColor: "#F9FAFB",
        borderBottomWidth: 1,
        borderColor: "#E5E7EB",
        borderRadius: 6,
        marginBottom: 6,
    },
    cell: { flex: 1, color: "#111", fontSize: 13 },
    status: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 12,
        fontSize: 12,
        color: "#444",
    },
    empty: { textAlign: "center", color: "#666", marginTop: 50 },
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.6)",
        justifyContent: "center",
        padding: 20,
    },
    modal: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
    },
    modalTitle: { fontSize: 18, fontWeight: "bold" },
    input: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 10,
        marginBottom: 5,
    },
    uploadBtn: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        backgroundColor: "#f9f9f9",
    },
    relief: {
        backgroundColor: "#F3F4F6",
        padding: 8,
        borderRadius: 6,
        marginBottom: 10,
    },
    sectionTitle: { fontWeight: "600", marginTop: 10, marginBottom: 4 },
    listItem: { color: "#333", marginLeft: 10 },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        marginTop: 16,
    },
    btn: { flex: 1, padding: 12, borderRadius: 10, alignItems: "center" },
    cancelBtn: {
        backgroundColor: "#E5E7EB",
        marginRight: 8,
    },
    submitBtn: { backgroundColor: "#000" },
});
