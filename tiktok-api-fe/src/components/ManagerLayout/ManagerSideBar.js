"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { GoPackage } from "react-icons/go";
import { HiReceiptRefund } from "react-icons/hi";
import { FaTimes, FaSignOutAlt  } from "react-icons/fa";
import { FaMessage, FaMoneyCheckDollar, FaBoxTissue, FaFire, FaBars } from "react-icons/fa6";
import { MdAccountCircle } from "react-icons/md";
import { SiGooglecampaignmanager360 } from "react-icons/si";

const ManagerSideBar = ({teamName, role}) => {
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
        { path: "/view/orders", label: "Đơn hàng", icon: <GoPackage /> },
        { path: "/view/all-orders", label: "Tất cả đơn hàng", icon: <GoPackage /> },
        { path: "/view/refund-return", label: "Refund & Return", icon: <HiReceiptRefund /> },
        { path: "/view/finance", label: "Tài chính", icon: <FaMoneyCheckDollar /> },
        { path: "/view/account", label: "Tài khoản", icon: <MdAccountCircle /> },
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
                            className={`w-full mt-2 mb-2 flex items-center text-gray-700 py-2 px-4 hover:bg-gray-200 transition-all ${
                                pathname.startsWith(item.path) ? "bg-blue-500 text-white" : ""
                            }`}
                        >
                            {item.icon}
                            <span className={`ml-3 text-lg transition-all ${!isOpen && "hidden"}`}>{item.label}</span>
                        </button>
                    ))}
                    {role ==="OWNER" && <button
                        onClick={() => navigate("/manager")}
                        className={` w-full mt-2 mb-2 flex items-center text-gray-700 py-2 px-4 hover:bg-gray-200 transition-all ${
                            pathname === "/manager" ? "bg-blue-500 text-white" : ""
                        }`}
                    >
                        <SiGooglecampaignmanager360 />
                        <span className={`ml-3 text-lg transition-all ${!isOpen && "hidden"}`}>Quản trị team</span>
                    </button>}
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

export default ManagerSideBar;
