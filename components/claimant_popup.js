import { useEffect, useState } from "react";
import { Modal, View, Text, TextInput, Pressable, ScrollView } from "react-native";

export default function PopupForm({ visible, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    country: "",
    state: "",
    city: "",
    zipCode: "",
    address: "",
    secondaryEmail: "",
    secondaryAddress: "",
    secondaryCountry: "",
    secondaryState: "",
    secondaryCity: "",
    secondaryZipCode: ""
  });

  const [errors, setErrors] = useState({});
  const [showSecondaryAddress, setShowSecondaryAddress] = useState(false);

  // Reset form every time popup opens
  useEffect(() => {
    if (visible) {
      setFormData({
        fullName: "",
        phoneNumber: "",
        email: "",
        country: "",
        state: "",
        city: "",
        zipCode: "",
        address: "",
        secondaryEmail: "",
        secondaryAddress: "",
        secondaryCountry: "",
        secondaryState: "",
        secondaryCity: "",
        secondaryZipCode: ""
      });
      setErrors({});
      setShowSecondaryAddress(false);
    }
  }, [visible]);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });

    // If there was an error for this field, re-validate it and clear if fixed
    if (errors[field]) {
      const err = validateField(field, value);
      setErrors((prev) => ({ ...prev, [field]: err })); // set to '' or message
    }
  };

  const validateField = (field, value) => {
    const val = value ?? "";
    
    // Only validate required fields (primary address fields)
    const requiredFields = [
      "fullName", "phoneNumber", "email", "country", 
      "state", "city", "zipCode", "address"
    ];
    
    if (requiredFields.includes(field)) {
      // common empty check for required fields
      if (!val || val.trim() === "") {
        return "This field can't be empty";
      }

      if (field === "phoneNumber") {
        // allow formatting but count digits only
        const digits = val.replace(/\D/g, "");
        if (digits.length !== 10) {
          return "Phone number must be 10 digits";
        }
      }

      if (field === "email") {
        // simple email check: must contain @ and .
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(val.trim())) {
          return "Please enter a valid email address";
        }
      }

      if (field === "zipCode") {
        const digits = val.replace(/\D/g, "");
        if (digits.length !== 6) {
          return "Pincode must be 6 digits";
        }
      }
    }

    // If it's a secondary field and user started filling it, validate it
    if (field.startsWith("secondary") && val.trim() !== "") {
      if (field === "secondaryEmail") {
        const emailRegex = /^\S+@\S+\.\S+$/;
        if (!emailRegex.test(val.trim())) {
          return "Please enter a valid email address";
        }
      }
      
      if (field === "secondaryZipCode") {
        const digits = val.replace(/\D/g, "");
        if (digits.length !== 6) {
          return "Pincode must be 6 digits";
        }
      }
    }

    // passes validation
    return "";
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Only validate primary fields as required
    const primaryFields = [
      "fullName", "phoneNumber", "email", "country", 
      "state", "city", "zipCode", "address"
    ];
    
    primaryFields.forEach((key) => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });

    // Validate secondary fields only if they have values
    const secondaryFields = [
      "secondaryEmail", "secondaryZipCode"
    ];
    
    secondaryFields.forEach((key) => {
      if (formData[key] && formData[key].trim() !== "") {
        const err = validateField(key, formData[key]);
        if (err) newErrors[key] = err;
      }
    });

    return newErrors;
  };

  const handleSubmit = () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Create a copy of formData and format phone number
    const formattedData = {
      ...formData,
      phoneNumber: `+91-${formData.phoneNumber}`, // prepend +91-
    };

    onSubmit(formattedData);
    onClose();
  };

  const toggleSecondaryAddress = () => {
    setShowSecondaryAddress(!showSecondaryAddress);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View className="flex-1 bg-black/50 justify-center items-center p-5 w-full">
        <View className="bg-white w-full h-max rounded-[10px] p-5 max-h-[90%]">
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text className="text-[18px] font-bold mb-4 text-center">Claimant Form</Text>

            <Text>Full Name <Text className="text-red-500 text-[15px]">*</Text></Text>
            <TextInput
              value={formData.fullName}
              onChangeText={(v) => handleChange("fullName", v)}
              placeholder="Enter your full name"
              placeholderTextColor="#bdbdbd"
              className={`px-5 py-3 border rounded-lg mb-1 mt-2 ${errors.fullName ? "border-red-500" : "border-gray-200"
                }`}
            />
            {errors.fullName ? <Text className="text-red-500 text-sm mb-2">{errors.fullName}</Text> : null}

            <Text>Phone Number <Text className="text-red-500 text-[15px]">*</Text></Text>
            <TextInput
              value={formData.phoneNumber}
              onChangeText={(v) => handleChange("phoneNumber", v)}
              placeholder="+91 00000 00000"
              keyboardType="phone-pad"
              maxLength={10}
              placeholderTextColor="#bdbdbd"
              className={`px-5 py-3 border rounded-lg mb-1 mt-2 ${errors.phoneNumber ? "border-red-500" : "border-gray-200"
                }`}
            />
            {errors.phoneNumber ? <Text className="text-red-500 text-sm mb-2">{errors.phoneNumber}</Text> : null}

            <Text>Email Address <Text className="text-red-500 text-[15px]">*</Text></Text>
            <TextInput
              value={formData.email}
              onChangeText={(v) => handleChange("email", v)}
              placeholder="name@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#bdbdbd"
              className={`px-5 py-3 border rounded-lg mb-1 mt-2 ${errors.email ? "border-red-500" : "border-gray-200"
                }`}
            />
            {errors.email ? <Text className="text-red-500 text-sm mb-2">{errors.email}</Text> : null}

            <Text>Country <Text className="text-red-500 text-[15px]">*</Text></Text>
            <TextInput
              value={formData.country}
              onChangeText={(v) => handleChange("country", v)}
              placeholder="India"
              placeholderTextColor="#bdbdbd"
              className={`px-5 py-3 border rounded-lg mb-1 mt-2 ${errors.country ? "border-red-500" : "border-gray-200"
                }`}
            />
            {errors.country ? <Text className="text-red-500 text-sm mb-2">{errors.country}</Text> : null}

            <Text>State <Text className="text-red-500 text-[15px]">*</Text></Text>
            <TextInput
              value={formData.state}
              onChangeText={(v) => handleChange("state", v)}
              placeholder="Maharashtra"
              placeholderTextColor="#bdbdbd"
              className={`px-5 py-3 border rounded-lg mb-1 mt-2 ${errors.state ? "border-red-500" : "border-gray-200"
                }`}
            />
            {errors.state ? <Text className="text-red-500 text-sm mb-2">{errors.state}</Text> : null}

            <Text>City <Text className="text-red-500 text-[15px]">*</Text></Text>
            <TextInput
              value={formData.city}
              onChangeText={(v) => handleChange("city", v)}
              placeholder="Mumbai"
              placeholderTextColor="#bdbdbd"
              className={`px-5 py-3 border rounded-lg mb-1 mt-2 ${errors.city ? "border-red-500" : "border-gray-200"
                }`}
            />
            {errors.city ? <Text className="text-red-500 text-sm mb-2">{errors.city}</Text> : null}

            <Text>PinCode <Text className="text-red-500 text-[15px]">*</Text></Text>
            <TextInput
              value={formData.zipCode}
              onChangeText={(v) => handleChange("zipCode", v)}
              placeholder="400001"
              maxLength={6}
              keyboardType="number-pad"
              placeholderTextColor="#bdbdbd"
              className={`px-5 py-3 border rounded-lg mb-1 mt-2 ${errors.zipCode ? "border-red-500" : "border-gray-200"
                }`}
            />
            {errors.zipCode ? <Text className="text-red-500 text-sm mb-2">{errors.zipCode}</Text> : null}

            <Text>Full Address <Text className="text-red-500 text-[15px]">*</Text></Text>
            <TextInput
              value={formData.address}
              onChangeText={(v) => handleChange("address", v)}
              placeholder="Enter complete address"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              placeholderTextColor="#bdbdbd"
              className={`px-5 py-3 border rounded-lg mb-1 mt-2 ${errors.address ? "border-red-500" : "border-gray-200"
                }`}
            />
            {errors.address ? <Text className="text-red-500 text-sm mb-2">{errors.address}</Text> : null}

            {/* Secondary Address Section - Dropdown */}
            <Pressable 
              onPress={toggleSecondaryAddress}
              className="flex-row justify-between items-center py-3 border-b border-gray-200 mt-4"
            >
              <Text className="text-[16px] font-semibold">Secondary Address (Optional)</Text>
              <Text className="text-lg">
                {showSecondaryAddress ? "▲" : "▼"}
              </Text>
            </Pressable>

            {showSecondaryAddress && (
              <View className="mt-2">
                <Text>Secondary Email Address</Text>
                <TextInput
                  value={formData.secondaryEmail}
                  onChangeText={(v) => handleChange("secondaryEmail", v)}
                  placeholder="secondary@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#bdbdbd"
                  className={`px-5 py-3 border rounded-lg mb-1 mt-2 ${errors.secondaryEmail ? "border-red-500" : "border-gray-200"
                    }`}
                />
                {errors.secondaryEmail ? <Text className="text-red-500 text-sm mb-2">{errors.secondaryEmail}</Text> : null}

                <Text>Secondary Country</Text>
                <TextInput
                  value={formData.secondaryCountry}
                  onChangeText={(v) => handleChange("secondaryCountry", v)}
                  placeholder="India"
                  placeholderTextColor="#bdbdbd"
                  className="px-5 py-3 border border-gray-200 rounded-lg mb-4 mt-2"
                />

                <Text>Secondary State</Text>
                <TextInput
                  value={formData.secondaryState}
                  onChangeText={(v) => handleChange("secondaryState", v)}
                  placeholder="Maharashtra"
                  placeholderTextColor="#bdbdbd"
                  className="px-5 py-3 border border-gray-200 rounded-lg mb-4 mt-2"
                />

                <Text>Secondary City</Text>
                <TextInput
                  value={formData.secondaryCity}
                  onChangeText={(v) => handleChange("secondaryCity", v)}
                  placeholder="Mumbai"
                  placeholderTextColor="#bdbdbd"
                  className="px-5 py-3 border border-gray-200 rounded-lg mb-4 mt-2"
                />

                <Text>Secondary PinCode</Text>
                <TextInput
                  value={formData.secondaryZipCode}
                  onChangeText={(v) => handleChange("secondaryZipCode", v)}
                  placeholder="400001"
                  maxLength={6}
                  keyboardType="number-pad"
                  placeholderTextColor="#bdbdbd"
                  className={`px-5 py-3 border rounded-lg mb-1 mt-2 ${errors.secondaryZipCode ? "border-red-500" : "border-gray-200"
                    }`}
                />
                {errors.secondaryZipCode ? <Text className="text-red-500 text-sm mb-2">{errors.secondaryZipCode}</Text> : null}

                <Text>Secondary Full Address</Text>
                <TextInput
                  value={formData.secondaryAddress}
                  onChangeText={(v) => handleChange("secondaryAddress", v)}
                  placeholder="Enter complete secondary address"
                  multiline
                  numberOfLines={4}
                  textAlignVertical="top"
                  placeholderTextColor="#bdbdbd"
                  className="px-5 py-3 border border-gray-200 rounded-lg mb-4 mt-2"
                />
              </View>
            )}

            {/* Actions */}
            <View className="flex-row mt-4 gap-2">
              <Pressable onPress={onClose} className="px-6 py-3 flex-1 items-center rounded-full bg-red-600">
                <Text className="text-white font-bold">Cancel</Text>
              </Pressable>
              <Pressable onPress={handleSubmit} className="bg-blue-500 px-6 py-3 flex-1 items-center rounded-full">
                <Text className="text-white font-semibold">Submit</Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}