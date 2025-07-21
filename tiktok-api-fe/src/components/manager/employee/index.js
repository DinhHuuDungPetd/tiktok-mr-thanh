"use client";

import { useEffect, useState } from "react";
import EmployeeTable from "@/components/manager/employee/EmployeeTable";
import { toast } from "react-toastify";
import { IoIosAddCircle } from "react-icons/io";
import Modal from "@/components/Modal";
import AddEmployeeForm from "@/components/manager/employee/AddEmployeeForm";
import { addEmployeeByOwner, getEmployeeByOwner } from "@/service/userService";

export default function EmployeeManagerComponent() {
    const [employeeList, setEmployeeList] = useState([]);
    const [filteredEmployees, setFilteredEmployees] = useState([]); // Danh sách đã lọc
    const [searchTerm, setSearchTerm] = useState(""); // Giá trị tìm kiếm
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    useEffect(() => {
        callData();
    }, []);

    const callData = async () => {
        await getEmployeeByOwner()
            .then((data) => {
                console.log(data);
                setEmployeeList(data || []);
                setFilteredEmployees(data || []); // Khởi tạo danh sách đã lọc
            })
            .catch((e) => console.error("Error fetching employees:", e));
    };

    // Lọc nhân viên dựa trên searchTerm
    useEffect(() => {
        if (!searchTerm) {
            setFilteredEmployees(employeeList); // Nếu không có từ khóa tìm kiếm, hiển thị toàn bộ danh sách
        } else {
            const filtered = employeeList.filter((employee) =>
                (employee.name && employee.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (employee.email && employee.email.toLowerCase().includes(searchTerm.toLowerCase()))
            );
            setFilteredEmployees(filtered);
        }
    }, [searchTerm, employeeList]);

    const handleAddEmployee = async (employeeData) => {
        const newEmployee = {
            email: employeeData.email,
            name: employeeData.name,
            password: employeeData.password,
        };
        addEmployeeByOwner(newEmployee)
            .then((data) => {
                callData();
                toast.success("Thêm nhân viên mới thành công!");
                setIsAddModalOpen(false);
            })
            .catch((e) => toast.error("Lỗi khi thêm nhân viên: " + e.message));
    };

    return (
        <div className="relative">
            <div className="header flex items-center justify-between bg-white p-4 shadow-md rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800">Employee List</h2>
                <div className="flex items-center justify-end space-x-4">
                    <form onSubmit={(e) => e.preventDefault() } className="relative">
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
                            id="default-search"
                            autoComplete="off"
                            style={{ minWidth: "400px" }}
                            className="block w-full p-2 pl-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                            placeholder="Tìm kiếm theo email hoặc tên..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)} // Cập nhật searchTerm khi người dùng nhập
                        />
                    </form>
                </div>
            </div>
            <div className="flex justify-start pt-2 pr-1">
                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-green-600 hover:bg-green-700 text-xs text-white px-2 py-1 rounded flex items-center gap-1"
                >
                    <IoIosAddCircle size={20} />
                    Thêm mới
                </button>
            </div>
            <div className="mt-2">
                <EmployeeTable
                    employeeList={filteredEmployees} // Truyền danh sách đã lọc
                    callData={callData}
                />
            </div>
            {/* Modal thêm nhân viên */}
            {isAddModalOpen && (
                <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
                    <AddEmployeeForm
                        onSubmit={handleAddEmployee}
                        onClose={() => setIsAddModalOpen(false)}
                    />
                </Modal>
            )}
        </div>
    );
}