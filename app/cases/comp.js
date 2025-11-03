import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Linking,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { AuthContext } from '../../auth/AuthContext';
import {
  GetCaseDetailsByCaseId,
  UpdateCase,
  AddRespondantCaseDouments,
  AddClaimantCaseDouments
} from '../../proxy/main/Caseproxy';
import Icon from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import SelectDocument from '../../components/doc_select';
import { Uploadfile } from '../../proxy/api/Uploadfile';

import StatusDropdown from '../../components/StatusDropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import { CreateCaseLog } from '../../proxy/main/CaseLogproxy';
import Toast from 'react-native-toast-message';


const { width } = Dimensions.get('window');

// const [ lastHearingDate , setLastHearingDate ] = useState("")
// const [ nextHearingDate , setNextHearingDate ] = useState("")
// const [ casestatus , setCasestatus ]  = useState("")

const dummyCaseStatus = {
  status: "In Progress",
  lastHearingDate: "-",
  nextHearingDate: "-",
};

// Log Card Component for Mobile
const LogCard = ({ log, index, formatDate }) => {
  const handleViewAttachment = async (url) => {
    if (url) {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Cannot open this file type');
      }
    }
  };

  

  return (
    <View style={mobileStyles.logCard}>
      <View style={mobileStyles.logCardHeader}>
        <Text style={mobileStyles.logCardIndex}>{index + 1}</Text>
        <Text style={mobileStyles.logCardJudge}>
          Judge: <Text style={mobileStyles.logCardJudgeName}>{log.judge || 'N/A'}</Text>
        </Text>
      </View>

      <View style={mobileStyles.logDetailRow}>
        <Text style={mobileStyles.logDetailLabel}>Next Hearing Date:</Text>
        <Text style={mobileStyles.logDetailValue}>{formatDate(log.hearingDate)}</Text>
      </View>

      <View style={mobileStyles.logDetailRow}>
        <Text style={mobileStyles.logDetailLabel}>Last Hearing Date:</Text>
        <Text style={mobileStyles.logDetailValue}>{formatDate(log.businessOnDate)}</Text>
      </View>

      <View style={mobileStyles.logCardPurposeContainer}>
        <Text style={mobileStyles.logDetailLabel}>Purpose:</Text>
        <Text style={mobileStyles.logCardPurposeText}>
          {log.purposeOfHearing || 'No purpose recorded'}
        </Text>
      </View>

      <View style={mobileStyles.logCardFooter}>
        <Text style={mobileStyles.logCardCreatedBy}>
          By: <Text style={{ fontWeight: '600' }}>{log.createdBy}</Text>
        </Text>

        {log.attachment ? (
          <TouchableOpacity
            style={mobileStyles.attachmentButton}
            onPress={() => handleViewAttachment(log.attachment)}
          >
            <Icon name="insert-drive-file" size={14} color="#10b981" />
            <Text style={mobileStyles.attachmentButtonText}>View File</Text>
          </TouchableOpacity>
        ) : (
          <View style={mobileStyles.noAttachmentBadge}>
            <Text style={mobileStyles.noAttachmentText}>No File</Text>
          </View>
        )}
      </View>
    </View>
  );
};

