import React, { useState } from "react";
import { View, Text, Modal, Pressable } from "react-native";

export default function ErrorPopupExample({error, message}) {
  const [showError, setShowError] = useState(false);

  return (
    <View className="flex-1 justify-center items-center bg-gray-100">
      <Pressable
        className="bg-blue-500 p-4 rounded-full"
        onPress={() => setShowError(true)}
      >
        <Text className="text-white">Trigger Error Popup</Text>
      </Pressable>

      {/* Error Popup Modal */}
      <Modal
        visible={showError}
        transparent
        animationType="fade"
        onRequestClose={() => setShowError(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-6 w-80 shadow-md items-center">
            <Text className="text-red-600 font-bold text-lg mb-2">{error}</Text>
            <Text className="text-gray-700 text-center mb-4">
              {message}
            </Text>
            <Pressable
              className="bg-blue-500 px-5 py-2 rounded-full"
              onPress={() => setShowError(false)}
            >
              <Text className="text-white font-semibold">OK</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}
