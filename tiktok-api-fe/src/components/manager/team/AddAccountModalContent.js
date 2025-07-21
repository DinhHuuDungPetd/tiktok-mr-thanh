"use client"
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { getEmployeeByOwner } from "@/service/userService";
import {updateEmpolyeeCategory} from "@/service/categoryService";

export default function AddAccountModalContent({ team, onClose, callData }) {
    const [activeTab, setActiveTab] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [accounts, setAccounts] = useState([]);

    // Lấy dữ liệu từ API và so sánh với team.employeeSet
    useEffect(() => {
        (async () => {
            try {
                const data = await getEmployeeByOwner();
                console.log("API data:", data);
                let listEmployeeSelect = team.employeeSet.map(e => e.user)
                // So sánh và đánh dấu selected dựa trên team.employeeSet
                const updatedAccounts = data.map((account) => ({
                    ...account,
                    selected: listEmployeeSelect.some((emp) => emp.id === account.id),
                }));
                setAccounts(updatedAccounts);
            } catch (error) {
                console.error("Error fetching employees:", error);
                toast.error("Không thể tải danh sách tài khoản!");
            }
        })();
    }, [team.employeeSet]); // Dependency là team.employeeSet

    const handleAccountToggle = (accountId) => {
        setAccounts((prevAccounts) =>
            prevAccounts.map((account) =>
                account.id === accountId ? { ...account, selected: !account.selected } : account
            )
        );
    };

    const filteredAccounts = useMemo(() => {
        return accounts.filter((account) => {
            const matchesSearch =
                account.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                account.email.toLowerCase().includes(searchTerm.toLowerCase());
            if (activeTab === "all") return matchesSearch;
            if (activeTab === "selected") return matchesSearch && account.selected;
            if (activeTab === "unselected") return matchesSearch && !account.selected;
            return false;
        });
    }, [accounts, activeTab, searchTerm]);

    const tabCounts = useMemo(() => ({
        all: accounts.length,
        selected: accounts.filter((a) => a.selected).length,
        unselected: accounts.filter((a) => !a.selected).length,
    }), [accounts]);

    const handleSaveAccounts = () => {
        const selectedAccounts = accounts.filter((account) => account.selected);
        const resfut = selectedAccounts.map(item => item.id);

        updateEmpolyeeCategory(team.id, resfut)
            .then(data =>{
                callData()
                toast.success("Đã lưu tài khoản!");
                onClose();
            })
    };

    return (
        <div className="w-[620px] h-[500px] flex flex-col bg-white">
            {/* Header */}
            <div className="mb-1 border-gray-200 flex items-center justify-between shrink-0">
                <h2 className="text-xl font-semibold text-gray-900 truncate">
                    Thêm tài khoản vào <span className="text-blue-600">{team.name}</span>
                </h2>
            </div>
            <div className="flex-1 flex flex-col space-y-2 overflow-hidden">
                {/* Thanh tìm kiếm */}
                <div className="relative">
                    <svg
                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Tìm kiếm tài khoản..."
                        className="w-full pl-10 pr-4 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-gray-50 text-gray-900 placeholder-gray-400"
                    />
                </div>

                {/* Tabs */}
                <div className="grid grid-cols-3 gap-2 shrink-0">
                    {[
                        { key: "all", label: "Tất cả" },
                        { key: "selected", label: "Đã chọn" },
                        { key: "unselected", label: "Chưa chọn" },
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`py-1 px-4 rounded-lg font-medium text-sm transition-all duration-200 ${
                                activeTab === tab.key
                                    ? "bg-blue-600 text-white shadow-sm"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                            }`}
                        >
                            {tab.label} ({tabCounts[tab.key]})
                        </button>
                    ))}
                </div>

                {/* Danh sách tài khoản */}
                <div className="flex-1 border border-gray-200 rounded-lg overflow-y-auto">
                    {filteredAccounts.length > 0 ? (
                        filteredAccounts.map((account) => (
                            <div
                                key={account.id}
                                className="flex items-center p-1 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                                onClick={() => handleAccountToggle(account.id)}
                            >
                                <input
                                    type="checkbox"
                                    checked={account.selected}
                                    onChange={() => handleAccountToggle(account.id)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <div className="ml-3 flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {account.name}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {account.email}
                                    </p>
                                </div>
                                <span
                                    className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
                                        account.selected
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-600"
                                    }`}
                                >
                                    {account.selected ? "Đã chọn" : "Chưa chọn"}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="p-4 text-center text-gray-500 text-sm">
                            Không tìm thấy tài khoản phù hợp
                        </p>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="mt-1 border-gray-200 flex justify-end space-x-3">
                <button
                    onClick={onClose}
                    className="px-2 py-1 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200 font-medium"
                >
                    Hủy
                </button>
                <button
                    onClick={handleSaveAccounts}
                    className="px-2 py-1 bg-blue-600 text-xs text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                    Lưu thay đổi
                </button>
            </div>
        </div>
    );
}