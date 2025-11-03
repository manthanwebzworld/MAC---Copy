import { useEffect, useState } from "react";
import { Modal, View, Text, Pressable, Image } from "react-native";

export default function Detailscards({ heading, detaillist, remove }) {
    return detaillist.map((c, i) => (
        <View key={i} className="bg-gray-50 p-2 mb-3 rounded-[10px] shadow">
            <View className={`flex flex-row justify-between mb-1`}>
                <Text className="font-bold text-lg">
                    <View className={`h-3 w-3 rounded-full bg-blue-600`}></View> {heading} {i + 1}
                </Text>
                <Pressable onPress={() => remove(i)}>
                    <Image
                        source={require('../assets/img/wrong.png')}
                        style={{ height: 20, width: 20 }}
                        resizeMode="cover"
                    />
                </Pressable>
            </View>
            <View className={`px-6`}>
                {/* Primary Address Details */}
                <Text className="font-semibold mt-2 text-blue-600">Primary Address</Text>
                <Text>{c.fullName}</Text>
                <Text>{c.phoneNumber}</Text>
                <Text>{c.email}</Text>
                <Text>{c.address}</Text>
                <Text>{c.city}, {c.state}, {c.country} - {c.zipCode}</Text>
                
                {/* Secondary Address Details - Only show if any secondary field exists */}
                {(c.secondaryEmail || c.secondaryAddress || c.secondaryCountry || c.secondaryState || c.secondaryCity || c.secondaryZipCode) && (
                    <View className="mt-3 border-t border-gray-300 pt-2">
                        <Text className="font-semibold text-green-600">Secondary Address</Text>
                        {c.secondaryEmail && <Text>Email: {c.secondaryEmail}</Text>}
                        {c.secondaryAddress && <Text>Address: {c.secondaryAddress}</Text>}
                        {(c.secondaryCity || c.secondaryState || c.secondaryCountry) && (
                            <Text>Location: {c.secondaryCity}{c.secondaryState && `, ${c.secondaryState}`}{c.secondaryCountry && `, ${c.secondaryCountry}`}</Text>
                        )}
                        {c.secondaryZipCode && <Text>Pincode: {c.secondaryZipCode}</Text>}
                    </View>
                )}
            </View>
        </View>
    ));
}