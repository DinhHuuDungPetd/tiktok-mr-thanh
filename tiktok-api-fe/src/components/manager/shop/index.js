"use client";

import { useEffect, useState } from "react";
import { getListShop } from "@/service/shopService"; // Import service
import { toast } from "react-toastify";
import ShopTable from "./ShopTable";

export default function ShopManagerComponent() {
    const [filteredShopList, setFilteredShopList] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const { data, isLoading, error, mutate } = getListShop(); // Gọi getListShop

    // Cập nhật danh sách shop khi data thay đổi
    useEffect(() => {
        if (data) {
            setFilteredShopList(data?.data || []); // Khởi tạo danh sách lọc từ data
            console.log("Shop list:", data);
        }
        if (error) {
            console.error("Error fetching shops:", error);
            toast.error("Không thể tải danh sách shop!");
        }
    }, [data, error]);

    useEffect(() => {
        handleSearch();
    }, [searchTerm]);


    const handleSearch = () => {
        if (data?.data) { // Đảm bảo data.data tồn tại
            const filteredShops = data.data.filter((shop) => {
                const searchLower = searchTerm.toLowerCase();
                return (
                    (shop.name && shop.name.toLowerCase().includes(searchLower)) ||
                    (shop.note && shop.note.toLowerCase().includes(searchLower)) ||
                    (shop.tagName && shop.tagName.toLowerCase().includes(searchLower)) ||
                    (shop.categoryNames && shop.categoryNames.some(category =>
                            category.toLowerCase().includes(searchLower)
                        )
                    ));
            });
            setFilteredShopList(filteredShops); // Cập nhật danh sách đã lọc
        }
    };

    return (
        <div className="relative">
            <div className="header flex items-center justify-between bg-white p-4 shadow-md rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800">Shop List</h2>
                <div className="flex items-center justify-end space-x-4">
                    <form className="relative" onSubmit={(e) => e.preventDefault()}>
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg
                                className="w-4 h-4 text-gray-500"
                                aria-hidden="true"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 20 20"
                            >
                                <path
                                    stroke="currentColor"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                                />
                            </svg>
                        </div>
                        <input
                            type="search"
                            id="default-search"
                            autoComplete="off"
                            style={{ minWidth: "400px" }}
                            className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="Search by shop name, tag, note, team..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </form>
                </div>
            </div>
            <div className="mt-2">
                <ShopTable shopList={filteredShopList} isLoading={isLoading} mutate={mutate} />
            </div>
        </div>
    );
}