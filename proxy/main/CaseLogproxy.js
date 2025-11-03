import { Restapi } from "../api/Restapi";
import { caseLogUrl } from "../constURL";


export const CreateCaseLog = async (caseLog) => {
    return  Restapi("post", caseLogUrl , caseLog);
}