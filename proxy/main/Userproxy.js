import { Restapi } from "../api/Restapi";
import { userUrl } from "../constURL";

export const GetAllUsers = async () =>{
    return Restapi("get", userUrl , null);
}

export const CreateUser = async (userrequest) =>{
    return Restapi("post", userUrl,userrequest);
}

export const UpdateUser = async (userid,updaterequest) =>{
    return Restapi("put", `${userUrl}/update/${userid}` , updaterequest);
}

export const DeleteUserById = async (userId) => {
  return Restapi("delete", `${userUrl}/delete/${userId}`, null);
};