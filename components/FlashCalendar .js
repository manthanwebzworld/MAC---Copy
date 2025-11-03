import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';

// Configure locale (move outside component to avoid re-renders)
LocaleConfig.locales['en'] = {
  monthNames: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ],
  monthNamesShort: [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ],
  dayNames: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  dayNamesShort: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  today: 'Today'
};
LocaleConfig.defaultLocale = 'en';

export const FlashCalendar = ({ 
  nextHearingDates = [], 
  calendarValue, 
  setCalendarValue 
}) => {
  // ALL HOOKS MUST BE CALLED UNCONDITIONALLY AT THE TOP LEVEL
  
  // Safe calendar value with default - ALWAYS CALLED
  const safeCalendarValue = useMemo(() => {
    if (calendarValue instanceof Date && !isNaN(calendarValue)) {
      return calendarValue;
    }
    return new Date();
  }, [calendarValue]);

  // Current date string - ALWAYS CALLED
  const currentDateString = useMemo(() => {
    return safeCalendarValue.toISOString().split('T')[0];
  }, [safeCalendarValue]);

  // Selected date state - ALWAYS CALLED
  const [selectedDate, setSelectedDate] = useState(currentDateString);

  // Marked dates - ALWAYS CALLED
  const markedDates = useMemo(() => {
    const marked = {};
    
    if (!nextHearingDates || !Array.isArray(nextHearingDates)) {
      return marked;
    }
    
    nextHearingDates.forEach(hearing => {
      if (!hearing?.nextHearing) return;
      
      try {
        const hearingDate = new Date(hearing.nextHearing);
        if (isNaN(hearingDate.getTime())) return;
        
        const dateStr = hearingDate.toISOString().split('T')[0];
        
        if (!marked[dateStr]) {
          marked[dateStr] = {
            dots: [],
            selected: selectedDate === dateStr,
            selectedColor: '#3b82f6',
          };
        }
        
        marked[dateStr].dots.push({
          color: hearing.status === 'SCHEDULED' ? '#2563eb' : '#f97316',
          selectedDotColor: 'white',
        });
        
        marked[dateStr].customStyles = {
          container: {
            backgroundColor: '#f0f9ff',
            borderRadius: 8,
          },
          text: {
            color: '#1e40af',
            fontWeight: 'bold',
          },
        };
      } catch (error) {
        console.warn('Invalid hearing date:', hearing.nextHearing);
      }
    });
    
    // Mark selected date
    if (selectedDate) {
      marked[selectedDate] = {
        ...marked[selectedDate],
        selected: true,
        selectedColor: '#3b82f6',
      };
    }
    
    return marked;
  }, [nextHearingDates, selectedDate]);

  // Filter hearings for selected date - ALWAYS CALLED
  const selectedDateHearings = useMemo(() => {
    if (!selectedDate) return [];
    
    return nextHearingDates.filter(hearing => {
      if (!hearing?.nextHearing) return false;
      try {
        const hearingDate = new Date(hearing.nextHearing);
        return hearingDate.toISOString().split('T')[0] === selectedDate;
      } catch {
        return false;
      }
    });
  }, [nextHearingDates, selectedDate]);

  // Event handlers - defined after all hooks
  const onDayPress = (day) => {
    setSelectedDate(day.dateString);
    if (setCalendarValue) {
      setCalendarValue(new Date(day.dateString));
    }
  };

  // RENDER LOGIC - No conditional hook calls before this point
  return (
    <View style={styles.container}>
      <Calendar
        current={currentDateString}
        onDayPress={onDayPress}
        markedDates={markedDates}
        markingType={'multi-dot'}
        theme={{
          backgroundColor: '#ffffff',
          calendarBackground: '#ffffff',
          textSectionTitleColor: '#6b7280',
          selectedDayBackgroundColor: '#3b82f6',
          selectedDayTextColor: '#ffffff',
          todayTextColor: '#dc2626',
          dayTextColor: '#1f2937',
          textDisabledColor: '#d1d5db',
          dotColor: '#3b82f6',
          selectedDotColor: '#ffffff',
          arrowColor: '#3b82f6',
          monthTextColor: '#1f2937',
          textDayFontWeight: '400',
          textMonthFontWeight: 'bold',
          textDayHeaderFontWeight: '500',
          textDayFontSize: 16,
          textMonthFontSize: 18,
          textDayHeaderFontSize: 12,
        }}
        style={styles.calendar}
      />
      
      {/* Selected Date Hearings - Conditional RENDERING is fine after hooks */}
      {selectedDateHearings.length > 0 && (
        <View style={styles.selectedDateContainer}>
          <Text style={styles.selectedDateTitle}>
            Hearings on {new Date(selectedDate).toLocaleDateString()}
          </Text>
          {selectedDateHearings.map((hearing, index) => (
            <View key={`${hearing.caseId}-${index}`} style={styles.hearingItem}>
              <Text style={styles.caseId}>#{hearing.caseId}</Text>
              <Text style={styles.caseTitle}>{hearing.caseTitle || `Case ${hearing.caseId}`}</Text>
              <View style={[
                styles.statusBadge,
                hearing.status === 'SCHEDULED' ? styles.scheduledBadge : styles.hearingBadge
              ]}>
                <Text style={[
                  styles.statusText,
                  hearing.status === 'SCHEDULED' ? styles.scheduledText : styles.hearingText
                ]}>
                  {hearing.status}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  calendar: {
    borderRadius: 12,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedDateContainer: {
    marginTop: 20,
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  selectedDateTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 12,
  },
  hearingItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  caseId: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  caseTitle: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  scheduledBadge: {
    backgroundColor: '#dbeafe',
  },
  hearingBadge: {
    backgroundColor: '#fed7aa',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '600',
  },
  scheduledText: {
    color: '#1e40af',
  },
  hearingText: {
    color: '#ea580c',
  },
});