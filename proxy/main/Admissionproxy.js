import { Restapi } from "../api/Restapi";
import { admissionUrl } from "../constURL";


export const getAdmissionFormDetails = async (admissionFormId) => {
    return  Restapi("get", admissionUrl + `/admission_form/${admissionFormId}`,null);
}

export const GetAdmissionDetailByAdmissionIdAndUserEmail = async (admissionFormId,userEmail) => {
    return  Restapi("get", admissionUrl + `/case_register/${admissionFormId}/${userEmail}`,null);
}
export const GetAllAdmission = async () => {
    return  Restapi("get", admissionUrl + `/all`,null);
}

export const GetAllAdmissionByUserId = async (userId) => {
    return  Restapi("get", admissionUrl + `/all/${userId}`,null);
}

export const createAdmissionWithUserIdProxy = async (userid,admission) => {
    return  Restapi("post", admissionUrl + `/createByUserId/${userid}`, admission);
}

export const UpdateAdmissionPayment = async (payload) => {
    return  Restapi("post", admissionUrl + `/admission_payment`, payload);
}


export const UpdateAdmissionStatusProxy = async (userid,admissionId,status) => {
    return  Restapi("put", admissionUrl + `/update_status/${userid}/${admissionId}/${status}`,null);
}

export const DeleteAdmissionById = async (admissionId) => {
  return Restapi("delete", `${admissionUrl}/delete/${admissionId}`, null);
};