import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { useTheme } from '@/services/ThemeProvider';

interface TimePickerModalProps {
  isVisible: boolean;
  onClose: () => void;
  onTimeSelect: (time: string) => void;
  initialTime?: string;
  title: string;
}

export function TimePickerModal({
  isVisible,
  onClose,
  onTimeSelect,
  initialTime = '09:00',
  title,
}: TimePickerModalProps) {
  const { theme } = useTheme();
  const [selectedHour, setSelectedHour] = useState(
    parseInt(initialTime.split(':')[0])
  );
  const [selectedMinute, setSelectedMinute] = useState(
    parseInt(initialTime.split(':')[1])
  );

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const handleConfirm = () => {
    const timeString = `${selectedHour.toString().padStart(2, '0')}:${selectedMinute
      .toString()
      .padStart(2, '0')}`;
    onTimeSelect(timeString);
    onClose();
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.cancelButton, { color: theme.textSecondary }]}>Cancel</Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <TouchableOpacity onPress={handleConfirm}>
            <Text style={[styles.confirmButton, { color: theme.primary }]}>Done</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pickerContainer}>
          <View style={styles.pickerColumn}>
            <Text style={[styles.columnTitle, { color: theme.text }]}>Hour</Text>
            <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
              {hours.map((hour) => (
                <TouchableOpacity
                  key={hour}
                  style={[
                    styles.pickerItem,
                    selectedHour === hour && [styles.selectedItem, { backgroundColor: theme.primary }],
                  ]}
                  onPress={() => setSelectedHour(hour)}
                >
                  <Text
                    style={[
                      styles.pickerText,
                      { color: theme.text },
                      selectedHour === hour && styles.selectedText,
                    ]}
                  >
                    {hour.toString().padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <View style={styles.separator}>
            <Text style={[styles.separatorText, { color: theme.text }]}>:</Text>
          </View>

          <View style={styles.pickerColumn}>
            <Text style={[styles.columnTitle, { color: theme.text }]}>Minute</Text>
            <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
              {minutes.map((minute) => (
                <TouchableOpacity
                  key={minute}
                  style={[
                    styles.pickerItem,
                    selectedMinute === minute && [styles.selectedItem, { backgroundColor: theme.primary }],
                  ]}
                  onPress={() => setSelectedMinute(minute)}
                >
                  <Text
                    style={[
                      styles.pickerText,
                      { color: theme.text },
                      selectedMinute === minute && styles.selectedText,
                    ]}
                  >
                    {minute.toString().padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  cancelButton: {
    fontSize: 16,
  },
  confirmButton: {
    fontSize: 16,
    fontWeight: '600',
  },
  pickerContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  pickerColumn: {
    flex: 1,
    alignItems: 'center',
  },
  columnTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
  },
  picker: {
    height: 200,
    width: '100%',
  },
  pickerItem: {
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginVertical: 2,
  },
  selectedItem: {
    // backgroundColor will be set dynamically
  },
  pickerText: {
    fontSize: 18,
  },
  selectedText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  separator: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  separatorText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});