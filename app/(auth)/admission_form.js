import { ImageBackground, View, TextInput, Pressable, Image, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { Text } from "react-native";
import { useContext, useState } from "react";
import PopupForm from "../../components/claimant_popup";
import RPopupForm from "../../components/respondent_popup";
import Detailscards from "../../components/detail_list";
import SelectDocument from "../../components/doc_select";
import FormProgressCard from '../../components/form_detail_complete'
import { AuthContext } from "../../auth/AuthContext";
import { Uploadfile } from "../../proxy/api/Uploadfile";
import { router } from 'expo-router';
import Toast from "react-native-toast-message";



export default function Admission_form() {

    const { Admission } = useContext(AuthContext);

    // Claimant Details 
    const [visible, setVisible] = useState(false);
    const [claimants, setClaimants] = useState([]);

    const handleFormSubmit = (data) => {
        setClaimants([...claimants, data]);
    };

    const removeClaimant = (index) => {
        setClaimants(claimants.filter((_, i) => i !== index));
    };

    // Responded Details
    const [Rvisible, setRVisible] = useState(false);
    const [Respondent, setRespondent] = useState([]);

    const handleFormSubmitR = (data) => {
        setRespondent([...Respondent, data]);
    };

    const removeRespondent = (index) => {
        setRespondent(Respondent.filter((_, i) => i !== index));
    };

    // Documents Details
    const [posidcardloa, setposidcardloa] = useState(null);
    const [lrndemandnotice, setlrndemandnotice] = useState(null);
    const [copyofagreement, setcopyofagreement] = useState(null);
    const [copyoforder, setcopyoforder] = useState(null);

    // Validation
    const [defaultClause, setDefaultClause] = useState('');
    const [jurisdiction, setJurisdiction] = useState('');
    const [arbitrationClause, setArbitrationClause] = useState('');
    const [reliefSought, setReliefSought] = useState('');
    const [claimAmount, setClaimAmount] = useState('');
    const [errors, setErrors] = useState({});

    const handleSubmit = async () => {
        const newErrors = {};

        if (claimants.length === 0) newErrors.claimants = "At least one claimant is required.";
        if (Respondent.length === 0) newErrors.respondents = "At least one respondent is required.";
        if (!defaultClause.trim()) newErrors.defaultClause = "Default clause is required.";
        if (!jurisdiction.trim()) newErrors.jurisdiction = "Jurisdiction is required.";
        if (!arbitrationClause.trim()) newErrors.arbitrationClause = "Arbitration clause is required.";
        if (!reliefSought) newErrors.reliefSought = "Relief sought is required.";
        if (!claimAmount) newErrors.claimAmount = "Claim amount is required.";
        if (!posidcardloa) newErrors.posidcardloa = "POA/ID/LOA document is required.";
        if (!lrndemandnotice) newErrors.lrndemandnotice = "LRN/Demand Notice is required.";
        if (!copyofagreement) newErrors.copyofagreement = "Copy of agreement is required.";
        if (!copyoforder) newErrors.copyoforder = "Copy of order is required.";

        setErrors(newErrors);
        const [poaRes, lrnRes, agreementRes, orderRes] = await Promise.all([
            Uploadfile(posidcardloa),
            Uploadfile(lrndemandnotice),
            Uploadfile(copyofagreement),
            Uploadfile(copyoforder),
        ]);

        // ✅ Build documents object safely
        const documents = {
            poaLoaIdCard: poaRes,
            lrnDemandNotice: lrnRes,
            agreementContract: agreementRes,
            orders: orderRes,
        };

        // console.log('Uploaded documents:', documents);

        if (Object.keys(newErrors).length === 0) {
            setLoading(true);
            const success = await Admission(
                defaultClause,
                jurisdiction,
                arbitrationClause,
                reliefSought,
                claimAmount,
                claimants,
                Respondent,
                documents
            );
            setLoading(false);

            if (success === 'success') {
                router.back();
            } else {
                Toast.show({ type: "error", text1: "Somthing went wrong Please Try Again!", position : 'top' })
            }
        }
    };


    return (
        <ImageBackground
            source={{ uri: "https://imgs.search.brave.com/4U0LkWArK7OUX_qjgud232o_Z9O_5uaa59hisStNYxU/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly93YWxs/cGFwZXJjYXZlLmNv/bS93cC93cDEwMTQy/MzQxLmpwZw" }}
            className="flex-1"
            resizeMode="cover"
        >
            <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
                keyboardVerticalOffset={Platform.OS === "ios" ? 60 : 0}
            >
                <ScrollView
                    showsVerticalScrollIndicator={false}
                    className="flex-1 bg-black/40 ">
                    <View className='p-5 mt-10 mb-5 flex flex-row gap-2 justify-center'>
                        <View className={` bg-white self-start  p-3 rounded-[10px]`}>
                            <Image
                                source={require('../../assets/img/logo.jpg')}
                                className='h-14 w-14'
                                resizeMode="cover"

                            />
                        </View>
                        <View>
                            <Text className="text-white text-[23px] font-bold m-0 p-0 leading-none mt-3">Arbitration Admission Form</Text>
                            <Text className="text-white text-[14px] ">Submit your legal arbitration case details</Text>
                        </View>
                    </View>
                    <View className=' h-max bg-white rounded-[10px] px-8 py-5 gap-5 mx-4 mb-2'>
                        <View className='flex flex-col gap-3'>
                            <Text className={` text-[23px] font-bold `} style={{ lineHeight: 18 }}>Claimant Details</Text>
                            <Text className={`text-gray-500 mt-[-4px]`} style={{ lineHeight: 14 }}>Information about the party filing the claim</Text>
                        </View>
                        {/* PopUp Form */}
                        <PopupForm
                            visible={visible}
                            onClose={() => setVisible(false)}
                            onSubmit={handleFormSubmit}
                        />

                        {/* cards shows addedclaimant */}

                        <Detailscards
                            heading={"Claimant"}
                            detaillist={claimants}
                            remove={removeClaimant}
                        />



                        {/* Button popup form Claimant */}
                        <View className={`text-center items-center gap-2`}>
                            <Pressable
                                className={` bg-black flex items-center py-5 rounded-full w-full`}
                                onPress={() => setVisible(true)}
                            ><Text className={` text-white font-semibold text-[16px]`}>+ Add Claimant</Text></Pressable>

                            {errors.claimants && <Text className="text-red-600 text-sm">{errors.claimants}</Text>}

                        </View>
                        <View className='flex flex-col gap-3 mt-5'>
                            <Text className={` text-[23px] font-bold `} style={{ lineHeight: 25 }}>Respondent Details</Text>
                            <Text className={`text-gray-500 mt-[-4px]`} style={{
                                lineHeight: 16

                            }}>Respondent Details</Text>
                        </View>

                        <RPopupForm
                            visible={Rvisible}
                            onClose={() => setRVisible(false)}
                            onSubmit={handleFormSubmitR}
                        />

                        {/* cards shows addedclaimant */}
                        <Detailscards
                            heading={"Responded"}
                            detaillist={Respondent}
                            remove={removeRespondent}
                        />

                        {/* Button popup form Respondent */}
                        <View className={`text-center items-center gap-2`}>
                            <Pressable
                                className={` bg-red-600 flex items-center py-5 rounded-full w-full`}
                                onPress={() => setRVisible(true)}
                            ><Text className={` text-white font-semibold text-[16px]`}>+ Add Respondent</Text></Pressable>
                            {errors.respondents && <Text className="text-red-600 text-sm">{errors.respondents}</Text>}
                        </View>

                        <View className='flex flex-col gap-3 mt-5'>
                            <Text className={` text-[23px] font-bold `} style={{ lineHeight: 25 }}>Legal Clauses</Text>
                            <Text className={`text-gray-500 mt-[-4px]`} style={{ lineHeight: 16 }}>Enter the relevant legal clauses for your case</Text>
                        </View>

                        <View className={`gap-2`}>
                            <View>
                                <Text>Default Clause <Text className={`text-red-500 text-[15px]`}>*</Text></Text>
                                <TextInput
                                    multiline
                                    onChangeText={(v) => setDefaultClause(v.trim() ? v : false)}
                                    placeholder="Enter default clause details..."
                                    placeholderTextColor="#bdbdbd"
                                    style={{ minHeight: 80, textAlignVertical: 'top', }}
                                    className={`px-5 py-3 border rounded-lg mb-1 mt-2 ${errors.defaultClause ? 'border-red-500' : 'border-gray-300'} `}
                                />
                                {errors.defaultClause && <Text className="text-red-600 text-sm">{errors.defaultClause}</Text>}
                            </View>
                            <View>
                                <Text>Jurisdiction <Text className={`text-red-500 text-[15px]`}>*</Text></Text>
                                <TextInput
                                    onChangeText={(v) => setJurisdiction(v.trim() ? v : false)}
                                    placeholder="e.g.. Mumbai, Maharashtra, India"
                                    placeholderTextColor="#bdbdbd"
                                    className={`px-5 py-3 border rounded-lg mb-1 mt-2 ${errors.defaultClause ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.jurisdiction && <Text className="text-red-600 text-sm">{errors.jurisdiction}</Text>}
                            </View>
                            <View>
                                <Text>Arbitration Clause <Text className={`text-red-500 text-[15px]`}>*</Text></Text>
                                <TextInput
                                    multiline
                                    onChangeText={(v) => setArbitrationClause(v.trim() ? v : false)}
                                    placeholder="Enter arbitration clause details..."
                                    placeholderTextColor="#bdbdbd"
                                    style={{ minHeight: 80, textAlignVertical: 'top', }}
                                    className={`px-5 py-3 border rounded-lg mb-1 mt-2 ${errors.defaultClause ? 'border-red-500' : 'border-gray-300'}`}
                                />
                                {errors.arbitrationClause && <Text className="text-red-600 text-sm">{errors.arbitrationClause}</Text>}
                            </View>
                        </View>

                        <View className='flex flex-col gap-3 mt-5 w-full'>
                            <Text className={` text-[23px] font-bold `} style={{ lineHeight: 25 }}>Relief Sought</Text>
                            <Text className={`text-gray-500 mt-[-4px] w-full`} style={{ lineHeight: 16 }}>Describe the relief you are seeking from this arbitration</Text>
                        </View>

                        <View>
                            <TextInput
                                multiline
                                onChangeText={(v) => setReliefSought(v.trim() ? v : false)}
                                placeholder="Describe the relief sought in detail..."
                                placeholderTextColor="#bdbdbd"
                                style={{ minHeight: 80, textAlignVertical: 'top', }}
                                className={`px-5 py-3 border rounded-lg mb-1 mt-2 ${errors.defaultClause ? 'border-red-500' : 'border-gray-300'} flex`}
                            />
                            {errors.reliefSought && <Text className="text-red-600 text-sm">{errors.reliefSought}</Text>}
                        </View>

                        <View className='flex flex-col gap-3 mt-5 w-full'>
                            <Text className={` text-[23px] font-bold `} style={{ lineHeight: 25 }}>Claim Amount</Text>
                            <Text className={`text-gray-500 mt-[-4px] w-full`} style={{ lineHeight: 16 }}>Enter the total monetary claim amount</Text>
                        </View>
                        <View>
                            <View className={`flex flex-row gap-2 items-center border ${errors.defaultClause ? 'border-red-500' : 'border-gray-300'} px-5 py-1 rounded-lg mb-1 mt-2`}>
                                <Text>₹</Text>
                                <TextInput
                                    onChangeText={(v) => setClaimAmount(v.trim() ? v : false)}
                                    keyboardType="phone-pad"
                                    placeholder="0.0"
                                    placeholderTextColor="#bdbdbd"
                                    className={`w-full `}
                                />
                            </View>
                            {errors.claimAmount && <Text className="text-red-600 text-sm">{errors.claimAmount}</Text>}
                            <Text className={`text-gray-500`}>Enter the total claim amount in Indian Rupees</Text>
                        </View>

                        <View className='flex flex-col gap-3 mt-5 w-full'>
                            <Text className={` text-[23px] font-bold `} style={{ lineHeight: 25 }}>Required Documents</Text>
                            <Text className={`text-gray-500 mt-[-4px] w-full`} style={{ lineHeight: 16 }}>Upload all required PDF documents</Text>
                        </View>

                        <View className={`gap-3`}>
                            <View className={`gap-2`}>
                                <Text className={`text-gray-500 text-[15px]`}>POA/ID Card/LOA <Text className={`text-red-500 text-[15px]`}>*</Text></Text>
                                <SelectDocument
                                    onFileSelect={setposidcardloa}
                                    file={posidcardloa}
                                    vali={errors.posidcardloa ? 'red-500' : 'gray-300'}
                                    textvali={errors.posidcardloa ? 'red-500' : 'gray-500'}
                                    logovali={errors.posidcardloa ? '#FF2E2E' : '#6B7280'}
                                />
                                {errors.posidcardloa && <Text className="text-red-600 text-sm">{errors.posidcardloa}</Text>}
                            </View>
                            <View className={`gap-2`}>
                                <Text className={`text-gray-500 text-[15px]`}>LRN/Demand Notice <Text className={`text-red-500 text-[15px]`}>*</Text></Text>
                                <SelectDocument
                                    onFileSelect={setlrndemandnotice}
                                    file={lrndemandnotice}
                                    vali={errors.posidcardloa ? 'red-500' : 'gray-300'}
                                    textvali={errors.posidcardloa ? 'red-500' : 'gray-500'}
                                    logovali={errors.posidcardloa ? '#FF2E2E' : '#6B7280'}
                                />
                                {errors.lrndemandnotice && <Text className="text-red-600 text-sm">{errors.lrndemandnotice}</Text>}
                            </View>
                            <View className={`gap-2`}>
                                <Text className={`text-gray-500 text-[15px]`}>Copy of Agreement <Text className={`text-red-500 text-[15px]`}>*</Text></Text>
                                <SelectDocument
                                    onFileSelect={setcopyofagreement}
                                    file={copyofagreement}
                                    vali={errors.posidcardloa ? 'red-500' : 'gray-300'}
                                    textvali={errors.posidcardloa ? 'red-500' : 'gray-500'}
                                    logovali={errors.posidcardloa ? '#FF2E2E' : '#6B7280'}
                                />
                                {errors.copyofagreement && <Text className="text-red-600 text-sm">{errors.copyofagreement}</Text>}
                            </View>
                            <View className={`gap-2`}>
                                <Text className={`text-gray-500 text-[15px]`}>Copy of Order <Text className={`text-red-500 text-[15px]`}>*</Text></Text>
                                <SelectDocument
                                    onFileSelect={setcopyoforder}
                                    file={copyoforder}
                                    vali={errors.posidcardloa ? 'red-500' : 'gray-300'}
                                    textvali={errors.posidcardloa ? 'red-500' : 'gray-500'}
                                    logovali={errors.posidcardloa ? '#FF2E2E' : '#6B7280'}
                                />
                                {errors.copyoforder && <Text className="text-red-600 text-sm">{errors.copyoforder}</Text>}
                            </View>
                        </View>

                        <FormProgressCard
                            completed={[
                                claimants.length > 0,
                                Respondent.length > 0,
                                defaultClause && jurisdiction && arbitrationClause,
                                posidcardloa && lrndemandnotice && copyofagreement && copyoforder,
                                reliefSought && claimAmount
                            ]}
                        />
                        <View className={` flex justify-center items-center`}>
                            <Pressable
                                className={`bg-black flex items-center py-5 rounded-[14px] mt-6 w-full mb-2`}
                                onPress={handleSubmit}
                            >
                            
                                        <Text className={` text-white font-bold text-[16px] `}>Submit Admission From</Text> 
                            
                            </Pressable>
                            <Text className={`text-gray-500 text-[10px] w-[250px] text-center`}>By submitting this form, you agree to the terms and conditions of the arbitration process.</Text>
                        </View>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}