"use client";

import {useState, useEffect, useCallback, use} from "react";
import authorizeAxiosInstance from "@/hooks/authorizeAxiosInstance";
import Drawer from "@/components/Drawer";
import {CiShop} from "react-icons/ci";
import {MdChangeCircle} from "react-icons/md";
import DrShopList from "@/components/view/Order/id/DrShopList";

export default function FinanceDetails({params}) {

    const {id} = use(params);
    const [shopName, setShopName] = useState("Loading...");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [activeFilter, setActiveFilter] = useState("thisWeek");
    const [summaryData, setSummaryData] = useState({ paid: 0, processing: 0, hold: 0 });
    const [paidList, setPaidList] = useState([]);
    const [processingList, setProcessingList] = useState([]);
    const [displayedList, setDisplayedList] = useState([]); // Danh sách đang hiển thị
    const [isLoadingSummary, setIsLoadingSummary] = useState(false);
    const [isLoadingBanks, setIsLoadingBanks] = useState(false);

    const formatDateUTC = (date) => date.toISOString().split("T")[0];
    const formatTimestamp = (timestamp) =>
        timestamp ? new Date(timestamp * 1000).toLocaleString() : "N/A";

    const getTimestamps = useCallback((start, end) => {
        const startTime = new Date(start + "T00:00:00Z");
        const endTime = new Date(end + "T00:00:00Z");
        endTime.setUTCDate(endTime.getUTCDate() + 1);
        return {
            startTimestamp: Math.floor(startTime.getTime() / 1000),
            endTimestamp: Math.floor(endTime.getTime() / 1000),
        };
    }, []);

    const fetchData = useCallback(async (startTimestamp, endTimestamp) => {
        setIsLoadingSummary(true);
        setIsLoadingBanks(true);

        try {
            const response = await authorizeAxiosInstance.get(
                `/auth/finance/payments/${id}?create_time_lt=${endTimestamp}&create_time_ge=${startTimestamp}`
            );
            const data = response.data || {};

            // Cập nhật summaryData
            setSummaryData({
                paid: parseFloat(data.amountPaid) || 0,
                processing: parseFloat(data.amountProcessing) || 0,
                hold: parseFloat(data.amountHold) || 0,
            });
            setIsLoadingSummary(false);

            // Cập nhật danh sách Paid
            const formattedPaidList = (data.paidListBank || []).map((bank) => ({
                balance: parseFloat(bank.amount) || 0,
                accountNumber: bank.bankAccount || "N/A",
                createTime: bank.createTime,
                paidTime: bank.paidTime,
                bankName: "Unknown Bank",
                accountHolder: "Unknown Holder",
                status: bank.status,
            }));
            setPaidList(formattedPaidList);

            // Cập nhật danh sách Processing
            const formattedProcessingList = (data.processingListBank || []).map((bank) => ({
                balance: parseFloat(bank.amount) || 0,
                accountNumber: bank.bankAccount || "N/A",
                createTime: bank.createTime,
                paidTime: bank.paidTime,
                bankName: "Unknown Bank",
                accountHolder: "Unknown Holder",
                status: bank.status,
            }));
            setProcessingList(formattedProcessingList);

            // Mặc định hiển thị danh sách Paid
            setDisplayedList(formattedPaidList);
            setIsLoadingBanks(false);
        } catch (error) {
            console.error("Lỗi khi lấy dữ liệu:", error);
            setSummaryData({ paid: 0, processing: 0, hold: 0 });
            setPaidList([]);
            setProcessingList([]);
            setDisplayedList([]);
            setIsLoadingSummary(false);
            setIsLoadingBanks(false);
        }
    }, []);

    const setFilter = useCallback(
        (type) => {
            const today = new Date();
            const utcToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()));
            let newStartDate, newEndDate;

            switch (type) {
                case "thisWeek":
                    newStartDate = new Date(utcToday.setUTCDate(utcToday.getUTCDate() - utcToday.getUTCDay()));
                    newEndDate = new Date(utcToday.setUTCDate(newStartDate.getUTCDate() + 6));
                    break;
                case "lastWeek":
                    newStartDate = new Date(utcToday.setUTCDate(utcToday.getUTCDate() - utcToday.getUTCDay() - 7));
                    newEndDate = new Date(utcToday.setUTCDate(newStartDate.getUTCDate() + 6));
                    break;
                case "lastMonth":
                    newStartDate = new Date(Date.UTC(utcToday.getUTCFullYear(), utcToday.getUTCMonth() - 1, 1));
                    newEndDate = new Date(Date.UTC(utcToday.getUTCFullYear(), utcToday.getUTCMonth(), 0));
                    break;
                default:
                    return;
            }

            const formattedStart = formatDateUTC(newStartDate);
            const formattedEnd = formatDateUTC(newEndDate);
            setStartDate(formattedStart);
            setEndDate(formattedEnd);
            setActiveFilter(type);

            const { startTimestamp, endTimestamp } = getTimestamps(formattedStart, formattedEnd);
            fetchData(startTimestamp, endTimestamp);
        },
        [fetchData, getTimestamps]
    );

    useEffect(() => {
        setShopName(localStorage.getItem("current-shop") || "Shop not found");
        if (typeof window === "undefined") return;
        setFilter("thisWeek");
    }, [setFilter]);

    const handleStartDateChange = (e) => {
        const newStartDate = e.target.value;
        setStartDate(newStartDate);
        if (endDate && newStartDate > endDate) setEndDate("");
        setActiveFilter("");
    };

    const handleFilter = () => {
        if (!startDate || !endDate) return;
        const { startTimestamp, endTimestamp } = getTimestamps(startDate, endDate);
        fetchData(startTimestamp, endTimestamp);
    };

    // Xử lý khi nhấn vào ô Paid hoặc Processing
    const handleShowPaidList = () => {
        setDisplayedList(paidList);
    };

    const handleShowProcessingList = () => {
        setDisplayedList(processingList);
    };

    return (
        <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
            <div className="flex items-center space-x-2 whitespace-nowrap">
                <h1 className="text-lg font-medium text-gray-900">
                    {shopName}
                </h1>
                <Drawer
                    icon={<CiShop className="text-lg" />}
                    btnIcon={<MdChangeCircle className="text-lg" />}
                    textButton=""
                    title="Shop"
                    children={<DrShopList type={"FINANCE"} shopId={id} />}
                />
            </div>
            <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Bộ lọc</h2>
                <div className="flex space-x-4 flex-wrap flex-col-reverse">
                    <div className="flex items-center mt-2 border rounded-lg w-fit">
                        <input
                            type="date"
                            value={startDate}
                            onChange={handleStartDateChange}
                            className="p-2 w-38 outline-none"
                        />
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            min={startDate}
                            disabled={!startDate}
                            className={`outline-none p-2 w-38 ${!startDate ? "bg-gray-200 cursor-not-allowed" : ""}`}
                        />
                        <button
                            type="button"
                            onClick={handleFilter}
                            disabled={!startDate || !endDate || (isLoadingSummary && isLoadingBanks)}
                            className={`px-2 py-2 mr-2 rounded text-white text-xs font-medium ${
                                !startDate || !endDate || (isLoadingSummary && isLoadingBanks)
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-blue-500 hover:bg-blue-600 cursor-pointer"
                            }`}
                        >
                            {(isLoadingSummary || isLoadingBanks) ? "Đang tải..." : "Lọc"}
                        </button>
                    </div>
                    <div className="flex space-x-2">
                        <button
                            type="button"
                            onClick={() => setFilter("thisWeek")}
                            disabled={isLoadingSummary || isLoadingBanks}
                            className={`px-3 py-2 rounded text-sm text-white font-medium ${
                                activeFilter === "thisWeek"
                                    ? "bg-red-700"
                                    : `bg-blue-500 ${!(isLoadingSummary || isLoadingBanks) && "hover:bg-blue-600"}`
                            }`}
                        >
                            This Week
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilter("lastWeek")}
                            disabled={isLoadingSummary || isLoadingBanks}
                            className={`px-3 py-2 rounded text-sm text-white font-medium ${
                                activeFilter === "lastWeek"
                                    ? "bg-red-700"
                                    : `bg-blue-500 ${!(isLoadingSummary || isLoadingBanks) && "hover:bg-blue-600"}`
                            }`}
                        >
                            Last Week
                        </button>
                        <button
                            type="button"
                            onClick={() => setFilter("lastMonth")}
                            disabled={isLoadingSummary || isLoadingBanks}
                            className={`px-3 py-2 rounded text-sm text-white font-medium ${
                                activeFilter === "lastMonth"
                                    ? "bg-red-700"
                                    : `bg-blue-500 ${!(isLoadingSummary || isLoadingBanks) && "hover:bg-blue-600"}`
                            }`}
                        >
                            Last Month
                        </button>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {isLoadingSummary ? (
                    <>
                        <div className="bg-gray-200 p-6 rounded-lg shadow-md animate-pulse">
                            <div className="h-6 bg-gray-300 rounded mb-2"></div>
                            <div className="h-10 bg-gray-300 rounded"></div>
                        </div>
                        <div className="bg-gray-200 p-6 rounded-lg shadow-md animate-pulse">
                            <div className="h-6 bg-gray-300 rounded mb-2"></div>
                            <div className="h-10 bg-gray-300 rounded"></div>
                        </div>
                        <div className="bg-gray-200 p-6 rounded-lg shadow-md animate-pulse">
                            <div className="h-6 bg-gray-300 rounded mb-2"></div>
                            <div className="h-10 bg-gray-300 rounded"></div>
                        </div>
                    </>
                ) : (
                    <>
                        <div
                            onClick={handleShowPaidList}
                            className="bg-green-50 p-6 rounded-lg shadow-md text-center transform transition hover:scale-105 cursor-pointer"
                        >
                            <h3 className="text-lg font-semibold text-green-700 mb-2">Paid</h3>
                            <p className="text-3xl font-bold text-green-900">
                                {summaryData.paid.toLocaleString()} USD
                            </p>
                        </div>
                        <div
                            onClick={handleShowProcessingList}
                            className="bg-yellow-50 p-6 rounded-lg shadow-md text-center transform transition hover:scale-105 cursor-pointer"
                        >
                            <h3 className="text-lg font-semibold text-yellow-700 mb-2">Processing</h3>
                            <p className="text-3xl font-bold text-yellow-900">
                                {summaryData.processing.toLocaleString()} USD
                            </p>
                        </div>
                    </>
                )}
            </div>

            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Thông tin chi tiết xứ lý</h2>
                {isLoadingBanks ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array(3).fill(0).map((_, index) => (
                            <div key={index} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 bg-gray-300 rounded-full mr-3"></div>
                                    <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                                </div>
                                <div className="space-y-2">
                                    <div className="h-4 bg-gray-300 rounded"></div>
                                    <div className="h-4 bg-gray-300 rounded"></div>
                                    <div className="h-4 bg-gray-300 rounded"></div>
                                    <div className="h-4 bg-gray-300 rounded"></div>
                                    <div className="h-4 bg-gray-300 rounded"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : displayedList.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {displayedList.map((account, index) => (
                            <div
                                key={index}
                                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transform transition hover:-translate-y-1"
                            >
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                                        <svg
                                            className="w-6 h-6 text-blue-600"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth="2"
                                                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a2 2 0 012-2h2a2 2 0 012 2v5m-4 0h4"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-800">{account.accountNumber}</h3>
                                </div>
                                <div className="space-y-2">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Số tiền:</span>{" "}
                                        <span className="text-green-600 font-semibold">
                                            {account.balance.toLocaleString()} USD
                                        </span>
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Trạng thái:</span>{" "}
                                        <span className={account.status === "PROCESSING" ? "text-yellow-600" : "text-green-600"}>
                                            {account.status}
                                        </span>
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Thời gian tạo:</span>{" "}
                                        {formatTimestamp(account.createTime)}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Thời gian thanh toán:</span>{" "}
                                        {account.paidTime === 0 ? "Chưa thanh toán" : formatTimestamp(account.paidTime)}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">Không có dữ liệu tài khoản ngân hàng.</p>
                )}
            </div>
        </div>
    );
}