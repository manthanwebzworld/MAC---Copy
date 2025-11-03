import * as FileSystem from 'expo-file-system/legacy';
import { Restapi } from './Restapi';
import { basefileuploadUrl } from '../constURL';
import { UploadfilePDF } from '../main/Uploaddocumentproxy';


// export const Uploadfile = async (fileUri, additionalFields = {}) => {
//   try {
//     // ✅ Extract file info
//     const fileInfo = await FileSystem.getInfoAsync(fileUri);
//     if (!fileInfo.exists) throw new Error("File not found");

//     // ✅ Prepare FormData
//     const formData = new FormData();
//     formData.append("file", {
//       uri: fileUri,
//       name: fileUri.split("/").pop(),
//       type: "application/pdf", // change MIME type as needed
//     });

//     // ✅ Add any other fields
//     Object.keys(additionalFields).forEach((key) => {
//       formData.append(key, additionalFields[key]);
//     });

//     // ✅ Call your generic REST API
//     const response = await Restapi(
//       "POST",
//       basefileuploadUrl,
//       formData
//     );

//     return response;
//   } catch (error) {
//     console.error("Upload failed:", error);
//     throw error;
//   }
// };


// export const Uploadfile = async (file) => {
//     try {
//         // ✅ Determine URI
//         if (!uri) throw new Error("Invalid file or missing URI");

//         // ✅ Check if file exists
//         const fileInfo = await FileSystem.getInfoAsync(uri);
//         if (!fileInfo.exists) throw new Error("File not found");

//         console.log('Uploaded file data : ',file)

//         // ✅ Prepare FormData
//         const formDatafinal = new FormData();
//         formData.append('file', {
//             uri: file.uri,
//             name: file.name,
//             type: file.mimeType || 'application/pdf',
//         });

//         // ✅ Upload
//         const response = await UploadfilePDF(formDatafinal)

//         console.log('Form Data',formDatafinal)

//         const data = await response.json();

//         // 4️⃣ Log the returned URL
//         console.log('Uploaded PDF URL:', data);
//         console.log('Response :', data)
//         return;
        
//     } catch (error) {
//         console.error("Upload failed:", error);
//         throw error;
//     }
// };


export const Uploadfile = async (file) => {
    try {
        if (!file || !file.uri) throw new Error("Invalid file or missing URI");

        const uri = file.uri;

        // Check if file exists
        const fileInfo = await FileSystem.getInfoAsync(uri);
        if (!fileInfo.exists) throw new Error("File not found");

        // Prepare FormData
        const formDatafinal = new FormData();
        formDatafinal.append('file', {
            uri: file.uri,
            name: file.name,
            type: file.mimeType || 'application/pdf',
        });

        // Upload
        const response = await fetch(basefileuploadUrl, {
            method: 'POST',
            body: formDatafinal,
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });

        const data = await response.json();

        console.log('Uploaded PDF URL:', data.url);
        return data.url;

    } catch (error) {
        console.error("Upload failed:", error);
        throw error;
    }
};