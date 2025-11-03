import basefileuploadUrl from "../constURL"
import Restapi from "../api/Restapi"

export const UploadfilePDF = async (filedata) => {
    return Restapi("post", basefileuploadUrl , filedata);
}