import {IoMdCopy} from "react-icons/io";
import {toast} from "react-toastify";
import {useState} from "react";
import OrderLineItems from "@/components/view/Order/id/OrderLineItems";
import Drawer from "@/components/Drawer";
import {CiShop} from "react-icons/ci";
import {MdChangeCircle} from "react-icons/md";
import CreateLabel from "@/components/view/Order/id/CreateLabel";
import {getLabelByShopId} from "@/service/shopService";
import TrackingForm from "@/components/view/Order/id/TrackingForm";
import TagRefund from "@/components/view/TagRefund";

export default function OrderTable({ ordersList, isLoading, shopId, change }) {

    const [isOpen, setIsOpen] = useState(false);
    const [isOpenCreateLabel, setIsOpenCreateLabel] = useState(false);
    const [isOpenTracking, setIsOpenTracking] = useState(false);
    const [lineItemSelect, setLineItemSelect] = useState([]);
    const [orderSelect, setOrderSelect] = useState(null);

    function formatTimestamp(timestamp) {
        const date = new Date(timestamp * 1000);
        const now = new Date();
        const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayOfWeek = weekdays[date.getUTCDay()];
        const day = String(date.getUTCDate()).padStart(2, '0');
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const year = date.getUTCFullYear();
        const hours = String(date.getUTCHours()).padStart(2, '0');
        const minutes = String(date.getUTCMinutes()).padStart(2, '0');

        const isToday = date.getUTCFullYear() === now.getUTCFullYear() &&
            date.getUTCMonth() === now.getUTCMonth() &&
            date.getUTCDate() === now.getUTCDate();

        return isToday
            ? `Today, ${day}/${month}/${year} ${hours}:${minutes} UTC`
            : `${dayOfWeek}, ${day}/${month}/${year} ${hours}:${minutes} UTC`;
    }

    function formatAddress(address) {
        const { name, phoneNumber, postalCode, addressDetail } = address;

        const city = address?.city || "";
        const state = address?.state || "";
        const country = address?.country || "";

        // Tạo địa chỉ theo định dạng: City, State, Country
        const location = [city, state, country].filter(Boolean).join(", ");

        // Tạo chuỗi định dạng mong muốn
        return {
            "line_1": `${name}`,
            "line_2": phoneNumber,
            "line_3": addressDetail,
            "line_4": location,
            "line_5": postalCode,
        };
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text);
        toast.success(`Copied: ${text}`, {
            position: "top-right",
            autoClose: 2000,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: false,
            draggable: true,
            theme: "light",
        });
    }
    const getStatusTag = (status) => {
        const statusMap = {
            "UNPAID": {
                label: "Unpaid",
                color: "bg-red-500",
                description: "The order has been placed, but payment has not been completed."
            },
            "ON_HOLD": {
                label: "On Hold",
                color: "bg-yellow-500",
                description: "The order has been accepted and is awaiting fulfillment. The buyer may still cancel without the seller’s approval."
            },
            "AWAITING_SHIPMENT": {
                label: "Awaiting Shipment",
                color: "bg-blue-500",
                description: "The order is ready to be shipped, but no items have been shipped yet."
            },
            "PARTIALLY_SHIPPING": {
                label: "Partially Shipping",
                color: "bg-purple-500",
                description: "Some items in the order have been shipped, but not all."
            },
            "AWAITING_COLLECTION": {
                label: "Awaiting Collection",
                color: "bg-indigo-500",
                description: "Shipping has been arranged, but the package is waiting to be collected by the carrier."
            },
            "IN_TRANSIT": {
                label: "In Transit",
                color: "bg-cyan-500",
                description: "The package has been collected by the carrier and delivery is in progress."
            },
            "DELIVERED": {
                label: "Delivered",
                color: "bg-green-500",
                description: "The package has been delivered to the buyer."
            },
            "COMPLETED": {
                label: "Completed",
                color: "bg-emerald-500",
                description: "The order has been completed, and no further returns or refunds are allowed."
            },
            "CANCELLED": {
                label: "Cancelled",
                color: "bg-red-500",
                description: "The order has been cancelled."
            }
        };

        return statusMap[status] || { label: "Unknown", color: "bg-gray-400", description: "Unknown order status." };
    };


    const handleOpenLineItem = (lineItem) => {
        setLineItemSelect(lineItem)
        setIsOpen(true)
    }
    const handleOpenCreateLabel = (order) => {
        setOrderSelect(order);
        setIsOpenCreateLabel(true);
    }

    const handleOpenAddTracking = (order) => {
        setOrderSelect(order);
        setIsOpenTracking(true);
    }
    const getLabel = async (packageId, shopId) => {
        await getLabelByShopId(shopId, packageId)
            .then(data => {
                let url = data.data.docUrl;
                window.open(url, "_blank");
            })
            .catch(e => {
                console.log(e);
                toast.error("Có lỗi xảy ra!");
            })

    }

    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-xs text-left text-gray-700">
                <thead className="text-[10px] uppercase bg-gray-50 text-gray-600">
                    <tr>
                        <th scope="col" className="px-3 py-2">Stt</th>
                        <th scope="col" className="px-3 py-2">Order Id</th>
                        <th scope="col" className="px-3 py-2">Sản phẩm</th>
                        <th scope="col" className="px-3 py-2">Trạng thái</th>
                        <th scope="col" className="px-3 py-2">Tổng tiền</th>
                        <th scope="col" className="px-3 py-2">Khách hàng</th>
                        <th scope="col" className="px-3 py-2">Label/Tracking</th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan="7" className="px-3 py-2 text-center text-white">
                                <div style={{ height: "80vh" }} className="w-full bg-white opacity-10 h-full flex justify-center items-center">
                                    <div role="status">
                                        <svg aria-hidden="true" className="inline w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-red-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
                                            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
                                        </svg>
                                        <span className="sr-only">Loading...</span>
                                    </div>
                                </div>
                            </td>
                        </tr>
                    ) : ordersList.length === 0  ? (
                        <tr>
                            <td colSpan="6" className="px-3 py-2 text-center text-gray-500">
                                No orders available
                            </td>
                        </tr>
                    ) : (
                        ordersList.map((order, index) => (
                            <tr
                                key={order.id}
                                className={index % 2 === 0 ? "bg-white border-b border-gray-200" : "bg-gray-50 border-b border-gray-200"}
                            >
                                <td className="px-3 py-2">
                                    {index + 1}
                                </td>
                                <td style={{ maxWidth: "200px" }} className="px-3 py-2 text-gray-900 leading-relaxed">
                                    <div className="flex items-center gap-1">
                                        <span>ID: {order.id}</span>
                                        <IoMdCopy
                                            className="text-gray-500 cursor-pointer hover:text-blue-600"
                                            onClick={() => copyToClipboard(order.id)}
                                            size={14}
                                        />
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <span>Tracking: {order.trackingNumber || "Chưa có"}</span>
                                        {order.trackingNumber && (
                                            <IoMdCopy
                                                className="text-gray-500 cursor-pointer hover:text-blue-600"
                                                onClick={() => copyToClipboard(order.trackingNumber)}
                                                size={14}
                                            />
                                        )}
                                    </div>
                                    <div className="text-gray-500">{formatTimestamp(order.createTime)}</div>
                                    <div>
                                        <div className={`inline-flex items-center px-2 py-1 bg-amber-400 text-xs font-medium rounded-full`}>
                                            <span>{order.shopNote}</span>
                                        </div>
                                    </div>
                                </td>
                                <td style={{ maxWidth: "250px" }}>
                                    <div
                                        onClick={() => handleOpenLineItem(order.orderDetailsList)}
                                        className="flex flex-wrap gap-2 p-2 transition-colors duration-300 hover:bg-gray-300 rounded-md"
                                    >
                                        {order.orderDetailsList.map(item => (
                                            <div key={item.id} className="relative">
                                                <img
                                                    src={item.skuImage}
                                                    alt="Product image"
                                                    height="40"
                                                    width="40"
                                                    className="rounded-md"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-3 py-2">
                                    {(() => {
                                        const { label, color, description } = getStatusTag(order.status);
                                        return (
                                            <span
                                                className={`px-2 py-1 text-xs font-semibold text-white rounded ${color}`}
                                                title={description}
                                            >
                                                {label}
                                            </span>
                                        );
                                    })()}
                                    <br />
                                    <div className="mt-2">
                                        <span className="text-xs font-semibold">Ship by: {order.shippingType}</span>
                                    </div>
                                    <div>
                                        {order.return_status && <TagRefund status={order.return_status} type={order.return_type} />}
                                    </div>
                                </td>
                                <td className="px-3 py-2">
                                    <span className="font-medium text-gray-900">
                                        {order.totalAmount.toLocaleString("en-US", {
                                            style: "currency",
                                            currency: "USD",
                                        })} $
                                    </span>
                                </td>
                                <td style={{ maxWidth: "200px" }} className="px-3 py-2">
                                    <div>
                                        {formatAddress(order.address) ? (
                                            <>
                                                <p className="font-medium">{formatAddress(order.address).line_1}</p>
                                                <p>
                                                    <span className="text-gray-600">{formatAddress(order.address).line_2}</span>
                                                </p>
                                                <p>{formatAddress(order.address).line_3}</p>
                                                <p>
                                                    <span className="text-gray-600">{formatAddress(order.address).line_4}</span>
                                                </p>
                                                <p>
                                                    <span className="text-gray-600">{formatAddress(order.address).line_5}</span>
                                                </p>
                                            </>
                                        ) : (
                                            <p className="text-gray-500">Không có thông tin địa chỉ</p>
                                        )}
                                    </div>
                                </td>
                                <td className="px-3 py-2">
                                    {order.shippingType === "TIKTOK" && order.status === "AWAITING_SHIPMENT" && (
                                        <button
                                            onClick={() => handleOpenCreateLabel(order)}
                                            type="button"
                                            className="bg-purple-700 hover:bg-purple-800 text-white rounded px-3 py-1"
                                        >
                                            Tạo
                                        </button>
                                    )}
                                    {order.shippingType === "SELLER" && order.status === "AWAITING_SHIPMENT" && (
                                        <button
                                            onClick={() => handleOpenAddTracking(order)}
                                            type="button"
                                            className="bg-purple-700 hover:bg-purple-800 text-white rounded px-3 py-1"
                                        >
                                            Tracking
                                        </button>
                                    )}
                                    {order.shippingType === "TIKTOK" && order.status === "AWAITING_COLLECTION" && (
                                        <button
                                            onClick={() => getLabel(order.packageId, order.shopId)}
                                            type="button"
                                            className="bg-blue-700 hover:bg-blue-800 text-white rounded px-3 py-1"
                                        >
                                            Label
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
            <OrderLineItems setIsOpen={setIsOpen} isOpen={isOpen} lineItems={lineItemSelect} />
            {isOpenCreateLabel && <Drawer
                isBtn={false}
                icon={<CiShop className="text-lg" />}
                btnIcon={<MdChangeCircle className="text-lg" />}
                textButton={""}
                title={"Tạo lable"}
                children={<CreateLabel close={setIsOpenCreateLabel} change={change} orderId={orderSelect?.id || null}
                    shopId={orderSelect?.shopId || null} lineItem={orderSelect?.orderDetailsList || []} />}
                isOpenCustom={isOpenCreateLabel}
                setIsOpenCustom={setIsOpenCreateLabel}
            />}
            {isOpenTracking && <Drawer
                isBtn={false}
                icon={<CiShop className="text-lg" />}
                btnIcon={<MdChangeCircle className="text-lg" />}
                textButton={""}
                title={"Add Tracking"}
                children={<TrackingForm close={setIsOpenTracking} change={change} order={orderSelect} shopId={orderSelect?.shopId || null} />}
                isOpenCustom={isOpenTracking}
                setIsOpenCustom={setIsOpenTracking}
            />}
        </div>
    );
}
