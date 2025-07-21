"use client"
import { useState, useEffect, useMemo } from "react";
import { toast } from "react-toastify";
import { getListShop } from "@/service/shopService";
import {updateShopIntoCategory} from "@/service/categoryService"; // Import hàm getListShop

export default function AddShopModalContent({ team, onClose, callData }) {
    const [activeTab, setActiveTab] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [shops, setShops] = useState([]);
    const { data, isLoading } = getListShop(); // Gọi API bằng getListShop

    useEffect(() => {
        if (data) {
            try {
                console.log(data)
                // So sánh và đánh dấu selected dựa trên team.shopSet
                const updatedShops = data.data.map((shop) => ({
                    ...shop,
                    selected: team.shopSet.some((s) => s.id === shop.id),
                }));
                setShops(updatedShops);
                console.log("Shops from API:", updatedShops);
            } catch (error) {
                console.error("Error processing shop data:", error);
                toast.error("Không thể xử lý danh sách shop!");
            }
        }
    }, [data, team.shopSet]);

    const handleShopToggle = (shopId) => {
        setShops((prevShops) =>
            prevShops.map((shop) =>
                shop.id === shopId ? { ...shop, selected: !shop.selected } : shop
            )
        );
    };

    const filteredShops = useMemo(() => {
        return shops.filter((shop) => {
            const matchesSearch =
                shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (shop.note && shop.note.toLowerCase().includes(searchTerm.toLowerCase())); // Thêm tìm kiếm trong note
            if (activeTab === "all") return matchesSearch;
            if (activeTab === "selected") return matchesSearch && shop.selected;
            if (activeTab === "unselected") return matchesSearch && !shop.selected;
            return false;
        });
    }, [shops, activeTab, searchTerm]);

    const tabCounts = useMemo(() => ({
        all: shops.length,
        selected: shops.filter((s) => s.selected).length,
        unselected: shops.filter((s) => !s.selected).length,
    }), [shops]);

    const handleSaveShops = () => {
        const selectedShops = shops.filter((shop) => shop.selected);
        const shopIds = selectedShops.map((shop) => shop.id)
        updateShopIntoCategory(team.id, shopIds)
            .then(data =>{
                callData();
                toast.success("Đã lưu shop!");
                onClose();
            })
    };

    return (
        <div className="w-[620px] h-[500px] flex flex-col bg-white">
            {/* Header */}
            <div className="mb-1 border-gray-200 flex items-center justify-between shrink-0">
                <h2 className="text-xl font-semibold text-gray-900 truncate">
                    Thêm shop vào <span className="text-blue-600">{team.name}</span>
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
                        placeholder="Tìm kiếm shop..."
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

                {/* Danh sách shop */}
                <div className="flex-1 border border-gray-200 rounded-lg overflow-y-auto">
                    {isLoading ? (
                        <p className="p-4 text-center text-gray-500 text-sm">Đang tải danh sách shop...</p>
                    ) : filteredShops.length > 0 ? (
                        filteredShops.map((shop) => (
                            <div
                                key={shop.id}
                                className="flex items-center p-1 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 cursor-pointer"
                                onClick={() => handleShopToggle(shop.id)}
                            >
                                <input
                                    type="checkbox"
                                    checked={shop.selected}
                                    onChange={() => handleShopToggle(shop.id)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                    onClick={(e) => e.stopPropagation()}
                                />
                                <div className="ml-3 flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">
                                        {shop.note}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {shop.name}
                                    </p>
                                </div>
                                <span
                                    className={`text-xs px-2 py-1 rounded-full font-medium shrink-0 ${
                                        shop.selected
                                            ? "bg-green-100 text-green-700"
                                            : "bg-gray-100 text-gray-600"
                                    }`}
                                >
                                    {shop.selected ? "Đã chọn" : "Chưa chọn"}
                                </span>
                            </div>
                        ))
                    ) : (
                        <p className="p-4 text-center text-gray-500 text-sm">
                            Không tìm thấy shop phù hợp
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
                    onClick={handleSaveShops}
                    className="px-2 py-1 bg-blue-600 text-xs text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                >
                    Lưu thay đổi
                </button>
            </div>
        </div>
    );
}