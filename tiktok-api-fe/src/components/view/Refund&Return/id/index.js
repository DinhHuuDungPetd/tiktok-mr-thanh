"use client";

import {useEffect, useState, useRef, use} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getRefundList } from "@/service/shopService";
import RefundTable from "@/components/view/Refund&Return/id/RefundTable";
import Drawer from "@/components/Drawer";
import { CiShop } from "react-icons/ci";
import { MdChangeCircle } from "react-icons/md";
import DrShopList from "@/components/view/Order/id/DrShopList";
import { toast } from "react-toastify";

export default function RefundDetailsComponent({ params }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const {id} = use(params);
    const observerRef = useRef(null);

    const [shopName, setShopName] = useState("Loading...");
    const [searchValue, setSearchValue] = useState(searchParams.get("search") || "");
    const [refundList, setRefundList] = useState([]);
    const [nextPageToken, setNextPageToken] = useState(null);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    const returnStatusOptions = [
        { value: "", label: "All Statuses" },
        { value: "RETURN_OR_REFUND_REQUEST_PENDING", label: "Return Or Refund Request Pending" },
        { value: "REFUND_OR_RETURN_REQUEST_REJECT", label: "Refund Or Return Request Reject" },
        { value: "AWAITING_BUYER_SHIP", label: "Awaiting Buyer Ship" },
        { value: "BUYER_SHIPPED_ITEM", label: "Buyer Shipped Item" },
        { value: "REJECT_RECEIVE_PACKAGE", label: "Reject Receive Package" },
        { value: "RETURN_OR_REFUND_REQUEST_SUCCESS", label: "Return Or Refund Request Success" },
        { value: "RETURN_OR_REFUND_REQUEST_CANCEL", label: "Return Or Refund Request Cancel" },
        { value: "RETURN_OR_REFUND_REQUEST_COMPLETE", label: "Return Or Refund Request Complete" },
        { value: "AWAITING_BUYER_RESPONSE", label: "Awaiting Buyer Response" },
    ];

    const returnTypesOptions = [
        { value: "", label: "All Types" },
        { value: "REFUND", label: "Refund" },
        { value: "RETURN_AND_REFUND", label: "Return And Refund" },
        { value: "REPLACEMENT", label: "Replacement" },
    ];

    const [conditionRefund, setConditionRefund] = useState(() => {
        const search = searchParams.get("search");
        const initialCondition = {
            id: id,
            pageSize: 10,
            pageToken: null,
            sortOrder: "DESC",
            sortField: "create_time",
            orderIds: [],
            returnIds: [],
            returnStatus: [],
            returnTypes: [],
        };

        if (search) {
            if (search.length === 18) {
                initialCondition.orderIds = [search];
            } else if (search.length === 19) {
                initialCondition.returnIds = [search];
            }
        }
        return initialCondition;
    });

    useEffect(() => {
        const fetchRefundList = async () => {
            try {
                const data = await getRefundList(conditionRefund);
                console.log(data);
                if (conditionRefund.pageToken) {
                    setRefundList(prev => [...prev, ...(data?.returnOrders || [])]);
                } else {
                    setRefundList(data?.returnOrders || []);
                }
                setNextPageToken(data?.nextPageToken || null);
            } catch (error) {
                console.log(error);
                toast.error("Có lỗi xảy ra khi tải danh sách hoàn tiền!");
            } finally {
                setIsLoadingMore(false);
            }
        };

        fetchRefundList();
        setShopName(localStorage.getItem("current-shop") || "Shop not found");
    }, [conditionRefund]);

    useEffect(() => {
        const search = searchParams.get("search");
        if (search && search !== searchValue) {
            setSearchValue(search);
        }
    }, [searchParams]);

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchValue.length === 0) {
            setConditionRefund({ ...conditionRefund, orderIds: [], returnIds: [], pageToken: null });
            router.push(`/view/refund-return/${id}`);
            return;
        }

        if (searchValue.length < 18 || searchValue.length > 19) {
            toast.error("ID không hợp lệ (phải có 18 hoặc 19 chữ số)");
            return;
        }

        if (searchValue.length === 18) {
            setConditionRefund({ ...conditionRefund, orderIds: [searchValue], returnIds: [], pageToken: null });
        } else if (searchValue.length === 19) {
            setConditionRefund({ ...conditionRefund, orderIds: [], returnIds: [searchValue], pageToken: null });
        }

        router.push(`/view/refund-return/${id}?search=${encodeURIComponent(searchValue)}`);
    };

    const handleStatusChange = (e) => {
        const value = e.target.value;
        setConditionRefund(prev => ({
            ...prev,
            returnStatus: value ? [value] : [],
            pageToken: null,
        }));
    };

    const handleTypeChange = (e) => {
        const value = e.target.value;
        setConditionRefund(prev => ({
            ...prev,
            returnTypes: value ? [value] : [],
            pageToken: null,
        }));
    };

    const loadMore = () => {
        if (nextPageToken && !isLoadingMore) {
            setIsLoadingMore(true);
            setConditionRefund(prev => ({
                ...prev,
                pageToken: nextPageToken,
            }));
        }
    };

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && nextPageToken) {
                    loadMore();
                }
            },
            { threshold: 0.1 }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => {
            if (observerRef.current) {
                observer.unobserve(observerRef.current);
            }
        };
    }, [nextPageToken, isLoadingMore]);

    return (
        <>
            <div className="header flex items-center justify-between bg-white p-4 shadow-md rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800">Refund List</h2>
                <div className="flex items-center justify-end space-x-4">
                    <select
                        value={conditionRefund.returnStatus[0] || ""}
                        onChange={handleStatusChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-48 p-2"
                    >
                        {returnStatusOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                    <select
                        value={conditionRefund.returnTypes[0] || ""}
                        onChange={handleTypeChange}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-40 p-2"
                    >
                        {returnTypesOptions.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
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
                            placeholder="Search by order id, refund id.."
                        />
                        <button
                            type="submit"
                            className="absolute right-2.5 bottom-2 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 text-white font-medium rounded-lg text-xs px-2 py-1 transition-colors duration-200"
                        >
                            Search
                        </button>
                    </form>
                    <div className="flex items-center space-x-2 whitespace-nowrap">
                        <h1 className="text-lg font-medium text-gray-900">{shopName}</h1>
                        <Drawer
                            icon={<CiShop className="text-lg" />}
                            btnIcon={<MdChangeCircle className="text-lg" />}
                            textButton=""
                            title="Shop"
                            children={<DrShopList type={"REFUND"} shopId={id} />}
                        />
                    </div>
                </div>
            </div>
            <div className="mt-4">
                <RefundTable refundList={refundList} />
                <div ref={observerRef} className="h-10 flex items-center justify-center">
                    {isLoadingMore && <span className="text-gray-500">Loading more...</span>}
                    {!nextPageToken && refundList.length > 0 && (
                        <span className="text-gray-500">No more data</span>
                    )}
                </div>
            </div>
        </>
    );
}