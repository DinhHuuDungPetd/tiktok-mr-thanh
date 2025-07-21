"use client"
import "@/styles/ManagerSideBar.css"
import { MdAccountCircle } from "react-icons/md";
import AdminSideBar from "@/components/AdminLayout/AdminSideBar";
import MainPage from "@/components/AdminLayout/Main";
import {useUser} from "@/context/UserProvider";


export default function AdminLayout({ children }) {

    const { user } = useUser();
    return (
        <>
            <div className="admin-container">
                <div className="admin-sidebar">
                    <AdminSideBar teamName={user?.teamName || "Đang load"} />
                </div>
                <div className="admin-content">
                    <div className="admin-header justify-end" style={{display: "flex", alignItems: "center", padding: "10px"}}>
                        <div className="flex items-center gap-3 px-4 py-2 rounded-full bg-gray-100 hover:bg-gray-200 transition">
                            <MdAccountCircle className="text-blue-500 text-2xl" />
                            <h1 className="text-lg font-semibold text-gray-700">{user?.name || "Đang load.." }</h1>
                        </div>
                    </div>
                    <MainPage>{children}</MainPage>
                </div>
            </div>
        </>
    );
}