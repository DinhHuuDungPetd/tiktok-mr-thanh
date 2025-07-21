// components/manager/employee/UpdateEmployeeForm.js
import { useState } from "react";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function UpdateEmployeeForm({ employee, onSubmit, onClose }) {
    const [name, setName] = useState(employee.name);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false); // State để hiển thị/ẩn mật khẩu

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!name) {
            toast.error("Tên không được trống!");
            return;
        }

        if (password && password.length < 8) {
            toast.error("Mật khẩu phải dài hơn 8 ký tự!");
            return;
        }

        onSubmit(employee.id, name, password);
    };

    return (
        <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Cập nhật thông tin nhân viên</h2>
            <form onSubmit={handleSubmit} autoComplete="off">
                <div className="mb-4">
                    <label
                        htmlFor="employeeName"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Tên nhân viên
                    </label>
                    <input
                        type="text"
                        id="employeeName"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập tên nhân viên"
                        autoComplete="off"
                    />
                </div>
                <div className="mb-4 relative">
                    <label
                        htmlFor="employeePassword"
                        className="block text-sm font-medium text-gray-700"
                    >
                        Mật khẩu mới (để trống nếu không đổi)
                    </label>
                    <input
                        type={showPassword ? "text" : "password"}
                        id="employeePassword"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 pr-10"
                        placeholder="Nhập mật khẩu mới"
                        autoComplete="new-password" // Tắt tự động điền mật khẩu
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 transform translate-y-1 text-gray-500 hover:text-gray-700"
                    >
                        {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                    </button>
                </div>
                <div className="flex justify-end space-x-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        Cập nhật
                    </button>
                </div>
            </form>
        </div>
    );
}