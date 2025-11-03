import { Restapi } from "../api/Restapi";
import { roleUrl } from "../constURL";

export const CreateRole = async (role) => {
    return  Restapi("post", roleUrl, role);
}

export const UpdateRole = async (id,role) => {
    return  Restapi("put", `${roleUrl}/${id}`, role);
}

export const GetAllRoles = async () =>{
    return Restapi("get", roleUrl , null);
}

export const GetRoleById = async (roleId) =>{
    return Restapi("get", `${roleUrl}/${roleId}` , null);
}

export const DeleteRoleById = async (roleId) =>{
    return Restapi("delete", `${roleUrl}/${roleId}` , null);
}