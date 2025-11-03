import React, { useState } from 'react';
import { View, Pressable, Text, StyleSheet, Modal } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const StatusDropdown = ({ currentStatus, onStatusChange }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  const statusOptions = [
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Submitted', value: 'SUBMITTED' },
    { label: 'Under Review', value: 'UNDER_REVIEW' },
    { label: 'Approved', value: 'APPROVED' },
    { label: 'Rejected', value: 'REJECTED' },
  ];

  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    onStatusChange(status);
    setShowDropdown(false);
  };

  const getStatusColor = () => {
    if (currentStatus === 'APPROVED') {
      return {
        backgroundColor: '#f4f4f4',
        borderColor: '#d1d5db',
      };
    }
    return {
      backgroundColor: '#ffffff',
      borderColor: '#d1d5db',
    };
  };

  const getStatusTextColor = () => {
    return currentStatus === 'APPROVED' ? '#999999' : '#111827';
  };

  if (currentStatus === 'APPROVED') {
    return (
      <View style={[styles.disabledContainer, getStatusColor()]}>
        <Text style={[styles.disabledText, { color: getStatusTextColor() }]}>
          Approved
        </Text>
      </View>
    );
  }

  return (
    <View>
      <Pressable
        style={[styles.dropdownButton, getStatusColor()]}
        onPress={() => setShowDropdown(true)}
      >
        <Text style={[styles.dropdownButtonText, { color: getStatusTextColor() }]}>
          {statusOptions.find(opt => opt.value === selectedStatus)?.label || 'Select Status'}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </Pressable>

      <Modal
        visible={showDropdown}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowDropdown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Status</Text>
            {statusOptions.map((option) => (
              <Pressable
                key={option.value}
                style={styles.option}
                onPress={() => handleStatusChange(option.value)}
              >
                <Text style={styles.optionText}>{option.label}</Text>
              </Pressable>
            ))}
            <Pressable
              style={styles.cancelButton}
              onPress={() => setShowDropdown(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 150,
  },
  dropdownButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 12,
    color: '#6b7280',
  },
  disabledContainer: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 150,
    opacity: 0.8,
  },
  disabledText: {
    fontSize: 14,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxWidth: 300,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    textAlign: 'center',
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  optionText: {
    fontSize: 16,
    color: '#111827',
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
});

export default StatusDropdown;