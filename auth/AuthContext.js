import React, { createContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// import { MAIN_URI } from '../proxy/constURL';
import { createAdmissionProxy, LoginProxy, RegisterProxy } from '../proxy/main/Authproxy';
import Toast from 'react-native-toast-message';

import { router } from 'expo-router';

// import { apiFetch } from '../proxy/template/fetch_temp';

// 1️⃣ Create a Context — this will hold login info and functions
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // 2️⃣ State variables
  const [user, setUser] = useState(null);      // Stores full user object
  const [loading, setLoading] = useState(true); // Used while loading stored data
  const [loginerror, setLoginerror] = useState(null);

  // 3️⃣ Runs once when app starts — checks if user is already logged in
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem('user');
        if (storedUser) setUser(JSON.parse(storedUser)); // Restore user
      } catch (err) {
        console.error('Error loading user:', err);
      } finally {
        setLoading(false); // Done checking
      }
    };
    loadUserData();
  }, []);

  // 4️⃣ Login function
  const login1 = async (username, password, isSave) => {
    try {
      setLoginerror(null);

      const payload = { username, password };
      const data = await LoginProxy(payload);

      // console.log("Login response:", data);

      if (data?.token) {
        await AsyncStorage.setItem("accessToken", data.token);
        await AsyncStorage.setItem("user", JSON.stringify(data));
        setUser(data);
        return true;
      } else {
        Toast.show({
                type: 'error',
                text1: data.message || "Please try again later",
                position: 'top',
            });
        return false;
      }
    } catch (error) {
       Toast.show({
            type: 'error',
            text1: "An unexpected error occurred. Please try again later.",
            position: 'top',
        });
      return false;
    }
  };

  // SignUp function 
  const signup1 = async (fullName, email, phoneNumber, admissionId, username, password) => {
    try {
        const payload = {
            username: username,
            password: password,
            admissionId: admissionId,
            fullName: fullName,
            email: email,
            phoneNo: "+91-" + phoneNumber
        };
        
        // console.log("Signup user Data:", payload);
        const data = await RegisterProxy(payload);
        // console.log("Signup response:", data);
        
        if (data.status === 'success') {
            Toast.show({
                type: 'success',
                text1: 'Account Created Successfully!',
                position: 'center',
            });
        } else {
            Toast.show({
                type: 'error',
                text1: data.message || "Please try again later",
                position: 'top',
            });
        }
    } catch (error) {
        Toast.show({
            type: 'error',
            text1: "An unexpected error occurred. Please try again later.",
            position: 'top',
        });
    }
}

  // 5️⃣ Logout function
  const logout = async () => {
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
    try {
      const payload = {
        defaultClause,
        jurdisction,           // match backend spelling
        arbitrationClause,
        refiefSought,          // fix typo: not refiefSought
        claimAmount: parseFloat(claimAmount),
        claimants,
        respondants: respondents, // match backend spelling
        documents,
        status: "DRAFT",
      };

      // console.log("Admission payload:", payload);

      const data = await createAdmissionProxy(payload);
      // console.log('Admission Data',data)
       if (data.status === 'success') {
            Toast.show({
                type: 'success',
                text1: 'Admission Created Successfully!',
                position: 'center',
            });
        } else {
            Toast.show({
                type: 'error',
                text1: data.message || "Please try again later",
                position: 'top',
            });
        }
        return data.status
    } catch (error) {
        Toast.show({
            type: 'error',
            text1: "An unexpected error occurred. Please try again later.",
            position: 'top',
        });
    }
  };

  // 6️⃣ Provide the data to the whole app
  return (
    <AuthContext.Provider value={{ user, login1, logout, signup1, loading, loginerror, Admission }}>
      {children}
    </AuthContext.Provider>
  );
};
