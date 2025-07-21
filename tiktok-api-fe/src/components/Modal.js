// components/Modal.js
import { useEffect } from "react";
import { FaRegWindowClose } from "react-icons/fa";

export default function Modal({ isOpen, onClose, children, size = "md" }) {
    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden"; // Ngăn cuộn trang khi modal mở
        }
        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "auto"; // Khôi phục cuộn khi modal đóng
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    // Xác định kích thước dựa trên prop size
    const sizeClasses = {
        sm: "max-w-sm", // Nhỏ
        md: "max-w-md", // Trung bình (mặc định)
        lg: "max-w-lg", // Lớn
        xl: "max-w-xl", // Rất lớn
        "2xl": "max-w-2xl", // Tùy chỉnh lớn hơn (phù hợp với w-[600px])
        auto: "w-auto", // Tự động theo nội dung
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
        >

            <div
                className="absolute inset-0"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.2)", zIndex:"-1" }}
            ></div>
            <div
                className={`bg-white rounded-lg shadow-lg p-6 w-full ${
                    sizeClasses[size] || sizeClasses.md
                } max-h-[90vh] overflow-y-auto`}
                onClick={(e) => e.stopPropagation()} // Ngăn đóng khi click bên trong modal
            >
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-red-700 text-xl font-bold focus:outline-none"
                    >
                        <FaRegWindowClose />
                    </button>
                </div>
                <div className="mt-2">{children}</div>
            </div>
        </div>
    );
}