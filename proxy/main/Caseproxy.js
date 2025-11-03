import { Restapi } from "../api/Restapi";
import { caseUrl } from "../constURL";


export const GetAllCases = async (userid) => {
    return  Restapi("get", caseUrl + `/all/${userid}`,null);
}

export const RegisterCase = async (caseRequest) => {
    return  Restapi("post", caseUrl + `/create`,caseRequest);
}

export const IsCaseExist = async (userid) => {
    return  Restapi("get", caseUrl + `/exists/${userid}`,null);
}

export const GetCaseDetailsByCaseId = async (caseId) => {
    return  Restapi("get", caseUrl + `/${caseId}`,null);
}

export const UpdateCase = async (caseId,caseRequest) => {
    return  Restapi("put", caseUrl + `/update/${caseId}`,caseRequest);
}

export const AddClaimantCaseDouments = async (caseRequest) => {
    return  Restapi("post", caseUrl + `/add_claimant_case_document`,caseRequest);
}

export const AddRespondantCaseDouments = async (caseRequest) => {
    return  Restapi("post", caseUrl + `/add_respondant_case_document`,caseRequest);
}