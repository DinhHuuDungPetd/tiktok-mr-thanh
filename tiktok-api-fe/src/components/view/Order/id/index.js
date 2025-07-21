"use client";

import {useState, useEffect, useCallback, use} from "react";
import { getOrderByShopId } from "@/service/shopService";
import { CiShop } from "react-icons/ci";
import Drawer from "@/components/Drawer";
import { MdChangeCircle } from "react-icons/md";
import DrShopList from "@/components/view/Order/id/DrShopList";
import OrderTable from "@/components/view/Order/id/OrderTable";
import { GiReturnArrow } from "react-icons/gi";

export default function OrderShopDetailsComponent({ params }) {
    const { id } = use(params);

    const [shopName, setShopName] = useState("Loading...");
    const [ordersList, setOrdersList] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchValue, setSearchValue] = useState("");
    const [nextPageToken, setNextPageToken] = useState(null);
    const [prevPageToken, setPrevPageToken] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageTokens, setPageTokens] = useState([]);
    const [condition, setCondition] = useState({
        id: id,
        pageSize: 10,
        pageToken: null,
        sortOrder: "DESC",
        sortField: "create_time",
        status: null,
        shippingType: null,
        orderIds: [],
    });

    const statusOptions = [
        { value: "UNPAID", label: "Unpaid" },
        { value: "ON_HOLD", label: "On Hold" },
        { value: "AWAITING_SHIPMENT", label: "Awaiting Shipment" },
        { value: "PARTIALLY_SHIPPING", label: "Partially Shipping" },
        { value: "AWAITING_COLLECTION", label: "Awaiting Collection" },
        { value: "IN_TRANSIT", label: "In Transit" },
        { value: "DELIVERED", label: "Delivered" },
        { value: "COMPLETED", label: "Completed" },
        { value: "CANCELLED", label: "Cancelled" },
    ];

    const pageSizeOptions = [
        { value: 10, label: "10" },
        { value: 20, label: "20" },
        { value: 50, label: "50" },
    ];

    // Hàm sắp xếp đơn hàng theo create_time giảm dần
    const sortOrders = (orders) => {
        return [...orders].sort((a, b) => {
            return new Date(b.create_time) - new Date(a.create_time);
        });
    };

    // Fetch orders khi condition thay đổi
    useEffect(() => {
        const fetchOrders = async () => {
            try {
                setIsLoading(true);
                const data = await getOrderByShopId(condition);
                // Sắp xếp danh sách đơn hàng
                setOrdersList(sortOrders(data?.orders || []));
                setNextPageToken(data?.next_page_token || null);

                // Lưu trữ pageToken của trang hiện tại để hỗ trợ "Trang trước"
                setPageTokens((prev) => {
                    const newTokens = [...prev];
                    newTokens[currentPage - 1] = condition.pageToken;
                    return newTokens;
                });
            } catch (e) {
                setOrdersList([]);
                setNextPageToken(null);
                setPrevPageToken(null);
            } finally {
                setIsLoading(false);
            }
        };

        setShopName(localStorage.getItem("current-shop") || "Shop not found");
        fetchOrders();
    }, [condition, currentPage]);

    // Hàm refresh được memoized
    const refresh = useCallback(async () => {
        try {
            const data = await getOrderByShopId(condition);
            setOrdersList(sortOrders(data?.orders || []));
            setNextPageToken(data?.next_page_token || null);
        } catch (e) {
            console.log(e);
        }
    }, [condition]);

    // Hàm xử lý search được memoized
    const handleSearch = useCallback(
        (e) => {
            e.preventDefault();
            const newValue = searchValue.trim() ? [searchValue] : [];
            setCondition((prev) => ({
                ...prev,
                orderIds: newValue,
                status: null,
                shippingType: null,
                pageToken: null,
            }));
            setCurrentPage(1);
            setPageTokens([]);
        },
        [searchValue]
    );

    // Chuyển đến trang trước
    const handlePrevPage = () => {
        if (currentPage > 1) {
            const prevPage = currentPage - 1;
            setCurrentPage(prevPage);
            setCondition((prev) => ({
                ...prev,
                pageToken: pageTokens[prevPage - 1] || null,
            }));
        }
    };

    // Chuyển đến trang sau
    const handleNextPage = () => {
        if (nextPageToken) {
            const nextPage = currentPage + 1;
            setCurrentPage(nextPage);
            setCondition((prev) => ({
                ...prev,
                pageToken: nextPageToken,
            }));
        }
    };

    // Xử lý thay đổi pageSize
    const handlePageSizeChange = (e) => {
        const newPageSize = Number(e.target.value);
        setCondition((prev) => ({
            ...prev,
            pageSize: newPageSize,
            pageToken: null,
        }));
        setCurrentPage(1);
        setPageTokens([]);
    };

    return (
        <div>
            <div className="header flex items-center justify-between bg-white p-4 shadow-md rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800">
                    Order List
                </h2>
                <div className="flex items-center justify-end space-x-4">
                    <select
                        value={condition.shippingType || ""}
                        onChange={(e) => {
                            setCondition({
                                ...condition,
                                shippingType: e.target.value || null,
                                pageToken: null,
                            });
                            setCurrentPage(1);
                            setPageTokens([]);
                        }}
                        id="ship_type"
                        style={{ width: "100px" }}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                    >
                        <option value="">Ship (All)</option>
                        <option value="TIKTOK">TikTok</option>
                        <option value="SELLER">Seller</option>
                    </select>
                    <select
                        value={condition.status || ""}
                        onChange={(e) => {
                            setCondition({
                                ...condition,
                                status: e.target.value || null,
                                pageToken: null,
                            });
                            setCurrentPage(1);
                            setPageTokens([]);
                        }}
                        id="status"
                        style={{ minWidth: "100px" }}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-1.5"
                    >
                        <option value="">Status (All)</option>
                        {statusOptions.map((status) => (
                            <option key={status.value} value={status.value}>
                                {status.label}
                            </option>
                        ))}
                    </select>
                    <form onSubmit={handleSearch} className="relative">
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
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            id="default-search"
                            autoComplete="off"
                            style={{ minWidth: "400px" }}
                            className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="Search by order id"
                        />
                        <button
                            type="submit"
                            className="absolute right-2.5 bottom-2 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 text-white font-medium rounded-lg text-xs px-2 py-1 transition-colors duration-200"
                        >
                            Search
                        </button>
                    </form>
                    <div className="flex items-center space-x-2 whitespace-nowrap">
                        <h1 className="text-lg font-medium text-gray-900">
                            {shopName}
                        </h1>
                        <Drawer
                            icon={<CiShop className="text-lg" />}
                            btnIcon={<MdChangeCircle className="text-lg" />}
                            textButton=""
                            title="Shop"
                            children={<DrShopList type={"ORDER"} shopId={id} />}
                        />
                    </div>
                </div>
            </div>
            <div className="flex justify-between items-center pt-2 pr-1">
                <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">Hiển thị</span>
                    <select
                        value={condition.pageSize}
                        onChange={handlePageSizeChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5"
                    >
                        {pageSizeOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <span className="text-sm text-gray-700">
                        mục trên mỗi trang
                    </span>
                </div>
                <button
                    onClick={refresh}
                    className="bg-green-600 hover:bg-green-700 text-xs text-white px-2 py-1 rounded flex items-center gap-1"
                >
                    <GiReturnArrow />
                    Refresh
                </button>
            </div>
            <div className="mt-2">
                <OrderTable
                    change={refresh}
                    shopId={id}
                    isLoading={isLoading}
                    ordersList={ordersList}
                />
                {/* Phân trang truyền thống - Đặt nextPage và prevPage cạnh nhau */}
                <div className="flex items-center justify-end mt-4 space-x-4">
                    <span className="text-sm text-gray-700">
                        Trang {currentPage}
                    </span>
                    <div className="flex space-x-2">
                        <button
                            onClick={handlePrevPage}
                            disabled={currentPage === 1}
                            className={`px-4 py-2 text-sm font-medium rounded-lg ${
                                currentPage === 1
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                        >
                            Trang trước
                        </button>
                        <button
                            onClick={handleNextPage}
                            disabled={!nextPageToken}
                            className={`px-4 py-2 text-sm font-medium rounded-lg ${
                                !nextPageToken
                                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                                    : "bg-blue-600 text-white hover:bg-blue-700"
                            }`}
                        >
                            Trang sau
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}