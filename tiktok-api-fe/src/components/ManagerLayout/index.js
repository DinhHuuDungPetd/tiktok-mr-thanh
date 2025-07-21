"use client"

import "@/styles/ManagerSideBar.css"
import ManagerSideBar from "@/components/ManagerLayout/ManagerSideBar";
import MainPage from "@/components/ManagerLayout/Main";
import { MdAccountCircle } from "react-icons/md";
import {useUser} from "@/context/UserProvider";

export default function ManagerLayout({ children }) {

    const { user } = useUser();

    return (
        <>
            <div className="admin-container">
                <div className="admin-sidebar">
                    <ManagerSideBar teamName={user?.teamName || "Đang load.."} role={user?.role || "EMPLOYEE"}/>
                </div>
                <div className="admin-content">
                    <div className="admin-header justify-end" style={{display: "flex", alignItems: "center", padding: "10px"}}>
                        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
                            <MdAccountCircle className="text-blue-500 text-2xl" />
                            <h1 className="text-lg font-semibold text-gray-700">{user?.name || "Đang load..."}</h1>
                        </div>
                    </div>
                    <MainPage>{children}</MainPage>
                </div>
            </div>
        </>
    );
}