import { useState, useEffect } from "react";
import {addTracking, getShippingProviders} from "@/service/shopService";
import {toast} from "react-toastify";

export default function TrackingForm({close, change, shopId, order}) {
    const [trackingNumber, setTrackingNumber] = useState("");
    const [shippingProviderId, setShippingProviderId] = useState("");
    const [shippingProviders, setShippingProviders] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Gọi API để lấy danh sách shipping providers khi component mount
    useEffect(() => {
        if(!order) return;
        const fetchShippingProviders = async () => {
            setIsLoading(true);
            console.log("order", order)
            try {
                const response = await getShippingProviders(shopId,order.deliveryOptionId);
                const providers = response.data.shippingProviders;
                setShippingProviders(providers);
                if (providers.length > 0) {
                    setShippingProviderId(providers[0].id);
                }
            } catch (err) {
                setError("Failed to load shipping providers");
                console.error("Error fetching shipping providers:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchShippingProviders();
    }, [order]);

    // Handler thay đổi tracking number
    const handleTrackingChange = (e) => {
        setTrackingNumber(e.target.value);
    };

    // Handler thay đổi shipping provider
    const handleProviderChange = (e) => {
        setShippingProviderId(e.target.value);
    };

    // Handler submit form
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!trackingNumber.trim()) {
            setError("Tracking number is required");
            return;
        }
        const payload = {
            shopId: shopId,
            orderId: order.id,
            trackingId: trackingNumber,
            shippingId: shippingProviderId,
        };
        (async ()=>{
            console.log("payload", payload ,"đang gửi..")
            await addTracking(payload)
                .then(data =>{
                    toast.success("add track thành cn, chờ 2s để đồng bộ!");
                    setTimeout(() => {
                        change();
                    }, 2000); // Chờ 2 giây mới gọi change()
                    close(false);
                })
                .catch(e=>{
                    toast.error("Có lỗi xảy ra!");
                    console.error("Lỗi khi tạo label:", error);
                })
        })()
    };

    // Styles
    const inputStyles = "w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500";
    const labelStyles = "block text-xs font-medium text-gray-600 mb-1";
    const errorStyles = "text-xs text-red-500 mt-1";

    return (
        <div className="max-w-md mx-auto p-4">
            <form onSubmit={handleSubmit}>
                {/* Tracking Number */}
                <div className="mb-4">
                    <label className={labelStyles}>Tracking Number</label>
                    <input
                        type="text"
                        value={trackingNumber}
                        onChange={handleTrackingChange}
                        className={inputStyles}
                        placeholder="Enter tracking number"
                        disabled={isLoading}
                    />
                    {error && !trackingNumber.trim() && <p className={errorStyles}>{error}</p>}
                </div>

                {/* Shipping Provider */}
                <div className="mb-4">
                    <label className={labelStyles}>Shipping Provider</label>
                    <select
                        value={shippingProviderId}
                        onChange={handleProviderChange}
                        className={inputStyles}
                        disabled={isLoading || shippingProviders.length === 0}
                    >
                        {isLoading ? (
                            <option>Loading...</option>
                        ) : shippingProviders.length === 0 ? (
                            <option>No providers available</option>
                        ) : (
                            shippingProviders.map(provider => (
                                <option key={provider.id} value={provider.id}>
                                    {provider.name}
                                </option>
                            ))
                        )}
                    </select>
                    {error && !shippingProviders.length && !trackingNumber.trim() && (
                        <p className={errorStyles}>{error}</p>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium py-2 rounded-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={isLoading}
                >
                    Add
                </button>
            </form>

            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center rounded-lg">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
}