// Main Component
const CaseLogs = ({ caseId }) => {
  const { user } = useContext(AuthContext);
  const caseid = caseId;

  const [caselog, setCaselog] = useState([]);

  const lastHearingDate = caselog.length > 0 ? caselog[0].businessOnDate : null;
  const nextHearingDate = caselog.length > 0 ? caselog[0].hearingDate : null;

  dummyCaseStatus.lastHearingDate = lastHearingDate
  dummyCaseStatus.nextHearingDate = nextHearingDate

  const [caseDetails, setCaseDetails] = useState({
    caseNo: '',
    status: '',
    createdAt: ''
  });

  const [claimentDetails, setClaimantDetails] = useState({
    partyName: '',
    advocateName: '',
    documentUrls: [],
  });

  const [respondantDetails, setRespondantDetails] = useState({
    partyName: '',
    advocateName: '',
    documentUrls: [],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [attachment, setAttachment] = useState(null);
  const [reload, setReload] = useState(false);

  // Modal states
  const [showUpdateCaseModal, setShowUpdateCaseModal] = useState(false);
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(false);
  const [initialStatus, setInitialStatus] = useState('');

  // Form states
  const [logForm, setLogForm] = useState({
    judge: '',
    businessOnDate: '',
    hearingDate: '',
    purposeOfHearing: '',
    attachment: '',
    caseId: caseid,
    createdBy: user?.username || '',
    updatedBy: user?.username || '',
  });

  const [caseForm, setCaseForm] = useState({
    status: '',
    caseNo: ''
  });

  const [documentForm, setDocumentForm] = useState({
    docTitle: '',
    document: null
  });

  // 🔄 STATE MANAGEMENT METHODS
  const handleLogFormChange = (name, value) => {
    setLogForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCaseFormChange = (name, value) => {
    setCaseForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDocumentFormChange = (name, value) => {
    setDocumentForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDocumentChange = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
        copyToCacheDirectory: true,

      });

      if (result.type === 'success') {
        setAttachment(result);
        // console.log(result)
      }
    } catch (error) {
      console.error('Document pick error:', error);
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  // 📤 FILE UPLOAD METHOD
  // const handleUploadParallel = async () => {
  //   const uploadFile = async (file, name) => {
  //     if (!file) return null;

  //     try {
  //       const formData = new FormData();
  //       formData.append('file', {
  //         uri: file.uri,
  //         type: file.mimeType,
  //         name: file.name,
  //       });

  //       const response = await fetch('/api/upload', {
  //         method: 'POST',
  //         body: formData,
  //         headers: {
  //           'Content-Type': 'multipart/form-data',
  //         },
  //       });

  //       const result = await response.json();

  //       if (!response.ok) {
  //         throw new Error(result.error || `${name} upload failed`);
  //       }

  //       return { name, url: result.url };
  //     } catch (error) {
  //       console.error('Upload error:', error);
  //       throw error;
  //     }
  //   };

  //   try {
  //     const uploadResults = await Promise.all([
  //       uploadFile(attachment, "attachment"),
  //     ]);

  //     const documentUrls = {};
  //     uploadResults.forEach((result) => {
  //       if (result) {
  //         documentUrls[result.name] = result.url;
  //       }
  //     });

  //     return documentUrls;
  //   } catch (error) {
  //     console.error('Upload error:', error);
  //     throw error;
  //   }
  // };

  // 📤 FILE UPLOAD METHOD - Updated to use your Uploadfile function
  const handleUploadParallel = async () => {
    const uploadFile = async (file, name) => {
      if (!file) return null;

      try {
        // Use your existing Uploadfile function
        const fileUrl = await Uploadfile(file);
        // console.log('File Uploaded successfully : ', fileUrl)

        if (!fileUrl) {
          throw new Error(`${name} upload failed - no URL returned`);
        }

        return { name, url: fileUrl };
      } catch (error) {
        console.error('Upload error:', error);
        throw error;
      }
    };

    try {
      const uploadResults = await Promise.all([
        uploadFile(attachment, "attachment"),
      ]);

      const documentUrls = {};
      uploadResults.forEach((result) => {
        if (result) {
          documentUrls[result.name] = result.url;
        }
      });

      return documentUrls;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  };

  // 🎯 MODAL CONTROL METHODS
  const openUpdateCaseModal = () => {
    setCaseForm({
      status: caseDetails.status,
      caseNo: caseDetails.caseNo
    });
    setInitialStatus(caseDetails.status);
    setShowUpdateCaseModal(true);
  };

  const openAddLogModal = () => {
    setShowSidebar(false);
    setShowModal(true);
  };

  const clearCaseForm = () => {
    setCaseForm({ status: '', caseNo: '' });
  };

  const clearDocumentForm = () => {
    setDocumentForm({ docTitle: '', document: null });
    setAttachment(null);
  };

  const resetLogForm = () => {
    setLogForm({
      judge: '',
      businessOnDate: '',
      hearingDate: '',
      purposeOfHearing: '',
      attachment: '',
      caseId: caseid,
      createdBy: user?.username || '',
      updatedBy: user?.username || '',
    });
    setAttachment(null);
  };

  // 📥 DATA FETCHING METHOD
  const getInitialDetails = async () => {
    try {
      const result = await GetCaseDetailsByCaseId(caseid);
      if (result) {
        setCaseDetails(result.caseMiniResponseDto);
        setCaselog(result.caseLogs?.reverse() || []);
        setClaimantDetails(result.claimantsAdvocate || {});
        setRespondantDetails(result.respondentsAdvocate || {});
      } else {
        Alert.alert('Error', result?.detail || 'Failed to load case details');
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load case details');
    }
  };

  useEffect(() => {
    getInitialDetails();
  }, [caseid, reload]);

  const onRefresh = async () => {
    setRefreshing(true);
    await getInitialDetails();
    setRefreshing(false);
  };

  // ✅ SUBMISSION METHODS

  // Case Log Submission
  const handleLogSubmit = async () => {
    if (!logForm.judge || !logForm.hearingDate || !logForm.purposeOfHearing) {
      Alert.alert('Error', 'Judge, Hearing Date and Purpose are required');
      return;
    }

    if (!user) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }

    setIsSubmitting(true);
    try {
      const uploadedDocUrls = await handleUploadParallel();

      const updatedLogForm = {
        ...logForm,
        attachment: uploadedDocUrls.attachment || "",
        createdBy: user.username,
        updatedBy: user.username,
      };

      const result = await CreateCaseLog(updatedLogForm);

      if (result.status === "success") {
        
        setShowModal(false);
        resetLogForm();
        setReload(v => !v);
        Toast.show({ type: "success", text1: "File Upload successfully" });
      } else {
        Alert.alert('Error', result.detail || 'Failed to create log');
      }
    } catch (error) {
      Alert.alert('Error', `Failed to create log ${error}`);

    } finally {
      setIsSubmitting(false);
    }
  };

  // Case Update Submission
  const handleCaseUpdate = async () => {
    setIsSubmitting(true);
    try {
      const requestBody = {
        caseNo: caseForm.caseNo,
        status: caseForm.status,
      };

      const result = await UpdateCase(caseid, requestBody);

      if (result.status === "success") {
        Alert.alert('Success', 'Case updated successfully!');
        setShowUpdateCaseModal(false);
        setReload(v => !v);
        clearCaseForm();
      } else {
        Alert.alert('Error', result.detail);
      }
    } catch (error) {
      console.error('Error updating case:', error);
      Alert.alert('Error', 'Something went wrong while updating the case.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Document Submission
  const handleDocSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Permission checks (uncomment and modify based on your permission structure)
      // if (user?.roleName === "CLAIMANT" && !user.permissions?.cases?.update) {
      //   Alert.alert('Error', "You don't have permission to add document");
      //   return;
      // }
      // if (user?.roleName === "RESPONDENT" && !user.permissions?.cases?.update) {
      //   Alert.alert('Error', "You don't have permission to add document");
      //   return;
      // }

      const uploadedDocUrls = await handleUploadParallel();

      const requestBody = {
        caseId: caseid,
        documentTitle: documentForm.docTitle,
        documentUrl: uploadedDocUrls.attachment,
        uploadedBy: user?.username,
      };

      // console.log('Upload Document Result : ', requestBody)

      // Choose API based on user role
      const result = user?.roleName === "CLAIMANT"
        ? await AddClaimantCaseDouments(requestBody)
        : await AddRespondantCaseDouments(requestBody);

      if (result.status === "success") {
        Toast.show({ type: "success", text1: "Document added successfully!" })
        setShowAddDocumentModal(false);
        setReload(v => !v);
        clearDocumentForm();
      } else {
        Alert.alert('Error', result.detail);
      }
    } catch (error) {
      console.error('Error submitting document:', error);
      Alert.alert('Error', 'Something went wrong while submitting the document.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 🛠️ UTILITY METHODS
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB');
  };

  const DetailCard = ({ title, children, showEditIcon = false, onEditPress }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        {showEditIcon && (
          <TouchableOpacity onPress={onEditPress}>
            <Icon name="edit" size={18} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>
      {children}
    </View>
  );

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#000" />
        <Text style={styles.loadingText}>Loading user data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={mobileStyles.header}>
        <Text style={mobileStyles.mainTitle}>Case Log</Text>
        <TouchableOpacity
          style={mobileStyles.headerButton}
          onPress={openAddLogModal}
        >
          <Icon name="add" size={20} color="#fff" />
          <Text style={mobileStyles.headerButtonText}>Add Log</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        <Text style={mobileStyles.subtitle}>Log History ({caselog.length})</Text>

        <ScrollView
          style={mobileStyles.logListContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={mobileStyles.logListContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          
        >
          {caselog.length === 0 ? (
            <View style={mobileStyles.emptyState}>
              <Icon name="book" size={48} color="#9ca3af" />
              <Text style={mobileStyles.emptyStateText}>No logs found for this case.</Text>
              <Text style={mobileStyles.emptyStateSubText}>Pull down to refresh or add a new log entry.</Text>
            </View>
          ) : (
            caselog.map((log, index) => (
              <LogCard key={index} log={log} index={index} formatDate={formatDate} />
            ))
          )}
        </ScrollView>
      </View>

      {/* Sidebar Overlay */}
      {showSidebar && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={() => setShowSidebar(false)}
          activeOpacity={1}
        />
      )}

      {/* Sidebar */}
      <View style={[
        styles.sidebar,
        {
          width: width * 0.85,
          transform: [{ translateX: showSidebar ? 0 : width * 0.85 }]
        }
      ]}>
        <View style={styles.sidebarContent}>
          <View style={styles.mobileHeader}>
            <Text style={styles.sidebarTitle}>Case Details</Text>
            <TouchableOpacity onPress={() => setShowSidebar(false)}>
              <Icon name="close" size={24} color="#374151" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.detailsContainer}>
            <DetailCard
              title="Case Summary"
              showEditIcon={true}
              onEditPress={openUpdateCaseModal}
            >
              <Text style={styles.detailText}>
                <Text style={styles.label}>Case Number: </Text>
                {caseDetails.caseNo || 'N/A'}
              </Text>
              <Text style={styles.detailText}>
                <Text style={styles.label}>Status: </Text>
                <Text style={[styles.statusBadge, styles.activeStatus]}>
                  {caseDetails.status || 'N/A'}
                </Text>
              </Text>
              <Text style={styles.detailText}>
                <Text style={styles.label}>Created On: </Text>
                {formatDate(caseDetails.createdAt)}
              </Text>
            </DetailCard>

            <DetailCard title="Hearing Schedule">
              <Text style={styles.detailText}>
                <Text style={styles.label}>Overall Status: </Text>
                <Text style={[styles.statusBadge, styles.activeStatus]}>
                  {dummyCaseStatus.status}
                </Text>
              </Text>
              <Text style={styles.detailText}>
                <Text style={styles.label}>Last Hearing: </Text>
                {formatDate(dummyCaseStatus.lastHearingDate)}
              </Text>
              <Text style={styles.detailText}>
                <Text style={styles.label}>Next Hearing: </Text>
                <Text style={[styles.statusBadge, styles.upcomingStatus]}>
                  {formatDate(dummyCaseStatus.nextHearingDate)}
                </Text>
              </Text>
            </DetailCard>

            <DetailCard
              title="Claimant Party"
              showEditIcon={user?.roleName === "CLAIMANT"}
              onEditPress={() => setShowAddDocumentModal(true)}
            >
              <Text style={styles.detailText}>
                <Text style={styles.label}>Client: </Text>
                {claimentDetails.partyName || 'N/A'}
              </Text>
              <Text style={styles.detailText}>
                <Text style={styles.label}>Advocate: </Text>
                {claimentDetails.advocateName || 'N/A'}
              </Text>
              {claimentDetails.documentUrls?.length > 0 && (
                <>
                  <Text style={[styles.label, { marginTop: 8 }]}>Documents:</Text>
                  {claimentDetails.documentUrls.map((doc, index) => (
                    <TouchableOpacity
                      key={index}
                      style={mobileStyles.attachmentButton}
                      onPress={() => Linking.openURL(doc.documentUrls)}
                      className={`mt-2`}
                    >
                      <Icon name="insert-drive-file" size={14} color="#10b981" />
                      <Text style={mobileStyles.attachmentButtonText}>View {doc.documenttitle}</Text>
                    </TouchableOpacity>
                  ))}
                </>
              )}
            </DetailCard>

            <DetailCard
              title="Respondent Party"
              showEditIcon={user?.roleName === "RESPONDENT"}
              onEditPress={() => setShowAddDocumentModal(true)}
            >
              <Text style={styles.detailText}>
                <Text style={styles.label}>Client: </Text>
                {respondantDetails.partyName || 'N/A'}
              </Text>
              <Text style={styles.detailText}>
                <Text style={styles.label}>Advocate: </Text>
                {respondantDetails.advocateName || 'N/A'}
              </Text>
              {respondantDetails.documentUrls?.length > 0 && (
                <>
                  <Text style={[styles.label, { marginTop: 8 }]}>Documents:</Text>
                  {respondantDetails.documentUrls.map((doc, index) => (
                    // <TouchableOpacity key={index} onPress={() => Linking.openURL(doc.documentUrls)}>
                    //   <Text style={[styles.detailText, { color: '#2563eb' }]}>
                    //     • {doc.documenttitle}
                    //   </Text>
                    // </TouchableOpacity>
                    <TouchableOpacity 
                      key={index}
                      style={mobileStyles.attachmentButton}
                      onPress={() => Linking.openURL(doc.documentUrls)}
                      className={`mt-2`}
                    >
                      <Icon name="insert-drive-file" size={14} color="#10b981" />
                      <Text style={mobileStyles.attachmentButtonText}>View {doc.documenttitle}</Text>
                    </TouchableOpacity>

                  ))}
                </>
              )}
            </DetailCard>
          </ScrollView>
        </View>
      </View>

      {/* Floating Action Button for Details */}
      <TouchableOpacity
        style={mobileStyles.fabDetails}
        onPress={() => setShowSidebar(true)}
      >
        <Icon name="info" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Modals */}
      <CreateLogModal
        showModal={showModal}
        setShowModal={setShowModal}
        logForm={logForm}
        handleLogFormChange={handleLogFormChange}
        isSubmitting={isSubmitting}
        handleDocumentPick={handleDocumentChange}
        handleSubmit={handleLogSubmit}
        attachment={attachment}
        user={user}
        setAttachment={setAttachment}
      />

      <UpdateCaseModal
        showModal={showUpdateCaseModal}
        setShowModal={setShowUpdateCaseModal}
        caseForm={caseForm}
        handleCaseFormChange={handleCaseFormChange}
        initialStatus={initialStatus}
        isSubmitting={isSubmitting}
        handleSubmit={handleCaseUpdate}
      />

      <AddDocumentModal
        showModal={showAddDocumentModal}
        setShowModal={setShowAddDocumentModal}
        documentForm={documentForm}
        handleDocumentFormChange={handleDocumentFormChange}
        isSubmitting={isSubmitting}
        handleDocumentPick={handleDocumentChange}
        handleSubmit={handleDocSubmit}
        attachment={attachment}
        user={user}
        setAttachment={setAttachment}
      />
    </View>
  );
};

// Modal Components (Updated with proper method integration)
// const CreateLogModal = ({
//   showModal,
//   setShowModal,
//   logForm,
//   handleLogFormChange,
//   isSubmitting,
//   handleDocumentPick,
//   handleSubmit,
//   attachment,
//   user,
//   setAttachment
// }) => {
//   if (!showModal) return null;

//   return (
//     <Modal
//       visible={showModal}
//       animationType="slide"
//       transparent={true}
//       onRequestClose={() => !isSubmitting && setShowModal(false)}
//     >
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContent}>
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalTitle}>Create Case Log</Text>
//             {!isSubmitting && (
//               <TouchableOpacity onPress={() => setShowModal(false)}>
//                 <Icon name="close" size={24} color="#374151" />
//               </TouchableOpacity>
//             )}
//           </View>
          
//           <ScrollView
//               style={modalStyles.modalBody}
//               showsVerticalScrollIndicator={false}
//               contentContainerStyle={modalStyles.modalBodyContent}
//               keyboardShouldPersistTaps="handled"
//             >
//             <Text style={styles.inputLabel}>Judge Name *</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter judge name"
//               value={logForm.judge}
//               onChangeText={(text) => handleLogFormChange('judge', text)}
//               editable={!isSubmitting}
//             />

//             <View style={styles.row}>
//               <View style={styles.flex1}>
//                 <Text style={styles.inputLabel}>Business Date</Text>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="YYYY-MM-DD"
//                   value={logForm.businessOnDate}
//                   onChangeText={(text) => handleLogFormChange('businessOnDate', text)}
//                   editable={!isSubmitting}
//                 />
//               </View>
//               <View style={styles.flex1}>
//                 <Text style={styles.inputLabel}>Hearing Date *</Text>
//                 <TextInput
//                   style={styles.input}
//                   placeholder="YYYY-MM-DD"
//                   value={logForm.hearingDate}
//                   onChangeText={(text) => handleLogFormChange('hearingDate', text)}
//                   editable={!isSubmitting}
//                 />
//               </View>
//             </View>

//             <Text style={styles.inputLabel}>Purpose of Hearing *</Text>
//             <TextInput
//               style={[styles.input, styles.textArea]}
//               placeholder="Describe the purpose or key events"
//               value={logForm.purposeOfHearing}
//               onChangeText={(text) => handleLogFormChange('purposeOfHearing', text)}
//               multiline
//               numberOfLines={3}
//               editable={!isSubmitting}
//             />

//             <View style={styles.uploadSection}>
//               <Text style={styles.uploadLabel}>Attach Document</Text>
//               <SelectDocument
//                   onFileSelect={setAttachment}
//                   file={attachment}
//                 // vali={errors.posidcardloa ? 'red-500' : 'gray-300'}
//                 // textvali={errors.posidcardloa ? 'red-500' : 'gray-500'}
//                 // logovali={errors.posidcardloa ? '#FF2E2E' : '#6B7280'}
//                 />
//             </View>
          
//             </ScrollView>

//           <View style={styles.modalActions}>
//             <TouchableOpacity
//               style={[styles.button, styles.cancelButton, isSubmitting && styles.disabledButton]}
//               onPress={() => setShowModal(false)}
//               disabled={isSubmitting}
//             >
//               <Text style={styles.cancelButtonText}>Cancel</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.button, styles.submitButton, isSubmitting && styles.disabledButton]}
//               onPress={handleSubmit}
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? (
//                 <ActivityIndicator color="#fff" />
//               ) : (
//                 <Text style={styles.submitButtonText}>Submit Log</Text>
//               )}
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };


const CreateLogModal = ({
  showModal,
  setShowModal,
  logForm,
  handleLogFormChange,
  isSubmitting,
  handleSubmit,
  attachment,
  user,
  setAttachment
}) => {
  if (!showModal) return null;
  
  const [showBusinessDatePicker, setShowBusinessDatePicker] = useState(false);
  const [showHearingDatePicker, setShowHearingDatePicker] = useState(false);

  const handleBusinessDateChange = (event, selectedDate) => {
    setShowBusinessDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      handleLogFormChange('businessOnDate', formattedDate);
    }
  };

  const handleHearingDateChange = (event, selectedDate) => {
    setShowHearingDatePicker(false);
    if (selectedDate) {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      handleLogFormChange('hearingDate', formattedDate);
    }
  };

  return (
    <Modal
      visible={showModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => !isSubmitting && setShowModal(false)}
    >
      <View style={modalStyles.modalOverlay}>
        <View style={modalStyles.modalContainer}>
          <View style={modalStyles.modalContent}>
            {/* Header */}
            <View style={modalStyles.modalHeader}>
              <Text style={modalStyles.modalTitle}>Create Case Log</Text>
              {!isSubmitting && (
                <TouchableOpacity 
                  onPress={() => setShowModal(false)}
                  style={modalStyles.closeButton}
                >
                  <Icon name="close" size={24} color="#374151" />
                </TouchableOpacity>
              )}
            </View>

            {/* Scrollable Content */}
            <ScrollView
              style={modalStyles.modalBody}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={modalStyles.modalBodyContent}
              keyboardShouldPersistTaps="handled"
            >
              {/* Judge Name */}
              <View style={modalStyles.inputGroup}>
                <Text style={modalStyles.inputLabel}>Judge Name *</Text>
                <TextInput
                  style={modalStyles.input}
                  placeholder="Enter judge name"
                  value={logForm.judge}
                  onChangeText={(text) => handleLogFormChange('judge', text)}
                  editable={!isSubmitting}
                />
              </View>

              {/* Dates Row */}
              <View style={modalStyles.row}>
                <View style={modalStyles.flex1}>
                  <Text style={modalStyles.inputLabel}>Business Date</Text>
                  <TouchableOpacity
                    onPress={() => setShowBusinessDatePicker(true)}
                    disabled={isSubmitting}
                  >
                    <View style={modalStyles.dateInput}>
                      <Text style={
                        logForm.businessOnDate ? 
                        modalStyles.dateInputText : 
                        modalStyles.dateInputPlaceholder
                      }>
                        {logForm.businessOnDate || 'Select Business Date'}
                      </Text>
                      <Icon name="calendar-today" size={20} color="#666" />
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={modalStyles.flex1}>
                  <Text style={modalStyles.inputLabel}>Hearing Date *</Text>
                  <TouchableOpacity
                    onPress={() => setShowHearingDatePicker(true)}
                    disabled={isSubmitting}
                  >
                    <View style={modalStyles.dateInput}>
                      <Text style={
                        logForm.hearingDate ? 
                        modalStyles.dateInputText : 
                        modalStyles.dateInputPlaceholder
                      }>
                        {logForm.hearingDate || 'Select Hearing Date'}
                      </Text>
                      <Icon name="calendar-today" size={20} color="#666" />
                    </View>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Date Pickers */}
              {showBusinessDatePicker && (
                <DateTimePicker
                  value={logForm.businessOnDate ? new Date(logForm.businessOnDate) : new Date()}
                  mode="date"
                  display="default"
                  onChange={handleBusinessDateChange}
                />
              )}

              {showHearingDatePicker && (
                <DateTimePicker
                  value={logForm.hearingDate ? new Date(logForm.hearingDate) : new Date()}
                  mode="date"
                  display="default"
                  onChange={handleHearingDateChange}
                />
              )}

              {/* Purpose */}
              <View style={modalStyles.inputGroup}>
                <Text style={modalStyles.inputLabel}>Purpose of Hearing *</Text>
                <TextInput
                  style={[modalStyles.input, modalStyles.textArea]}
                  placeholder="Describe the purpose or key events"
                  value={logForm.purposeOfHearing}
                  onChangeText={(text) => handleLogFormChange('purposeOfHearing', text)}
                  multiline
                  numberOfLines={3}
                  editable={!isSubmitting}
                />
              </View>

              {/* Document Upload */}
              <View style={modalStyles.uploadSection}>
                <Text style={modalStyles.inputLabel}>Attach Document</Text>
                <SelectDocument
                  onFileSelect={setAttachment}
                  file={attachment}
                />
              </View>
            </ScrollView>

            {/* Actions */}
            <View style={modalStyles.modalActions}>
              <TouchableOpacity
                style={[
                  modalStyles.button,
                  modalStyles.cancelButton,
                  isSubmitting && modalStyles.disabledButton
                ]}
                onPress={() => setShowModal(false)}
                disabled={isSubmitting}
              >
                <Text style={modalStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  modalStyles.button,
                  modalStyles.submitButton,
                  isSubmitting && modalStyles.disabledButton
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={modalStyles.submitButtonText}>Submit Log</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// const UpdateCaseModal = ({
//   showModal,
//   setShowModal,
//   caseForm,
//   handleCaseFormChange,
//   initialStatus,
//   isSubmitting,
//   handleSubmit,
// }) => {
//   if (!showModal) return null;

//   return (
//     <Modal
//       visible={showModal}
//       animationType="slide"
//       transparent={true}
//       onRequestClose={() => !isSubmitting && setShowModal(false)}
//     >
//       <View style={styles.modalOverlay}>
//         <View style={styles.modalContent}>
//           <View style={styles.modalHeader}>
//             <Text style={styles.modalTitle}>Update Case</Text>
//             {!isSubmitting && (
//               <TouchableOpacity onPress={() => setShowModal(false)}>
//                 <Icon name="close" size={24} color="#374151" />
//               </TouchableOpacity>
//             )}
//           </View>

//           <View style={styles.modalForm}>
//             <Text style={styles.inputLabel}>Status</Text>
//             <View style={[
//               styles.selectContainer,
//               initialStatus === "APPROVED" && styles.disabledSelect
//             ]}>
//               <Text style={[
//                 styles.selectText,
//                 initialStatus === "APPROVED" && styles.disabledSelectText
//               ]}>
//                 {caseForm.status || 'Select Status'}
//               </Text>
//               {initialStatus !== "APPROVED" && (
//                 <ScrollView style={styles.selectOptions}>
//                   {['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map((status) => (
//                     <TouchableOpacity
//                       key={status}
//                       style={styles.selectOption}
//                       onPress={() => handleCaseFormChange('status', status)}
//                     >
//                       <Text style={styles.selectOptionText}>{status}</Text>
//                     </TouchableOpacity>
//                   ))}
//                 </ScrollView>
//               )}
//             </View>

//             <Text style={styles.inputLabel}>Case Number</Text>
//             <TextInput
//               style={styles.input}
//               placeholder="Enter case number"
//               value={caseForm.caseNo}
//               onChangeText={(text) => handleCaseFormChange('caseNo', text)}
//               editable={!isSubmitting}
//             />
//           </View>

//           <View style={styles.modalActions}>
//             <TouchableOpacity
//               style={[styles.button, styles.cancelButton, isSubmitting && styles.disabledButton]}
//               onPress={() => setShowModal(false)}
//               disabled={isSubmitting}
//             >
//               <Text style={styles.cancelButtonText}>Cancel</Text>
//             </TouchableOpacity>

//             <TouchableOpacity
//               style={[styles.button, styles.submitButton, isSubmitting && styles.disabledButton]}
//               onPress={handleSubmit}
//               disabled={isSubmitting}
//             >
//               {isSubmitting ? (
//                 <ActivityIndicator color="#fff" />
//               ) : (
//                 <Text style={styles.submitButtonText}>Update Case</Text>
//               )}
//             </TouchableOpacity>
//           </View>
//         </View>
//       </View>
//     </Modal>
//   );
// };

const UpdateCaseModal = ({
  showModal,
  setShowModal,
  caseForm,
  handleCaseFormChange,
  initialStatus,
  isSubmitting,
  handleSubmit,
}) => {
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);

  if (!showModal) return null;

  const statusOptions = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'];

  const handleStatusSelect = (status) => {
    handleCaseFormChange('status', status);
    setShowStatusDropdown(false);
  };

  return (
    <Modal
      visible={showModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => !isSubmitting && setShowModal(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Update Case</Text>
            {!isSubmitting && (
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Icon name="close" size={24} color="#374151" />
              </TouchableOpacity>
            )}
          </View>

          <Text className={`mb-2`}>Status</Text>
          <View>
            <StatusDropdown
              currentStatus={caseForm.status}
              onStatusChange={(status) => handleStatusSelect(status)}
            />
            <View className={`mt-2`}>
              <Text>Case Number</Text>
              <TextInput
                onChangeText={(text) => handleCaseFormChange('caseNo', text)}
                editable={!isSubmitting}
                value={caseForm.caseNo}
                keyboardType="default"
                placeholder="Case Number"
                placeholderTextColor="#bdbdbd"
                className={`w-full flex flex-row gap-2 items-center border border-gray-300 px-5 py-3 rounded-lg mb-1 mt-2`}
              />
            </View>
          </View>

          <View style={styles.modalActions}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton, isSubmitting && styles.disabledButton]}
              onPress={() => setShowModal(false)}
              disabled={isSubmitting}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.submitButton, isSubmitting && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitButtonText}>Update Case</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const AddDocumentModal = ({
  showModal,
  setShowModal,
  documentForm,
  handleDocumentFormChange,
  isSubmitting,
  handleDocumentPick,
  handleSubmit,
  attachment,
  user,
  setAttachment,
}) => {
  if (!showModal) return null;

  return (
    <Modal
      visible={showModal}
      animationType="slide"
      transparent={true}
      onRequestClose={() => !isSubmitting && setShowModal(false)}
    >
      <View style={modalStyles.modalOverlay}>
        <View style={modalStyles.modalContainer}>
          <View style={modalStyles.modalContent}>
            <View style={modalStyles.modalHeader}>
              <Text style={modalStyles.modalTitle}>Upload Document</Text>
              {!isSubmitting && (
                <TouchableOpacity
                  onPress={() => setShowModal(false)}
                  style={modalStyles.closeButton}
                >
                  <Icon name="close" size={24} color="#374151" />
                </TouchableOpacity>
              )}
            </View>

            <ScrollView
              style={modalStyles.modalBody}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={modalStyles.modalBodyContent}
            >
              <View style={modalStyles.inputGroup}>
                <Text style={modalStyles.inputLabel}>Document Title *</Text>
                <TextInput
                  style={modalStyles.input}
                  placeholder="e.g., Exhibit A, Affidavit"
                  placeholderTextColor="#9ca3af"
                  value={documentForm.docTitle}
                  onChangeText={(text) => handleDocumentFormChange('docTitle', text)}
                  editable={!isSubmitting}
                />
              </View>

              <View style={modalStyles.uploadSection}>
                <Text style={modalStyles.inputLabel}>Select File *</Text>
                {/* <TouchableOpacity 
                  style={[
                    modalStyles.uploadButton, 
                    isSubmitting && modalStyles.disabledUpload
                  ]}
                  onPress={handleDocumentPick}
                  disabled={isSubmitting}
                >
                  <View style={modalStyles.uploadButtonContent}>
                    <Icon name="attach-file" size={22} color="#6b7280" />
                    <View style={modalStyles.uploadTextContainer}>
                      <Text style={modalStyles.uploadButtonText}>
                        {attachment ? attachment.name : 'Choose File'}
                      </Text>
                      <Text style={modalStyles.uploadButtonSubtext}>
                        PDF, Word, Images (Max 10MB)
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity> */}
                <SelectDocument
                  onFileSelect={setAttachment}
                  file={attachment}
                // vali={errors.posidcardloa ? 'red-500' : 'gray-300'}
                // textvali={errors.posidcardloa ? 'red-500' : 'gray-500'}
                // logovali={errors.posidcardloa ? '#FF2E2E' : '#6B7280'}
                />

              </View>
            </ScrollView>

            <View style={modalStyles.modalActions}>
              <TouchableOpacity
                style={[
                  modalStyles.button,
                  modalStyles.cancelButton,
                  isSubmitting && modalStyles.disabledButton
                ]}
                onPress={() => setShowModal(false)}
                disabled={isSubmitting}
              >
                <Text style={modalStyles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  modalStyles.button,
                  modalStyles.submitButton,
                  isSubmitting && modalStyles.disabledButton,
                ]}
                onPress={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={modalStyles.submitButtonText}>
                    Upload Document
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

// Styles
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  mainContent: {
    flex: 1,
    padding: 16,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 40,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f9fafb',
    borderLeftWidth: 1,
    borderLeftColor: '#e5e7eb',
    zIndex: 50,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  sidebarContent: {
    flex: 1,
  },
  mobileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  sidebarTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  detailsContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  detailText: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 6,
    lineHeight: 20,
  },
  label: {
    fontWeight: '600',
    color: '#111827',
  },
  statusBadge: {
    fontSize: 12,
    fontWeight: '500',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  activeStatus: {
    backgroundColor: '#dcfce7',
    color: '#166534',
  },
  upcomingStatus: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 500,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalForm: {
    flex: 1,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flex1: {
    flex: 1,
  },
  uploadSection: {
    marginBottom: 16,
  },
  uploadLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#f9fafb',
    gap: 8,
  },
  disabledUpload: {
    opacity: 0.6,
  },
  uploadButtonText: {
    fontSize: 14,
    color: '#666',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '600',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#000',
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  selectContainer: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  disabledSelect: {
    backgroundColor: '#f3f4f6',
    opacity: 0.7,
  },
  selectText: {
    fontSize: 16,
    color: '#111827',
  },
  disabledSelectText: {
    color: '#6b7280',
  },
  selectOptions: {
    maxHeight: 150,
    marginTop: 8,
  },
  selectOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  selectOptionText: {
    fontSize: 14,
    color: '#374151',
  },

});

const mobileStyles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1f2937',
  },
  headerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  headerButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#4b5563',
    marginBottom: 12,
  },
  logListContainer: {
    flex: 1,
  },
  logListContent: {
    paddingBottom: 20,
  },
  logCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#000',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  logCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    paddingBottom: 8,
    marginBottom: 8,
  },
  logCardIndex: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#6b7280',
    marginRight: 8,
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  logCardJudge: {
    fontSize: 14,
    color: '#1f2937',
    fontWeight: '500',
  },
  logCardJudgeName: {
    fontWeight: 'bold',
    color: '#000',
  },
  logDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  logDetailLabel: {
    fontSize: 12,
    color: '#4b5563',
    fontWeight: '500',
  },
  logDetailValue: {
    fontSize: 12,
    color: '#1f2937',
    fontWeight: '600',
  },
  logCardPurposeContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  logCardPurposeText: {
    fontSize: 12,
    color: '#4b5563',
    marginTop: 4,
    lineHeight: 18,
  },
  logCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  logCardCreatedBy: {
    fontSize: 11,
    color: '#6b7280',
  },
  attachmentButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  attachmentButtonText: {
    color: '#065f46',
    fontSize: 11,
    fontWeight: 'bold',
  },
  noAttachmentBadge: {
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  noAttachmentText: {
    color: '#9ca3af',
    fontSize: 11,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 50,
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 12,
    textAlign: 'center',
  },
  emptyStateSubText: {
    fontSize: 14,
    color: '#9ca3af',
    marginTop: 4,
    textAlign: 'center',
  },
  fabDetails: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#000',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 6,
    zIndex: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
});

const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
    minHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    flex: 1,
  },
  modalBodyContent: {
    padding: 20,
    paddingBottom: 10,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: '#fff',
    color: '#111827',
  },

  // 🔽 DROPDOWN STYLES - ADDED HERE
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  dropdownButtonActive: {
    borderColor: '#000',
    borderWidth: 2,
  },
  disabledDropdown: {
    backgroundColor: '#f3f4f6',
    opacity: 0.7,
  },
  dropdownButtonText: {
    fontSize: 16,
    color: '#111827',
  },
  disabledDropdownText: {
    color: '#6b7280',
  },
  dropdownOptions: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    backgroundColor: '#fff',
    maxHeight: 200,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  dropdownOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  dropdownOptionSelected: {
    backgroundColor: '#f3f4f6',
  },
  dropdownOptionText: {
    fontSize: 16,
    color: '#374151',
  },
  dropdownOptionTextSelected: {
    color: '#000',
    fontWeight: '600',
  },
  // 🔼 END DROPDOWN STYLES

  uploadSection: {
    marginBottom: 20,
  },
  uploadButton: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
    padding: 20,
  },
  uploadButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTextContainer: {
    marginLeft: 12,
    alignItems: 'center',
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
  },
  uploadButtonSubtext: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
    textAlign: 'center',
  },
  disabledUpload: {
    opacity: 0.5,
  },
  selectedFile: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    padding: 8,
    backgroundColor: '#f0fdf4',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  selectedFileText: {
    fontSize: 14,
    color: '#166534',
    marginLeft: 6,
    fontWeight: '500',
  },
  requiredNote: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  requiredNoteText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  modalActions: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  submitButton: {
    backgroundColor: '#000',
  },
  disabledButton: {
    backgroundColor: '#d1d5db',
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
  dateInput: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
  },
  dateInputText: {
    fontSize: 16,
    color: '#111827',
  },
  dateInputPlaceholder: {
    fontSize: 16,
    color: '#9ca3af',
  },
});


export default CaseLogs;