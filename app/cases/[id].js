import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import CaseLogs from './comp';

const CaseDetails = () => {
  const { id } = useLocalSearchParams(); // Expo Router way to get params
  
  return <CaseLogs caseId={id} />;
};

export default CaseDetails;