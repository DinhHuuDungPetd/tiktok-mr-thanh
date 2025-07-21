import {cookies} from "next/headers";

export function getInfo(){
    const fullName = cookies().get("fullName")?.value || "";
    const role = cookies().get("role")?.value || "";
    const teamName = cookies().get("teamName")?.value || "Không xác định";
    if(!fullName || !role) return  null;
    return { fullName, role, teamName };
}