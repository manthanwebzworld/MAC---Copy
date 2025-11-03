
import { Restapi } from "../api/Restapi";
import { admissionUrl, authUrl } from "../constURL";
// import { admissionUrl } from "../constants";
// import { authUrl } from "../constURL";

export const LoginProxy = async (login) => {
    return  Restapi("post", authUrl + "/login", login);
}

export const RegisterProxy = async (signUp) => {
    return  Restapi("post", authUrl + "/signup", signUp);
}

export const createAdmissionProxy = async (admission) => {
    return  Restapi("post", admissionUrl + "/create", admission);
}