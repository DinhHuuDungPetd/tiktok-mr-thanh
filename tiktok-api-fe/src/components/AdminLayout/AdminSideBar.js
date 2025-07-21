"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { RiTeamLine, RiWebhookFill } from "react-icons/ri";
import { FaTimes, FaSignOutAlt  } from "react-icons/fa";
import { FaTelegram ,FaBars, FaPersonBreastfeeding  } from "react-icons/fa6";
import { MdAccountCircle, MdAddBusiness  } from "react-icons/md";
import { CiShop } from "react-icons/ci";
import { TbBusinessplan } from "react-icons/tb";

const AdminSideBar = ({ teamName }) => {

    const [isOpen, setIsOpen] = useState(true);
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        setLoading(true);
        const timer = setTimeout(() => setLoading(false), 500);
        return () => clearTimeout(timer);
    }, [pathname]);

    const navigate = (path) => {
        if (pathname !== path) {
            setLoading(true);
            router.push(path);
        }
    };


    const menuItems = [
        { path: "/manager/shop", label: "Quản lý shop", icon: <CiShop /> },
        { path: "/manager/team", label: "Quản lý nhóm", icon: <RiTeamLine /> },
        { path: "/manager/employee", label: "Quản lý nhân viên", icon: <FaPersonBreastfeeding  /> },
        // { path: "/manager/notification", label: "Webhook", icon: <RiWebhookFill /> },
        { path: "/manager/telegram", label: "Telegram", icon: <FaTelegram  /> },
        { path: "/manager/account", label: "Tài khoản", icon: <MdAccountCircle /> },
        { path: "/manager/add-info", label: "Thông tin thêm", icon: <MdAddBusiness   /> },
        { path: "/view/orders", label: "Kinh doanh", icon: <TbBusinessplan   /> },
    ];

    return (
        <div className="flex w-full relative">
            {loading && (
                <div className="fixed inset-0 bg-gray-500 opacity-50 z-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white-700"></div>
                </div>
            )}
            <div className={`bg-white shadow-lg h-screen flex flex-col transition-all duration-300 ${isOpen ? "w-64" : "w-16"}`}>
                <div className="p-4 flex justify-between items-center">
                    <h1 style={{cursor:"pointer"}} className={` text-blue-600 text-3xl font-bold transition-all ${!isOpen && "hidden"}`}>{teamName}</h1>
                    <button onClick={() => setIsOpen(!isOpen)}>
                        {isOpen ? <FaTimes className="text-black text-xl" /> : <FaBars className="text-black text-xl" />}
                    </button>
                </div>
                <nav className="mt-4 flex-grow">
                    {menuItems.map((item) => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className={` w-full mt-2 mb-2 flex items-center text-gray-700 py-2 px-4 hover:bg-gray-200 transition-all ${
                                pathname === item.path ? "bg-blue-500 text-white" : ""
                            }`}
                        >
                            {item.icon}
                            <span className={`ml-3 text-lg transition-all ${!isOpen && "hidden"}`}>{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className={`pl-2 transition-all ${!isOpen && "text-center"}`}>
                    <button
                        onClick={() => navigate("/logout")}
                        className={`flex items-center justify-center text-white bg-red-600 hover:bg-red-800 font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 transition-all ${
                            !isOpen ? "w-12 h-12 p-2 text-xl" : "w-2/3"
                        }`}
                    >
                        <FaSignOutAlt className="text-lg" />
                        {isOpen && <span className="ml-2">Đăng xuất</span>}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminSideBar;
