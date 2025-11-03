import { Slot } from 'expo-router';
import { View } from 'react-native';

export default function AuthLayout() {
    return (
        <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
            {/* This will render signin.js or signup.js */}
            <Slot />
        </View>
    );
}