import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAdmissionProxy, LoginProxy, RegisterProxy } from '../proxy/main/Authproxy';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loginerror, setLoginerror] = useState(null);

  console.log('🔐 AuthContext - loading:', loading, 'type:', typeof loading);
  console.log('🔐 AuthContext - loginerror:', loginerror, 'type:', typeof loginerror);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        console.log('📦 AsyncStorage user:', storedUser ? 'exists' : 'null');
        
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          console.log('👤 Parsed user:', parsedUser);
          setUser(parsedUser);
        }
      } catch (err) {
        console.error('❌ Error loading user:', err);
      } finally {
        console.log('✅ Setting loading to false');
        setLoading(false); // Ensure this is always boolean
      }
    };
    loadUserData();
  }, []);

  const login1 = async (username, password) => {
    console.log('🔐 login1 called with:', { username, passwordLength: password?.length });
    
    try {
      const payload = { username, password };
      const data = await LoginProxy(payload);

      console.log('📡 Login response:', data);

      if (data?.token) {
        console.log('✅ Login successful, storing token');
        await AsyncStorage.setItem("accessToken", data.token);
        await AsyncStorage.setItem("user", JSON.stringify(data));
        setUser(data);
        return true; // ✅ Explicitly return boolean
      } else {
        console.log('❌ Login failed - no token');
        Toast.show({
          type: 'error',
          text1: data.message || "Please try again later",
          position: 'top',
        });
        return false; // ✅ Explicitly return boolean
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      Toast.show({
        type: 'error',
        text1: "An unexpected error occurred. Please try again later.",
        position: 'top',
      });
      return false; // ✅ Explicitly return boolean
    }
  };

  const signup1 = async (fullName, email, phoneNumber, admissionId, username, password) => {
    console.log('📝 signup1 called');
    
    try {
      const payload = {
        username: username,
        password: password,
        admissionId: admissionId,
        fullName: fullName,
        email: email,
        phoneNo: "+91-" + phoneNumber
      };
      
      console.log('📡 Signup payload:', payload);
      const data = await RegisterProxy(payload);
      console.log('📡 Signup response:', data);
      
      if (data.status === 'success') {
        console.log('✅ Signup successful');
        Toast.show({
          type: 'success',
          text1: 'Account Created Successfully!',
          position: 'center',
        });
        return 'success'; // ✅ Return string explicitly
      } else {
        console.log('❌ Signup failed');
        Toast.show({
          type: 'error',
          text1: data.message || "Please try again later",
          position: 'top',
        });
        return 'failed'; // ✅ Return string explicitly
      }
    } catch (error) {
      console.error('❌ Signup error:', error);
      Toast.show({
        type: 'error',
        text1: "An unexpected error occurred. Please try again later.",
        position: 'top',
      });
      return 'error'; // ✅ Return string explicitly
    }
  };

  const logout = async () => {
    console.log('🚪 Logging out');
    await AsyncStorage.clear();
    setUser(null);
  };

  const Admission = async (
    defaultClause,
    jurdisction,
    arbitrationClause,
    refiefSought,
    claimAmount,
    claimants,
    respondents,
    documents
  ) => {
    console.log('📄 Admission called');
    
    try {
      const payload = {
        defaultClause,
        jurdisction,
        arbitrationClause,
        refiefSought,
        claimAmount: parseFloat(claimAmount),
        claimants,
        respondants: respondents,
        documents,
        status: "DRAFT",
      };

      console.log('📡 Admission payload:', payload);
      const data = await createAdmissionProxy(payload);
      console.log('📡 Admission response:', data);
      
      if (data.status === 'success') {
        console.log('✅ Admission successful');
        Toast.show({
          type: 'success',
          text1: 'Admission Created Successfully!',
          position: 'center',
        });
        return 'success'; // ✅ Return string explicitly
      } else {
        console.log('❌ Admission failed');
        Toast.show({
          type: 'error',
          text1: data.message || "Please try again later",
          position: 'top',
        });
        return 'failed'; // ✅ Return string explicitly
      }
    } catch (error) {
      console.error('❌ Admission error:', error);
      Toast.show({
        type: 'error',
        text1: "An unexpected error occurred. Please try again later.",
        position: 'top',
      });
      return 'error'; // ✅ Return string explicitly
    }
  };

  // ✅ Ensure all values are the correct type when providing
  const contextValue = {
    user,
    login1,
    logout,
    signup1,
    loading: Boolean(loading), // ✅ Force to boolean
    loginerror,
    Admission
  };

  console.log('🎁 Context value types:', {
    user: typeof contextValue.user,
    loading: typeof contextValue.loading,
    loginerror: typeof contextValue.loginerror,
  });

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};