import React from "react";
import { Pressable, Text, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from "@expo/vector-icons";

export default function SelectDocument({ onFileSelect, file, vali = 'gray-300', textvali = 'gray-500', logovali='#6B7280'  }) {
    const pickPdf = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: "application/pdf",
                copyToCacheDirectory: true,
            });

            // New API (SDK 49+)
            if (result.assets && result.assets.length > 0) {
                onFileSelect(result.assets[0]);
                return;
            }

            // Old API (SDK ≤48)
            if (result.type === "success") {
                onFileSelect(result);
            }
        } catch (error) {
            // console.log("Error picking file:", error);  
        }
    };

    return (
        <Pressable
            onPress={pickPdf}
            className={`w-full h-24 border border-dashed rounded-lg border-${vali} items-center justify-center`}
        >
            {!file ? (
                <View className="items-center">
                    <Ionicons name="cloud-upload-outline" size={32} color={logovali} />
                    <Text className={`mt-2 text-${textvali}`}>Click to upload PDF</Text>
                </View>
            ) : (
                <View className="items-center">
                    <Ionicons name="document-text-outline" size={32} color="green" />
                    <Text
                        className="mt-2 text-green-600 text-center"
                        numberOfLines={2}
                    >
                        {file.name}
                    </Text>
                </View>
            )}
        </Pressable>
    );
}
