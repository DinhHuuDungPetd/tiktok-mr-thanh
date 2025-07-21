
import { FaCheck, FaTimes, FaClock, FaExclamation, FaUndo } from 'react-icons/fa';

const TagRefund = ({ status, type = "Refund" }) => {
    const getTagConfig = (status, type) => {
        const baseConfig = {
            icon: null,
            color: 'bg-gray-100 text-gray-800',
            text: 'Unknown Status',
        };

        // Xử lý return_status
        switch (status) {
            case 'RETURN_OR_REFUND_REQUEST_PENDING':
                return {
                    ...baseConfig,
                    text: 'Pending Review',
                    color: 'bg-yellow-100 text-yellow-800',
                    icon: FaClock,
                };
            case 'REFUND_OR_RETURN_REQUEST_REJECT':
                return {
                    ...baseConfig,
                    text: 'Request Rejected',
                    color: 'bg-red-100 text-red-800',
                    icon: FaTimes,
                };
            case 'AWAITING_BUYER_SHIP':
                return {
                    ...baseConfig,
                    text: 'Awaiting Buyer Ship',
                    color: 'bg-yellow-100 text-yellow-800',
                    icon: FaClock,
                };
            case 'BUYER_SHIPPED_ITEM':
                return {
                    ...baseConfig,
                    text: 'Buyer Shipped Item',
                    color: 'bg-blue-100 text-blue-800',
                    icon: FaUndo,
                };
            case 'REJECT_RECEIVE_PACKAGE':
                return {
                    ...baseConfig,
                    text: 'Rejected by Seller',
                    color: 'bg-red-100 text-red-800',
                    icon: FaTimes,
                };
            case 'RETURN_OR_REFUND_REQUEST_SUCCESS':
                return {
                    ...baseConfig,
                    text: 'Refund Successful',
                    color: 'bg-green-100 text-green-800',
                    icon: FaCheck,
                };
            case 'RETURN_OR_REFUND_REQUEST_CANCEL':
                return {
                    ...baseConfig,
                    text: 'Request Cancelled',
                    color: 'bg-gray-100 text-gray-800',
                    icon: null,
                };
            case 'RETURN_OR_REFUND_REQUEST_COMPLETE':
                return {
                    ...baseConfig,
                    text: 'Return/Refund Complete',
                    color: 'bg-green-100 text-green-800',
                    icon: FaCheck,
                };
            case 'AWAITING_BUYER_RESPONSE':
                return {
                    ...baseConfig,
                    text: 'Awaiting Buyer Response',
                    color: 'bg-yellow-100 text-yellow-800',
                    icon: FaClock,
                };
            default:
                return baseConfig;
        }
    };

    // Xử lý return_type để thêm vào text nếu có
    const { text, color, icon: Icon } = getTagConfig(status, type);
    const displayText = type ? `${text} (${type})` : text;

    return (
        <div className={`inline-flex items-center px-2 py-1 ${color} text-xs font-medium rounded-full space-x-1`}>
            {Icon && <Icon className="h-3 w-3" />}
            <span>{displayText}</span>
        </div>
    );
};

export default TagRefund;