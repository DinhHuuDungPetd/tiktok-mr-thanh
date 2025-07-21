import OrderLineItems from "@/components/view/Order/id/OrderLineItems";
import {useState} from "react";

export default function RefundTable({ refundList }) {

    const [isOpen, setIsOpen] = useState(false);
    const [lineItemSelect, setLineItemSelect] = useState([]);
    const handleOpenLineItem = (lineItem)=>{
        console.log("line", lineItem);
        setLineItemSelect(lineItem)
        setIsOpen(true)
    }

    const formatDateUTC = (timestamp) =>
        new Date(timestamp * 1000).toLocaleString("vi-VN", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
            hour12: true,
            timeZone: "UTC",
        });

    const formatTimeUTC = (timestamp) =>
        new Date(timestamp * 1000).toLocaleString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: true,
            timeZone: "UTC",
        });

    const formatReturnStatus = (status) => {
        const validStatuses = [
            "RETURN_OR_REFUND_REQUEST_PENDING",
            "REFUND_OR_RETURN_REQUEST_REJECT",
            "AWAITING_BUYER_SHIP",
            "BUYER_SHIPPED_ITEM",
            "REJECT_RECEIVE_PACKAGE",
            "RETURN_OR_REFUND_REQUEST_SUCCESS",
            "RETURN_OR_REFUND_REQUEST_CANCEL",
            "RETURN_OR_REFUND_REQUEST_COMPLETE",
            "AWAITING_BUYER_RESPONSE",
        ];

        if (!status || !validStatuses.includes(status.toUpperCase())) {
            return "Unknown Status";
        }

        return status
            .toLowerCase()
            .split("_")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    const formatReturnType = (type) => {
        const validTypes = ["REFUND", "RETURN_AND_REFUND", "REPLACEMENT"];

        if (!type || !validTypes.includes(type.toUpperCase())) {
            return "Unknown Type";
        }

        return type
            .toLowerCase()
            .split("_")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-700 bg-white rounded-lg shadow-sm">
                <thead className="text-xs text-gray-600 uppercase bg-white border-b border-gray-100">
                <tr>
                    <th scope="col" className="px-4 py-2 w-16 text-center">
                        STT
                    </th>
                    <th scope="col" className="px-4 py-2 w-48">
                        Order/Refund ID
                    </th>
                    <th scope="col" className="px-4 py-2 w-64">
                        Product Images
                    </th>
                    <th scope="col" className="px-4 py-2 w-56">
                        Return Details
                    </th>
                    <th scope="col" className="px-4 py-2 w-32 text-right">
                        Refund Amount
                    </th>
                </tr>
                </thead>
                <tbody>
                {refundList.length > 0 &&
                    refundList.map((refund, index) => (
                        <tr
                            key={refund.returnId}
                            className="border-b border-gray-100 hover:bg-gray-50"
                        >
                            <td className="px-4 py-3 text-center align-middle">
                                <div className="text-sm">{index + 1}</div>
                                <div className="text-xs text-gray-500">
                                    {formatDateUTC(refund.createTime)}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {formatTimeUTC(refund.createTime)}
                                </div>
                            </td>
                            <td className="px-4 py-3 align-middle">
                                <div className="text-sm font-medium text-gray-700">
                                    Order: {refund.orderId}
                                </div>
                                <div className="text-sm text-gray-600">
                                    Refund: {refund.returnId}
                                </div>
                            </td>
                            <td className="px-4 py-3 align-middle">
                                <div onClick={() => handleOpenLineItem(refund.returnLineItems)} className="flex space-x-2">
                                    {refund.returnLineItems.map(item => (
                                        <img
                                            key={item.orderLineItemId}
                                            alt="Product image"
                                            className="object-cover rounded"
                                            height="36"
                                            src={item.productImage.url}
                                            width="36"
                                        />
                                    ))}
                                </div>
                            </td>
                            <td className="px-4 py-3 align-middle">
                                <div className="text-sm font-semibold text-gray-700">
                                    {formatReturnType(refund.returnType)}
                                </div>
                                <div className="text-sm text-gray-600">
                                    {formatReturnStatus(refund.returnStatus)}
                                </div>
                                <div className="text-xs text-gray-500">
                                    Lý do: {refund.returnReasonText}
                                </div>
                            </td>
                            <td className="px-4 py-3 text-right align-middle">
                                <div className="text-sm font-semibold text-teal-600">
                                    {refund.refundAmount.refundTotal}$
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <OrderLineItems setIsOpen={setIsOpen} isOpen={isOpen} lineItems={lineItemSelect}/>
        </div>
    );
}