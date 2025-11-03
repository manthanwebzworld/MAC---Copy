import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
// Make sure you have react-native-vector-icons installed
import Ionicons from 'react-native-vector-icons/Ionicons'; 

const ContactCard = ({ contact, index }) => {
  // Use a destructuring alias 'c' for cleaner code as in your original example
  const c = contact; 

  // Function to clean up the address string
  const getFullAddress = () => {
    const parts = [c.address, c.city, c.state, c.country, c.zipCode].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : "N/A";
  };

  return (
    <View key={index} style={styles.card}>
      
      {/* Name Section with Unique Background/Underline */}
      <View style={styles.nameContainer}>
        <Text style={styles.name}>{c.fullName}</Text>
      </View>

      {/* Contact Details */}
      <View style={styles.detailSection}>
        
        <View style={styles.row}>
          <Ionicons name="mail-outline" style={styles.icon} />
          <View>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{c.email || "N/A"}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Ionicons name="call-outline" style={styles.icon} />
          <View>
            <Text style={styles.label}>Phone</Text>
            <Text style={styles.value}>{c.phoneNumber || "N/A"}</Text>
          </View>
        </View>
      </View>
      
      {/* Address Section */}
      <View style={styles.row}>
        <Ionicons name="location-outline" style={styles.icon} />
        <View style={{ flexShrink: 1 }}> {/* Ensures address text wraps */}
          <Text style={styles.label}>Address</Text>
          <Text style={styles.value}>{getFullAddress()}</Text>
        </View>
      </View>

    </View>
  );
};

export default ContactCard;

const styles = StyleSheet.create({
  // --- Card Container ---
  card: {
    backgroundColor: '#FFFFFF', // Clean white background
    borderRadius: 16, // Soft rounded corners
    padding: 20,
    marginVertical: 10,
    marginHorizontal: 16,
    // Modern Shadow (iOS)
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    // Modern Shadow (Android)
    elevation: 5,
  },

  // --- Name Section ---
  nameContainer: {
    // Unique "underline" effect using a bottom border or margin/padding
    borderBottomWidth: 2, 
    borderBottomColor: '#6366F1', // A modern, vibrant color (e.g., Indigo)
    paddingBottom: 8,
    marginBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: '700', // Bold for clear hierarchy
    color: '#1F2937', // Dark, readable text
  },
  
  // --- Detail Sections (Email/Phone) ---
  detailSection: {
    marginBottom: 15,
    borderBottomWidth: 1, // Subtle separator
    borderBottomColor: '#F3F4F6',
    paddingBottom: 15,
  },

  // --- Individual Row Layout ---
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start', // Align items to the top of the icon/text block
    marginBottom: 10,
  },

  // --- Icon Styling ---
  icon: {
    fontSize: 20,
    color: '#6366F1', // Use the same primary color for icons
    marginRight: 10,
    marginTop: 2, // Fine-tune alignment with text
  },

  // --- Text Labels ---
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: '#6B7280', // Subtle gray for labels
    textTransform: 'uppercase',
  },

  // --- Text Values ---
  value: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 2,
  },
});