"use client";
import { useState, useMemo, useEffect, useRef } from "react";
import useFetchV2 from "@/hooks/useFetchV2";
import OrderTable from "@/components/view/all-orders/OrderTable";
import Pagination from "@/components/Pagination";
import { getListShop } from "@/service/shopService";

export default function AllOrderComponent() {
    const [pageSize, setPageSize] = useState(10);
    const [pageNumber, setPageNumber] = useState(0);

    const [idSearch, setIdSearch] = useState("");
    const [searchEnd, setSearchEnd] = useState("");
    const [statusFilter, setStatusFilter] = useState({});
    const [shippingTypeFilter, setShippingTypeFilter] = useState("");
    const [shopFilter, setShopFilter] = useState([]);
    const [tempShopFilter, setTempShopFilter] = useState([]);
    const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
    const [shippingTypeDropdownOpen, setShippingTypeDropdownOpen] = useState(false);
    const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
    const [shopSearch, setShopSearch] = useState(""); // State cho ô tìm kiếm trong shop dropdown

    const statusDropdownRef = useRef(null);
    const shippingTypeDropdownRef = useRef(null);
    const shopDropdownRef = useRef(null);

    // Gọi API lấy danh sách shop
    const { data: shopData, isLoading: isLoadingShops, mutate: mutateShops } = getListShop();

    // Chuyển đổi dữ liệu shop từ API
    const shopOptions = useMemo(() => {
        if (!shopData?.data) return [];
        return shopData.data.map(shop => ({
            value: shop.shopId,
            label: shop.note,
        }));
    }, [shopData]);

    // Lọc danh sách shop dựa trên từ khóa tìm kiếm
    const filteredShopOptions = useMemo(() => {
        if (!shopSearch) return shopOptions;
        return shopOptions.filter(shop =>
            shop.label.toLowerCase().includes(shopSearch.toLowerCase())
        );
    }, [shopOptions, shopSearch]);

    const { data: dataOrders, isLoading: isLoadingOrderList, error } = useFetchV2(
        "/auth/orders/page",
        {
            id: searchEnd || null,
            status: statusFilter?.value || null,
            shippingType: shippingTypeFilter?.value || null,
            shopIds: shopFilter.length > 0 ? shopFilter.map(shop => shop.value).join(",") : null,
            page: pageNumber,
            size: pageSize,
        },
        2000
    );

    const orders = dataOrders?.data?.content || [];
    const totalPages = dataOrders?.data?.totalPages || 0;
    const currentPage = dataOrders?.data?.number || 0;

    const statusOptions = useMemo(() => [
        { value: "UNPAID", label: "Unpaid" },
        { value: "ON_HOLD", label: "On Hold" },
        { value: "AWAITING_SHIPMENT", label: "Awaiting Shipment" },
        { value: "PARTIALLY_SHIPPING", label: "Partially Shipping" },
        { value: "AWAITING_COLLECTION", label: "Awaiting Collection" },
        { value: "IN_TRANSIT", label: "In Transit" },
        { value: "DELIVERED", label: "Delivered" },
        { value: "COMPLETED", label: "Completed" },
        { value: "CANCELLED", label: "Cancelled" },
    ], []);

    const shipTypeOptions = useMemo(() => [
        { value: "TIKTOK", label: "Tik tok" },
        { value: "SELLER", label: "Seller" },
    ], []);

    const pageSizeOptions = useMemo(() => [
        { value: 10, label: "10" },
        { value: "20", label: "20" },
        { value: "50", label: "50" },
    ], []);

    const handleSearch = (e) => {
        e.preventDefault();
        setPageNumber(0);
        setStatusFilter("");
        setShippingTypeFilter("");
        setShopFilter([]);
        setSearchEnd(idSearch);
        setTempShopFilter([]);
    };

    const handleChangePageSize = (e) => {
        setPageNumber(0);
        setPageSize(e.target.value);
    };

    const handleShopCheckboxChange = (shop) => {
        setTempShopFilter((prev) =>
            prev.some(item => item.value === shop.value)
                ? prev.filter(item => item.value !== shop.value)
                : [...prev, shop]
        );
    };

    const handleConfirmShopFilter = () => {
        setShopFilter(tempShopFilter);
        setShopDropdownOpen(false);
        setPageNumber(0);
    };

    // Đóng dropdown và khôi phục tempShopFilter nếu không xác nhận
    const handleShopDropdownBlur = () => {
        setTimeout(() => {
            if (!shopDropdownRef.current?.contains(document.activeElement)) {
                setShopDropdownOpen(false);
                setTempShopFilter([...shopFilter]); // Khôi phục về trạng thái active
                setShopSearch(""); // Reset ô tìm kiếm
            }
        }, 100);
    };

    // Tự động đóng các dropdown khác khi không còn focus
    const handleStatusDropdownBlur = () => {
        setTimeout(() => {
            if (!statusDropdownRef.current?.contains(document.activeElement)) {
                setStatusDropdownOpen(false);
            }
        }, 100);
    };

    const handleShippingTypeDropdownBlur = () => {
        setTimeout(() => {
            if (!shippingTypeDropdownRef.current?.contains(document.activeElement)) {
                setShippingTypeDropdownOpen(false);
            }
        }, 100);
    };

    // Đồng bộ tempShopFilter với shopFilter khi mở dropdown
    useEffect(() => {
        if (shopDropdownOpen) {
            setTempShopFilter([...shopFilter]);
        }
    }, [shopDropdownOpen, shopFilter]);

    return (
        <>
            <div className="header flex items-center justify-between bg-white p-4 shadow-md rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800">Order List</h2>
                <div className="flex items-center justify-end space-x-4">
                    <form onSubmit={handleSearch} className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                            </svg>
                        </div>
                        <input
                            value={idSearch || ""}
                            onChange={(e) => setIdSearch(e.target.value)}
                            type="search"
                            id="default-search"
                            autoComplete="off"
                            style={{ minWidth: "400px" }}
                            className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Search by order id"
                        />
                        <button type="submit" className="absolute right-2.5 bottom-2 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 text-white font-medium rounded-lg text-xs px-2 py-1">
                            Search
                        </button>
                    </form>
                </div>
            </div>

            <div className="flex items-center justify-end space-x-4 p-2 bg-white mt-2 rounded-lg">
                {/* Status Filter */}
                <div ref={statusDropdownRef} onBlur={handleStatusDropdownBlur}>
                    <div className="relative" style={{ width: "200px" }}>
                        <button
                            onClick={() => setStatusDropdownOpen(!statusDropdownOpen)}
                            className="w-full p-1.5 border text-sm rounded text-left bg-white flex justify-between items-center"
                        >
                            <span>{statusFilter?.label || "Chọn trạng thái"}</span>
                            <svg className={`w-4 h-4 transform ${statusDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </button>
                        {statusDropdownOpen && (
                            <div className="absolute w-full mt-1 bg-white border rounded shadow-lg z-10">
                                <button onClick={() => { setStatusFilter(""); setStatusDropdownOpen(false); setPageNumber(0); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                                    Tất cả
                                </button>
                                {statusOptions.map((status) => (
                                    <button
                                        key={status.value}
                                        onClick={() => { setStatusFilter(status); setStatusDropdownOpen(false); setPageNumber(0); }}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                    >
                                        {status.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Shipping Type Filter */}
                <div ref={shippingTypeDropdownRef} onBlur={handleShippingTypeDropdownBlur}>
                    <div className="relative" style={{ width: "200px" }}>
                        <button
                            onClick={() => setShippingTypeDropdownOpen(!shippingTypeDropdownOpen)}
                            className="w-full p-1.5 border text-sm rounded text-left bg-white flex justify-between items-center"
                        >
                            <span>{shippingTypeFilter?.label || "Ship by"}</span>
                            <svg className={`w-4 h-4 transform ${shippingTypeDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </button>
                        {shippingTypeDropdownOpen && (
                            <div className="absolute w-full mt-1 bg-white border rounded shadow-lg z-10">
                                <button onClick={() => { setShippingTypeFilter(""); setShippingTypeDropdownOpen(false); setPageNumber(0); }} className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                                    Tất cả
                                </button>
                                {shipTypeOptions.map((shipType) => (
                                    <button
                                        key={shipType.value}
                                        onClick={() => { setShippingTypeFilter(shipType); setShippingTypeDropdownOpen(false); setPageNumber(0); }}
                                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                    >
                                        {shipType.label}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Shop Filter với Checkbox và ô tìm kiếm */}
                <div ref={shopDropdownRef} onBlur={handleShopDropdownBlur}>
                    <div className="relative" style={{ width: "200px" }}>
                        <button
                            onClick={() => setShopDropdownOpen(!shopDropdownOpen)}
                            className="w-full p-1.5 border text-sm rounded text-left bg-white flex justify-between items-center"
                            disabled={isLoadingShops}
                        >
                            <span>
                                {isLoadingShops
                                    ? "Đang tải..."
                                    : shopFilter.length > 0
                                        ? `Đã chọn(${shopFilter.length})`
                                        : "Chọn shop"}
                            </span>
                            <svg className={`w-4 h-4 transform ${shopDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
                            </svg>
                        </button>
                        {shopDropdownOpen && (
                            <div className="absolute w-full mt-1 bg-white border rounded shadow-lg z-10">
                                {isLoadingShops ? (
                                    <div className="p-4 text-center text-gray-500">Đang tải danh sách shop...</div>
                                ) : shopOptions.length === 0 ? (
                                    <div className="p-4 text-center text-gray-500">Không có shop nào</div>
                                ) : (
                                    <>
                                        {/* Ô tìm kiếm trong dropdown */}
                                        <div className="p-2 border-b">
                                            <input
                                                type="text"
                                                value={shopSearch}
                                                onChange={(e) => setShopSearch(e.target.value)}
                                                placeholder="Tìm kiếm shop..."
                                                className="w-full p-1 text-sm border rounded bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>
                                        <div className="max-h-60 overflow-y-auto">
                                            <label className="block w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={tempShopFilter.length === 0}
                                                    onChange={() => setTempShopFilter([])}
                                                    className="mr-2"
                                                />
                                                Tất cả
                                            </label>
                                            {filteredShopOptions.map((shop) => (
                                                <label key={shop.value} className="block w-full text-left px-4 py-2 hover:bg-gray-100 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={tempShopFilter.some(item => item.value === shop.value)}
                                                        onChange={() => handleShopCheckboxChange(shop)}
                                                        className="mr-2"
                                                    />
                                                    {shop.label}
                                                </label>
                                            ))}
                                        </div>
                                        <div className="p-2 border-t">
                                            <button
                                                onClick={handleConfirmShopFilter}
                                                className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg text-sm px-4 py-1.5"
                                            >
                                                Xác nhận
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div style={{ minHeight: "500px" }} className="mt-4">
                <OrderTable ordersList={orders} isLoading={isLoadingOrderList} />
            </div>
            <div className="flex items-center justify-between">
                <div className="flex justify-between items-center pt-2 pr-1">
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-700">Số lượng</span>
                        <select
                            onChange={handleChangePageSize}
                            value={pageSize}
                            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5"
                        >
                            {pageSizeOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <Pagination totalPages={totalPages} currentPage={currentPage} handle={(page) => setPageNumber(page)} />
            </div>
        </>
    );
}