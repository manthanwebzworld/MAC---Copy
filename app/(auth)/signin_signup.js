import {
  ImageBackground,
  View,
  TextInput,
  Pressable,
  TouchableOpacity,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import { Text } from "react-native";
import Checkbox from "expo-checkbox";
import { useContext, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { AuthContext } from "../../auth/AuthContext";

export default function Login() {
  console.log("In Signin.js");

  const [isChecked, setChecked] = useState<boolean>(false);
  const [isPassVi, setPassVi] = useState<boolean>(false);
  const [isPassVi2, setPassVi2] = useState<boolean>(false);
  const [isLogin, setLogin] = useState<boolean>(true);

  const { login1, signup1 } = useContext(AuthContext);

  // Login variables
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Signup variables
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [admissionId, setAdmissionId] = useState("");
  const [signusername, setSignusername] = useState("");
  const [signpassword, setSignpassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Signup verification
  const [passcheck, setPasscheck] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(false);
  const [loginerror, setLoginerror] = useState<boolean>(false);

  // Debug logs for boolean props
  console.log("isChecked:", isChecked, "typeof:", typeof isChecked);
  console.log("isPassVi:", isPassVi, "typeof:", typeof isPassVi);
  console.log("isPassVi2:", isPassVi2, "typeof:", typeof isPassVi2);
  console.log("loading:", loading, "typeof:", typeof loading);
  console.log("loginerror:", loginerror, "typeof:", typeof loginerror);
  console.log("passcheck:", passcheck, "typeof:", typeof passcheck);

  // Login
  const handleLogin = async () => {
    setLoading(true);
    const success = await login1(username, password); 
    setLoading(false);

    if (success) {
      router.replace("/(tabs)/dashboard");
    } else {
      setLoginerror(true);
    }
  };

  // Signup
  const handleSignup = async () => {
    setLoading(true);
    const signcheck = await signup1(
      fullName,
      email,
      phoneNumber,
      admissionId,
      signusername,
      signpassword
    );
    setLoading(false);

    if (signcheck === "success") {
      router.replace("/(auth)/signin_signup");
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
                    <View className='p-5 mt-10 mb-5'>
                        <View className={` bg-white self-start  p-3 rounded-[10px]`}>
                            <Image
                                source={require('../../assets/img/logo.jpg')}
                                className='h-14 w-14'
                                resizeMode="cover"

                            />
                        </View>
                        <Text className="text-white text-[40px] font-bold m-0 p-0 leading-none mt-3">{isLogin ? "Welcome" : "Let's Get"}</Text>
                        <Text className="text-white text-[40px] font-bold m-0 p-0 leading-none">{isLogin ? "Back" : "Started"}</Text>
                        <Text className="text-white text-[14px] ">{isLogin ? "Please log in to continue." : "Join us by filling in the information below."}</Text>
                    </View>
                    <View className='w-screen h-full bg-white rounded-t-[20px] p-8 gap-5'>
                        <View className="flex flex-row gap-3 bg-gray-200 p-2 rounded-full">
                            <Pressable
                                onPress={() => setLogin(true)}
                                className={`flex-1 px-8 py-3 rounded-full items-center ${isLogin ? "bg-white" : "bg-tr"}`}
                            >
                                <Text className="text-black font-bold">Sign In</Text>
                            </Pressable>
                            <Pressable className={`flex-1 px-8 py-3 rounded-full items-center ${!isLogin ? "bg-white" : "bg-tr"}`}
                                onPress={() => { setLogin(false), setLoginerror(false) }}
                            >
                                <Text className="text-black">Sign Up</Text>
                            </Pressable>
                        </View>

                        <View className='flex flex-col gap-3'>
                            {isLogin ? (
                                <><View className='flex flex-col gap-2'>
                                    <Text>Username</Text>
                                    <TextInput
                                        placeholder="Enter your username"
                                        className={`px-5 py-5 border-[1px] border-gray-200 rounded-full w-full ${loginerror ? 'border-red-500' : 'border-gray-200'} `}
                                        // value="{username}"
                                        onChangeText={setUsername}
                                    />
                                </View><View className='flex flex-col gap-2'>
                                        <Text>Password</Text>
                                        <View className={`flex flex-row px-5 py-2 border-[1px]  rounded-full w-max justify-between items-center relative ${loginerror ? 'border-red-500' : 'border-gray-200'} `}>
                                            <TextInput
                                                placeholder="* * * * *"
                                                className={`w-full `}
                                                secureTextEntry={!isPassVi}
                                                // value="{password}"
                                                onChangeText={setPassword}

                                            />
                                            {/* <TouchableOpacity
                                                onPress={() => setPassVi(!isPassVi)}
                                                className="absolute right-[20px]"
                                            >
                                                <Ionicons
                                                    name={isPassVi ? "eye-off" : "eye"}
                                                    size={24}
                                                    color="gray"

                                                />
                                            </TouchableOpacity> */}
                                        </View>
                                        {loginerror && <Text className="text-red-500">The username or password is incorrect</Text>}
                                        <View className='flex flex-row justify-between mt-2'>
                                            <View className='flex flex-row gap-2' >
                                                <Checkbox
                                                    value={isChecked}
                                                    onValueChange={setChecked}
                                                    color={isChecked ? "#2563eb" : 'transparent'}
                                                    className='border-[1px] border-[#cccc] '
                                                />
                                                <Pressable onPress={() => { setChecked(!isChecked) }}><Text>Remide me</Text></Pressable>
                                            </View>
                                            {/* <Pressable>
                                                <Text className='underline'>Forget Password?</Text>
                                            </Pressable> */}
                                        </View>

                                        <Pressable className='W-full rounded-full justify-center items-center py-5 bg-blue-500 mt-4' onPress={handleLogin}>
                                            {loading ? (
                                                <ActivityIndicator color="#fff" />
                                            ) : (
                                                <Text className='text-white font-semibold text-[16px]'>Sign In</Text>)}

                                        </Pressable>
                                    </View>
                                    <View className={` flex flex-row justify-center items-center gap-1`}>
                                        <Text className={`text-gray-500`}>Don't have an account?</Text>
                                        <Pressable
                                            onPress={() => setLogin(false)}
                                        ><Text className={` font-semibold `}>Sign Up</Text></Pressable>
                                    </View>
                                </>

                            ) : (
                                // Sign Up Page
                                <>
                                    <View className="flex flex-col gap-2">
                                        <Text>Full Name *</Text>
                                        <TextInput
                                            placeholder="Enter your full name"
                                            value={fullName}
                                            onChangeText={setFullName}
                                            className="px-5 py-5 border-[1px] border-gray-200 rounded-full w-full"
                                        />
                                    </View>

                                    {/* Email */}
                                    <View className="flex flex-col gap-2">
                                        <Text>Email *</Text>
                                        <TextInput
                                            placeholder="Enter your email"
                                            value={email}
                                            onChangeText={setEmail}
                                            keyboardType="email-address"
                                            className="px-5 py-5 border-[1px] border-gray-200 rounded-full w-full"
                                        />
                                    </View>

                                    {/* Phone Number */}
                                    <View className="flex flex-col gap-2">
                                        <Text>Phone Number *</Text>
                                        <TextInput
                                            placeholder="Enter your phone number"
                                            value={phoneNumber}
                                            onChangeText={setPhoneNumber}
                                            keyboardType="phone-pad"
                                            className="px-5 py-5 border-[1px] border-gray-200 rounded-full w-full"
                                        />
                                    </View>

                                    {/* Admission ID */}
                                    <View className="flex flex-col gap-2">
                                        <Text>Admission ID *</Text>
                                        <TextInput
                                            placeholder="ADIDXXXXXXXXX154"
                                            value={admissionId}
                                            onChangeText={setAdmissionId}
                                            className="px-5 py-5 border-[1px] border-gray-200 rounded-full w-full"
                                        />
                                        <Pressable
                                            className="flex items-end"
                                            onPress={() => router.push("/(auth)/admission_form")}
                                        >
                                            <Text className="text-blue-600">Don't have? Click here to create</Text>
                                        </Pressable>
                                    </View>

                                    {/* Username */}
                                    <View className="flex flex-col gap-2">
                                        <Text>Username *</Text>
                                        <TextInput
                                            placeholder="Choose your username"
                                            value={signusername}
                                            onChangeText={setSignusername}
                                            className="px-5 py-5 border-[1px] border-gray-200 rounded-full w-full"
                                        />
                                    </View>

                                    {/* Password */}
                                    <View className="flex flex-col gap-2">
                                        <Text>Password *</Text>
                                        <View className={`flex flex-row px-5 py-2 border-[1px] rounded-full w-full justify-between items-center ${passcheck ? 'border-red-500' : 'border-gray-200'}`}>
                                            <TextInput
                                                placeholder="Create a password"
                                                value={signpassword}
                                                onChangeText={setSignpassword}
                                                secureTextEntry={!isPassVi}
                                                className="flex-1"
                                            />
                                            <TouchableOpacity onPress={() => setPassVi(!isPassVi)}>
                                                <Ionicons name={isPassVi ? "eye-off" : "eye"} size={24} color="gray" />
                                            </TouchableOpacity>
                                        </View>
                                        {passcheck && <Text className={`text-red-500`}>Password must be Same</Text>}
                                    </View>

                                    {/* Confirm Password */}
                                    <View className="flex flex-col gap-2">
                                        <Text>Confirm Password *</Text>
                                        <View className={`flex flex-row px-5 py-2 border-[1px]  rounded-full w-full justify-between items-center ${passcheck ? 'border-red-500' : 'border-gray-200'}`}>
                                            <TextInput
                                                placeholder="Confirm your password"
                                                value={confirmPassword}
                                                onChangeText={setConfirmPassword}
                                                secureTextEntry={!isPassVi2}
                                                className="flex-1"
                                            />
                                            <TouchableOpacity onPress={() => setPassVi2(!isPassVi2)}>
                                                <Ionicons name={isPassVi2 ? "eye-off" : "eye"} size={24} color="gray" />
                                            </TouchableOpacity>
                                        </View>
                                        {passcheck && <Text className={`text-red-500`}>Password must be Same</Text>}
                                    </View>
                                    <Pressable className='W-full rounded-full justify-center items-center py-5 bg-blue-500 mt-4'
                                        onPress={() => {
                                            if (signpassword !== confirmPassword) {
                                                setPasscheck(true);
                                            }
                                            else{
                                                setPasscheck(false);
                                                handleSignup()
                                            }
                                        }}
                                    >
                                        {loading ? (
                                                <ActivityIndicator color="#fff" />
                                            ) : (
                                        <Text className='text-white font-semibold text-[16px]'>Sign Up</Text> )}
                                    </Pressable>
                                    <View className={` flex flex-row justify-center items-center gap-1`}>
                                        <Text className={`text-gray-500`}>Have an account?</Text>
                                        <Pressable
                                            onPress={() => {

                                                setLogin(true);
                                            }}
                                        ><Text className={` font-semibold `}>Sign In</Text></Pressable>
                                    </View>
                                </>
                            )}
                        </View>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </ImageBackground>
    );
}

