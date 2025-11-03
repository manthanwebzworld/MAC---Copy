// import React, { useMemo, useState, useEffect } from 'react';
// import { 
//   View, 
//   Text, 
//   TouchableOpacity, 
//   StyleSheet 
// } from 'react-native';
// import { ChevronLeft, ChevronRight } from 'lucide-react-native';

// export const CustomCalendar = ({ 
//   nextHearingDates = [], 
//   calendarValue, 
//   setCalendarValue 
// }) => {
//   // Use internal state for the displayed month view
//   const [currentView, setCurrentView] = useState({
//     month: new Date().getMonth(),
//     year: new Date().getFullYear()
//   });

//   // Update currentView when calendarValue changes from parent
//   useEffect(() => {
//     if (calendarValue instanceof Date && !isNaN(calendarValue)) {
//       setCurrentView({
//         month: calendarValue.getMonth(),
//         year: calendarValue.getFullYear()
//       });
//     }
//   }, [calendarValue]);

//   const today = useMemo(() => new Date(), []);

//   // Helper: Check if a day has hearings
//   const getHearingsForDate = (date, hearingDates) => {
//     if (!hearingDates || !Array.isArray(hearingDates)) return [];
    
//     return hearingDates.filter(
//       (h) => h?.nextHearing && new Date(h.nextHearing).toDateString() === date.toDateString()
//     );
//   };

//   // Helper function to generate all 42 day slots for a month view
//   const generateDays = (year, month) => {
//     const firstDayOfMonth = new Date(year, month, 1);
//     const lastDayOfMonth = new Date(year, month + 1, 0);
//     const daysInMonth = lastDayOfMonth.getDate();
//     const startWeekday = firstDayOfMonth.getDay();

//     const days = [];

//     // Fill in leading days from the previous month
//     const prevMonthLastDay = new Date(year, month, 0).getDate();
//     for (let i = startWeekday; i > 0; i--) {
//       days.push({
//         date: new Date(year, month - 1, prevMonthLastDay - i + 1),
//         isCurrentMonth: false,
//       });
//     }

//     // Fill in days of the current month
//     for (let i = 1; i <= daysInMonth; i++) {
//       days.push({
//         date: new Date(year, month, i),
//         isCurrentMonth: true,
//       });
//     }

//     // Fill in trailing days from the next month
//     const remainingSlots = 42 - days.length;
//     for (let i = 1; i <= remainingSlots; i++) {
//       days.push({
//         date: new Date(year, month + 1, i),
//         isCurrentMonth: false,
//       });
//     }

//     return days;
//   };

//   const days = useMemo(() => 
//     generateDays(currentView.year, currentView.month), 
//     [currentView.year, currentView.month]
//   );

//   const handlePrevMonth = () => {
//     const newMonth = currentView.month === 0 ? 11 : currentView.month - 1;
//     const newYear = currentView.month === 0 ? currentView.year - 1 : currentView.year;
    
//     const newDate = new Date(newYear, newMonth, 1);
    
//     // Update the view immediately
//     setCurrentView({
//       month: newMonth,
//       year: newYear
//     });
    
//     // Also update parent if callback exists
//     if (setCalendarValue) {
//       setCalendarValue(newDate);
//     }
//   };

//   const handleNextMonth = () => {
//     const newMonth = currentView.month === 11 ? 0 : currentView.month + 1;
//     const newYear = currentView.month === 11 ? currentView.year + 1 : currentView.year;
    
//     const newDate = new Date(newYear, newMonth, 1);
    
//     // Update the view immediately
//     setCurrentView({
//       month: newMonth,
//       year: newYear
//     });
    
//     // Also update parent if callback exists
//     if (setCalendarValue) {
//       setCalendarValue(newDate);
//     }
//   };

//   const handleDayPress = (dayDate) => {
//     if (setCalendarValue) {
//       setCalendarValue(dayDate);
//     }
//     // Also update the view to show the selected day's month
//     setCurrentView({
//       month: dayDate.getMonth(),
//       year: dayDate.getFullYear()
//     });
//   };

//   const isSameDay = (d1, d2) => {
//     if (!d1 || !d2) return false;
//     return d1.toDateString() === d2.toDateString();
//   };

