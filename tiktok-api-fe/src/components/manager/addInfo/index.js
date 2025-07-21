"use client"
import {useEffect, useState} from "react";
import authorizeAxiosInstance from "@/hooks/authorizeAxiosInstance";
import {FaCopy} from "react-icons/fa";
import {getAuth} from "@/service/userService";

export default function AddInfoManagerComponent(){
    const [token, setToken] = useState(null);
    const [toast, setToast] = useState(null);

    // Fetch token từ API khi component mount
    useEffect(() => {
        getAuth()
            .then(data =>{
                setToken(data);
            })


    }, []); // Chạy 1 lần khi component mount

    // Hàm xử lý copy vào clipboard
    const copyToClipboard = async (id, message) => {
        const text = document.getElementById(id).value;
        await navigator.clipboard.writeText(text);
        setToast(message);
        setTimeout(() => setToast(null), 2000); // Ẩn thông báo sau 2 giây
    };

    return (
        <div className="flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg w-full " style={{height:"85vh"}}>
                <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Auth Information</h1>

                {/* Dòng Link Auth */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Link Auth</label>
                    <div className="flex items-center space-x-2">
                        <input
                            id="auth-link"
                            type="text"
                            value={token?.urlAuth || ""}
                            readOnly
                            className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={() => copyToClipboard('auth-link', 'Link copied successfully!')}
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <FaCopy />
                        </button>
                    </div>
                </div>

                {/* Dòng Token */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Token</label>
                    <div className="flex items-center space-x-2">
                        <input
                            id="token"
                            type="text"
                            value={token === null ? 'Loading...' : (token?.authToken || "") }
                            readOnly
                            className="w-full p-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={() => copyToClipboard('token', 'Token copied successfully!')}
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <FaCopy />
                        </button>
                    </div>
                </div>

                {/* Thông báo Toast */}
                {toast && (
                     <div className="fixed bottom-4 right-4 bg-green-500 text-white p-3 rounded-lg shadow-lg animate-fade-in">
                        {toast}
                    </div>
                )}
            </div>
        </div>
    );

}