import { PhotoProvider, PhotoView } from "react-photo-view";
import { FaEye , FaTimes } from "react-icons/fa";

export default function OrderLineItems({ lineItems, isOpen, setIsOpen }) {
    return (
        <div className="px-3 py-2 text-sm">
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Overlay mờ */}
                    <div
                        className="absolute inset-0"
                        style={{ backgroundColor: "rgba(0, 0, 0, 0.2)" }}
                    ></div>

                    <div className="relative bg-white rounded-xl w-full max-w-md transform transition-all duration-300 scale-100">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-800">Sản phẩm</h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                            >
                                <FaTimes className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Danh sách sản phẩm */}
                        <div className="p-4 max-h-96 overflow-y-auto">
                            {lineItems.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex items-center gap-3 py-3 border-b border-gray-100 last:border-b-0"
                                >
                                    <PhotoProvider>
                                        <PhotoView src={item.skuImage || item.productImage.url}>
                                            <div className="relative group">
                                                <img
                                                    src={item.skuImage || item.productImage.url}
                                                    alt="Product image"
                                                    className="h-10 w-10 rounded-md cursor-pointer object-cover"
                                                />
                                                {/* Overlay */}
                                                <div className="absolute inset-0 bg-gray-900 bg-opacity-60 opacity-0 group-hover:opacity-50 transition-all duration-300 flex items-center justify-center rounded-md">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <FaEye className="text-white text-sm" />
                                                    </div>
                                                </div>
                                            </div>
                                        </PhotoView>
                                    </PhotoProvider>
                                    <div className="flex-1">
                                        <p className="text-xs font-medium text-gray-800 break-words">
                                            {item.productName}
                                        </p>
                                        <p className="text-[10px] text-gray-500 break-words">
                                            {item.skuName}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}