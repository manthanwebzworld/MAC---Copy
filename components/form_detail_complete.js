import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FormProgressCard({ completed }) {
  const totalSections = 5;
  const completedCount = completed.filter(Boolean).length;
  const progressPercent = (completedCount / totalSections) * 100;

  const sections = [
    'Claimant Details',
    'Respondent Details',
    'Legal Clauses',
    'Documents',
    'Relief & Amount',
  ];

  return (
    <View className="bg-white">
      <Text className="text-[20px] font-bold mb-3">Form Progress</Text>

      {sections.map((section, index) => (
        <View key={index} className="flex flex-row justify-between items-center mb-2">
          <Text className="text-[16px] text-black">{section}</Text>
          {completed[index] ? (
            <Ionicons name="checkmark-circle" size={18} color="green" />
          ) : (
            <Ionicons name="ellipse-outline" size={18} color="#9ca3af" />
          )}   
        </View>
      ))}

      <View className="border-t border-gray-200 my-3" />

      <View className="flex flex-row justify-between items-center mb-2">
        <Text className="text-[16px] text-black">Overall Progress</Text>
        <Text className="text-sm text-blue-600 font-medium">
          {completedCount}/{totalSections}
        </Text>
      </View>

      <View className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <View
          className="h-full bg-blue-600"
          style={{ width: `${progressPercent}%` }}
        />
      </View>
    </View>
  );
}