//   const getDayName = (dayIndex) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex];

//   const getMonthTitle = () => {
//     const date = new Date(currentView.year, currentView.month, 1);
//     return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
//   };

//   // Determine which date to use for selection highlighting
//   const selectedDate = calendarValue instanceof Date && !isNaN(calendarValue) 
//     ? calendarValue 
//     : new Date(currentView.year, currentView.month, 1);

//   // Render nothing if critical props are missing - moved to the end after all hooks
//   if (!setCalendarValue) {
//     console.warn('CustomCalendar: setCalendarValue function is required');
//     return (
//       <View style={styles.errorContainer}>
//         <Text style={styles.errorText}>Calendar not configured properly</Text>
//       </View>
//     );
//   }

//   return (
//     <View style={styles.container}>
//       {/* Navigation */}
//       <View style={styles.navigation}>
//         <TouchableOpacity
//           onPress={handlePrevMonth}
//           style={styles.navButton}
//           accessibilityLabel="Previous Month"
//         >
//           <ChevronLeft size={20} color="#374151" />
//         </TouchableOpacity>
        
//         <Text style={styles.monthTitle}>
//           {getMonthTitle()}
//         </Text>
        
//         <TouchableOpacity
//           onPress={handleNextMonth}
//           style={styles.navButton}
//           accessibilityLabel="Next Month"
//         >
//           <ChevronRight size={20} color="#374151" />
//         </TouchableOpacity>
//       </View>

//       {/* Weekday Headers */}
//       <View style={styles.weekdayHeaders}>
//         {Array.from({ length: 7 }).map((_, i) => (
//           <View key={i} style={styles.weekdayHeader}>
//             <Text style={styles.weekdayText}>
//               {getDayName(i)}
//             </Text>
//           </View>
//         ))}
//       </View>

//       {/* Days Grid */}
//       <View style={styles.daysGrid}>
//         {days.map((day, index) => {
//           const dayDate = day.date;
//           const isToday = isSameDay(dayDate, today);
//           const isSelected = isSameDay(dayDate, selectedDate);
//           const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;
//           const hearings = getHearingsForDate(dayDate, nextHearingDates);

//           const getDayContainerStyle = () => {
//             const baseStyle = [styles.dayContainer];
            
//             if (!day.isCurrentMonth) {
//               baseStyle.push(styles.neighborDay);
//             }

//             if (isToday && day.isCurrentMonth) {
//               baseStyle.push(styles.today);
//             }

//             if (isSelected && day.isCurrentMonth) {
//               baseStyle.push(styles.selectedDay);
//             }

//             if (hearings.length > 0 && day.isCurrentMonth) {
//               baseStyle.push(styles.hearingDay);
//             }

//             return baseStyle;
//           };

//           const getDayTextStyle = () => {
//             if (!day.isCurrentMonth) {
//               return styles.neighborDayText;
//             }
            
//             if (isSelected) {
//               return styles.selectedText;
//             }
            
//             if (isToday) {
//               return styles.todayText;
//             }
            
//             if (isWeekend) {
//               return styles.weekendText;
//             }
            
//             return styles.currentMonthText;
//           };

//           return (
//             <TouchableOpacity
//               key={`${dayDate.getTime()}-${index}`}
//               style={getDayContainerStyle()}
//               onPress={() => handleDayPress(dayDate)}
//             >
//               {/* Day Number */}
//               <Text style={[styles.dayNumber, getDayTextStyle()]}>
//                 {dayDate.getDate()}
//               </Text>

//               {/* Hearing Content */}
//               <View style={styles.hearingsContainer}>
//                 {hearings.slice(0, 2).map((h, idx) => {
//                   const isScheduled = h.status === "SCHEDULED";
//                   const hearingKey = h.caseId ? `hearing-${h.caseId}-${idx}` : `hearing-${idx}-${dayDate.getTime()}`;
                  
