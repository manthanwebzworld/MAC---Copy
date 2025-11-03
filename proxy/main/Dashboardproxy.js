import { Restapi } from "../api/Restapi";
import { DashboardUrl } from "../constURL";


export const GetAllCount = async() => {
    return Restapi("get",DashboardUrl+"/get_count",null);
}

export const GetAllNextHearingDate = async () => {
    return Restapi("get",DashboardUrl+"/get_upcoming_hearing",null);
}

export const GetAllRecentActivity = async () => {
    return Restapi("get",DashboardUrl+"/get_recent_activity_details",null);
}