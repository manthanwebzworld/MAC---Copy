import { Restapi } from "../api/Restapi";
import { advocateUrl } from "../constURL";

export const GetAllAdvocates = async () => {
    return  Restapi("get", `${advocateUrl}/all`,null);
}

export const CreateAdvocate = async (advocate) => {
    return  Restapi("post", `${advocateUrl}`,advocate);
}

export const UpdateAdvocate = async (id,advocate) => {
    return  Restapi("post", `${advocateUrl}/update/${id}`,advocate);
}

export const DeleteAdvocateById = async (advocateId) => {
  return Restapi("delete", `${advocateUrl}/delete/${advocateId}`, null);
};