//                   return (
//                     <View
//                       key={hearingKey}
//                       style={[
//                         styles.hearingBadge,
//                         isScheduled ? styles.scheduledHearing : styles.otherHearing
//                       ]}
//                     >
//                       <Text style={styles.hearingText} numberOfLines={1}>
//                         #{h.caseId || 'N/A'}
//                       </Text>
//                     </View>
//                   );
//                 })}
//                 {hearings.length > 2 && (
//                   <View style={styles.moreHearingsBadge}>
//                     <Text style={styles.moreHearingsText}>
//                       +{hearings.length - 2}
//                     </Text>
//                   </View>
//                 )}
//               </View>
//             </TouchableOpacity>
//           );
//         })}
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     width: '100%',
//     padding: 16,
//     backgroundColor: 'white',
//     borderRadius: 12,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 3,
//   },
//   errorContainer: {
//     padding: 20,
//     backgroundColor: '#fef2f2',
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   errorText: {
//     color: '#dc2626',
//     fontSize: 16,
//   },
//   navigation: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//     paddingBottom: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#f3f4f6',
//   },
//   navButton: {
//     padding: 8,
//     borderRadius: 8,
//     backgroundColor: '#f8fafc',
//   },
//   monthTitle: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#111827',
//     textAlign: 'center',
//   },
//   weekdayHeaders: {
//     flexDirection: 'row',
//     marginBottom: 8,
//   },
//   weekdayHeader: {
//     flex: 1,
//     alignItems: 'center',
//     paddingVertical: 8,
//   },
//   weekdayText: {
//     fontSize: 12,
//     fontWeight: '600',
//     textTransform: 'uppercase',
//     color: '#6b7280',
//   },
//   daysGrid: {
//     flexDirection: 'row',
//     flexWrap: 'wrap',
//   },
//   dayContainer: {
//     width: '14.28%',
//     minHeight: 70,
//     padding: 4,
//     borderRadius: 8,
//     marginVertical: 1,
//   },
//   neighborDay: {
//     backgroundColor: '#f9fafb',
//   },
//   today: {
//     backgroundColor: '#dbeafe',
//   },
//   selectedDay: {
//     backgroundColor: '#3b82f6',
//   },
//   hearingDay: {
//     borderWidth: 1,
//     borderColor: '#60a5fa',
//   },
//   dayNumber: {
//     fontSize: 14,
//     fontWeight: '600',
//     textAlign: 'center',
//     marginBottom: 2,
//     padding: 4,
//   },
//   neighborDayText: {
//     color: '#9ca3af',
//   },
//   currentMonthText: {
//     color: '#1f2937',
//   },
//   weekendText: {
//     color: '#dc2626',
//   },
//   todayText: {
//     color: '#1e40af',
//     fontWeight: '700',
//   },
//   selectedText: {
//     color: 'white',
//     fontWeight: '700',
//   },
//   hearingsContainer: {
//     marginTop: 2,
//   },
//   hearingBadge: {
//     paddingHorizontal: 3,
//     paddingVertical: 1,
//     borderRadius: 6,
//     marginBottom: 1,
//   },
//   scheduledHearing: {
//     backgroundColor: '#2563eb',
//   },
//   otherHearing: {
//     backgroundColor: '#f97316',
//   },
//   hearingText: {
//     color: 'white',
//     fontSize: 7,
//     fontWeight: '600',
//     textAlign: 'center',
//   },
//   moreHearingsBadge: {
//     backgroundColor: '#6b7280',
//     paddingHorizontal: 3,
//     paddingVertical: 1,
//     borderRadius: 6,
//   },
//   moreHearingsText: {
//     color: 'white',
//     fontSize: 6,
//     fontWeight: '600',
//     textAlign: 'center',
//   },
// });

import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { GetAllNextHearingDate } from '../proxy/main/Dashboardproxy';

export const CustomCalendar = ({ 
  calendarValue, 
  setCalendarValue 
}) => {


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Loading hearing dates...</Text>
      </View>
    );
  }

  const [currentView, setCurrentView] = useState({
    month: new Date().getMonth(),
    year: new Date().getFullYear()
  });
  
  const [nextHearingDates, setNextHearingDates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch hearing dates
  const fetchNextHearingDates = useCallback(async () => {
    try {
      setLoading(true);
      const result = await GetAllNextHearingDate();
      if (result) {
        setNextHearingDates(
          result.map((item) => ({
            caseId: item.caseId,
            nextHearing: new Date(item.nextHearing), // Convert to Date object
            status: item.status,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching hearing dates:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update currentView when calendarValue changes from parent
  useEffect(() => {
    if (calendarValue instanceof Date && !isNaN(calendarValue)) {
      setCurrentView({
        month: calendarValue.getMonth(),
        year: calendarValue.getFullYear()
      });
    }
  }, [calendarValue]);

  // Fetch data on component mount
  useEffect(() => {
    fetchNextHearingDates();
  }, [fetchNextHearingDates]);

  const today = new Date();

  // Helper: Check if a day has hearings
  const getHearingsForDate = (date) => {
    if (!nextHearingDates || !Array.isArray(nextHearingDates)) return [];
    
    return nextHearingDates.filter(
      (h) => h?.nextHearing && new Date(h.nextHearing).toDateString() === date.toDateString()
    );
  };

  // Helper function to generate all 42 day slots for a month view
  const generateDays = (year, month) => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    const startWeekday = firstDayOfMonth.getDay();

    const days = [];

    // Fill in leading days from the previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startWeekday; i > 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthLastDay - i + 1),
        isCurrentMonth: false,
      });
    }

    // Fill in days of the current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Fill in trailing days from the next month
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  };

  const days = generateDays(currentView.year, currentView.month);

  const handlePrevMonth = () => {
    const newMonth = currentView.month === 0 ? 11 : currentView.month - 1;
    const newYear = currentView.month === 0 ? currentView.year - 1 : currentView.year;
    
    const newDate = new Date(newYear, newMonth, 1);
    
    setCurrentView({
      month: newMonth,
      year: newYear
    });
    
    if (setCalendarValue) {
      setCalendarValue(newDate);
    }
  };

  const handleNextMonth = () => {
    const newMonth = currentView.month === 11 ? 0 : currentView.month + 1;
    const newYear = currentView.month === 11 ? currentView.year + 1 : currentView.year;
    
    const newDate = new Date(newYear, newMonth, 1);
    
    setCurrentView({
      month: newMonth,
      year: newYear
    });
    
    if (setCalendarValue) {
      setCalendarValue(newDate);
    }
  };

  const handleDayPress = (dayDate) => {
    if (setCalendarValue) {
      setCalendarValue(dayDate);
    }
    setCurrentView({
      month: dayDate.getMonth(),
      year: dayDate.getFullYear()
    });
  };

  const handleRefresh = () => {
    fetchNextHearingDates();
  };

  const isSameDay = (d1, d2) => {
    if (!d1 || !d2) return false;
    return d1.toDateString() === d2.toDateString();
  };

  const getDayName = (dayIndex) => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dayIndex];

  const getMonthTitle = () => {
    const date = new Date(currentView.year, currentView.month, 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  const selectedDate = calendarValue instanceof Date && !isNaN(calendarValue) 
    ? calendarValue 
    : new Date(currentView.year, currentView.month, 1);

 

  return (
    <View style={styles.container}>
      {/* Navigation */}
      <View style={styles.navigation}>
        <TouchableOpacity
          onPress={handlePrevMonth}
          style={styles.navButton}
          accessibilityLabel="Previous Month"
        >
          <ChevronLeft size={20} color="#374151" />
        </TouchableOpacity>
        
        <Text style={styles.monthTitle}>
          {getMonthTitle()}
        </Text>
        
        <TouchableOpacity
          onPress={handleNextMonth}
          style={styles.navButton}
          accessibilityLabel="Next Month"
        >
          <ChevronRight size={20} color="#374151" />
        </TouchableOpacity>
      </View>

      {/* Refresh Button */}
      <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
        <Text style={styles.refreshText}>Refresh Hearing Dates</Text>
      </TouchableOpacity>

      {/* Weekday Headers */}
      <View style={styles.weekdayHeaders}>
        {Array.from({ length: 7 }).map((_, i) => (
          <View key={i} style={styles.weekdayHeader}>
            <Text style={styles.weekdayText}>
              {getDayName(i)}
            </Text>
          </View>
        ))}
      </View>

      {/* Days Grid */}
      <View style={styles.daysGrid}>
        {days.map((day, index) => {
          const dayDate = day.date;
          const isToday = isSameDay(dayDate, today);
          const isSelected = isSameDay(dayDate, selectedDate);
          const isWeekend = dayDate.getDay() === 0 || dayDate.getDay() === 6;
          const hearings = getHearingsForDate(dayDate);

          const getDayContainerStyle = () => {
            const baseStyle = [styles.dayContainer];
            
            if (!day.isCurrentMonth) {
              baseStyle.push(styles.neighborDay);
            }

            if (isToday && day.isCurrentMonth) {
              baseStyle.push(styles.today);
            }

            if (isSelected && day.isCurrentMonth) {
              baseStyle.push(styles.selectedDay);
            }

            if (hearings.length > 0 && day.isCurrentMonth) {
              baseStyle.push(styles.hearingDay);
            }

            return baseStyle;
          };

          const getDayTextStyle = () => {
            if (!day.isCurrentMonth) {
              return styles.neighborDayText;
            }
            
            if (isSelected) {
              return styles.selectedText;
            }
            
            if (isToday) {
              return styles.todayText;
            }
            
            if (isWeekend) {
              return styles.weekendText;
            }
            
            return styles.currentMonthText;
          };

          return (
            <TouchableOpacity
              key={`${dayDate.getTime()}-${index}`}
              style={getDayContainerStyle()}
              onPress={() => handleDayPress(dayDate)}
            >
              <Text style={[styles.dayNumber, getDayTextStyle()]}>
                {dayDate.getDate()}
              </Text>

              <View style={styles.hearingsContainer}>
                {hearings.slice(0, 2).map((h, idx) => {
                  const isScheduled = h.status === "SCHEDULED";
                  const hearingKey = h.caseId ? `hearing-${h.caseId}-${idx}` : `hearing-${idx}-${dayDate.getTime()}`;
                  
                  return (
                    <View
                      key={hearingKey}
                      style={[
                        styles.hearingBadge,
                        isScheduled ? styles.scheduledHearing : styles.otherHearing
                      ]}
                    >
                      <Text style={styles.hearingText} numberOfLines={1}>
                        #{h.caseId || 'N/A'}
                      </Text>
                    </View>
                  );
                })}
                {hearings.length > 2 && (
                  <View style={styles.moreHearingsBadge}>
                    <Text style={styles.moreHearingsText}>
                      +{hearings.length - 2}
                    </Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    padding: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#6b7280',
  },
  refreshButton: {
    backgroundColor: '#3b82f6',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  refreshText: {
    color: 'white',
    fontWeight: '600',
  },
  errorContainer: {
    padding: 20,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    alignItems: 'center',
  },
  errorText: {
    color: '#dc2626',
    fontSize: 16,
  },
  navigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  navButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#f8fafc',
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  weekdayHeaders: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekdayHeader: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  weekdayText: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    color: '#6b7280',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayContainer: {
    width: '14.28%',
    minHeight: 70,
    padding: 4,
    borderRadius: 8,
    marginVertical: 1,
  },
  neighborDay: {
    backgroundColor: '#f9fafb',
  },
  today: {
    backgroundColor: '#dbeafe',
  },
  selectedDay: {
    backgroundColor: '#3b82f6',
  },
  hearingDay: {
    borderWidth: 1,
    borderColor: '#60a5fa',
  },
  dayNumber: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 2,
    padding: 4,
  },
  neighborDayText: {
    color: '#9ca3af',
  },
  currentMonthText: {
    color: '#1f2937',
  },
  weekendText: {
    color: '#dc2626',
  },
  todayText: {
    color: '#1e40af',
    fontWeight: '700',
  },
  selectedText: {
    color: 'white',
    fontWeight: '700',
  },
  hearingsContainer: {
    marginTop: 2,
  },
  hearingBadge: {
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 6,
    marginBottom: 1,
  },
  scheduledHearing: {
    backgroundColor: '#2563eb',
  },
  otherHearing: {
    backgroundColor: '#f97316',
  },
  hearingText: {
    color: 'white',
    fontSize: 7,
    fontWeight: '600',
    textAlign: 'center',
  },
  moreHearingsBadge: {
    backgroundColor: '#6b7280',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 6,
  },
  moreHearingsText: {
    color: 'white',
    fontSize: 6,
    fontWeight: '600',
    textAlign: 'center',
  },
});