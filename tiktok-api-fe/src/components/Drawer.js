import { useState } from "react";

export default function Drawer({
                                   icon,
                                   btnIcon,
                                   textButton = "Thay đổi",
                                   title = "Info",
                                   children,
                                   isOpenCustom = null, // Đặt mặc định là null để kiểm tra
                                   setIsOpenCustom = null,
                                   isBtn = true
                               }) {
    // Chỉ dùng state nội bộ nếu isOpenCustom không được truyền vào
    const [isOpen, setIsOpen] = useState(false);

    // Quyết định sử dụng controlled hay uncontrolled
    const isControlled = isOpenCustom !== null && setIsOpenCustom !== null;
    const openState = isControlled ? isOpenCustom : isOpen;
    const setOpenState = isControlled ? setIsOpenCustom : setIsOpen;

    return (
        <div>
            {isBtn && <button
                className="flex text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-2 py-2"
                onClick={() => setOpenState(true)}
            >
                {btnIcon || ""}
                {textButton}
            </button>}
            <div
                className={`fixed top-0 right-0 z-40 h-screen p-4 overflow-y-auto transition-transform bg-white w-80 shadow-lg border-l border-gray-200 
          ${openState ? "translate-x-0" : "translate-x-full"}`}
            >
                {/* Tiêu đề Drawer */}
                <h5 className="inline-flex items-center gap-2 mb-4 text-base font-semibold text-gray-700">
                    {icon || ""}
                    {title}
                </h5>
                {/* Nút đóng Drawer */}
                <button
                    type="button"
                    className="text-gray-500 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 absolute top-2.5 end-2.5 flex items-center justify-center"
                    onClick={() => setOpenState(false)}
                >
                    <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                    </svg>
                    <span className="sr-only">Close menu</span>
                </button>
                <div className="content">
                    {children}
                </div>
            </div>
        </div>
    );
}