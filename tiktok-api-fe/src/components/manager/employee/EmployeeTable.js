// components/manager/employee/EmployeeTable.js
import { FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { useState } from "react";
import { toast } from "react-toastify";
import Modal from "@/components/Modal";
import UpdateEmployeeForm from "@/components/manager/employee/UpdateEmployeeForm";
import {deleteEmployee, updateEmployee} from "@/service/userService"; // Giả định có form cập nhật

const MySwal = withReactContent(Swal);

export default function EmployeeTable({ employeeList, callData }) {
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    // Hàm xử lý xóa nhân viên với xác nhận
    const handleDelete = async (employeeId, employeeName) => {
        const result = await MySwal.fire({
            title: "Bạn có chắc chắn?",
            text: `Bạn muốn xóa nhân viên "${employeeName}"? Hành động này không thể hoàn tác!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Có, xóa nó!",
            cancelButtonText: "Hủy",
        });

        if (result.isConfirmed) {
            await deleteEmployee(employeeId)
                .then(async data => {
                    callData(); // Refresh danh sách sau khi xóa
                    await MySwal.fire({
                        title: "Đã xóa!",
                        text: "Nhân viên đã được xóa thành công.",
                        icon: "success",
                        timer: 2000,
                        showConfirmButton: false,
                    });
                })
        }
    };

    // Hàm xử lý cập nhật nhân viên
    const handleUpdateEmployee = async (employeeId, newName, password) => {
        if (!newName) {
            toast.error("Tên không được trống!");
            return;
        }
        await updateEmployee(employeeId,  {name : newName, password})
            .then(data =>{
                callData(); // Refresh danh sách
                toast.success("Cập nhật thành công!");
                setIsUpdateModalOpen(false);
                setSelectedEmployee(null);
            })
    };

    const openUpdateModal = (employee) => {
        setSelectedEmployee(employee);
        setIsUpdateModalOpen(true);
    };

    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3">
                        Tên Nhân Viên
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Email
                    </th>
                    <th scope="col" className="px-6 py-3">
                        Action
                    </th>
                </tr>
                </thead>
                <tbody>
                {employeeList.map((employee) => (
                    <tr
                        key={employee.id}
                        className="bg-white border-b border-gray-200 hover:bg-gray-50"
                    >
                        <th
                            scope="row"
                            className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                        >
                            {employee.name}
                        </th>
                        <td className="px-6 py-4">{employee.email}</td>
                        <td className="px-6 py-4 flex space-x-4">
                            <button
                                onClick={() => openUpdateModal(employee)}
                                className="text-yellow-600 hover:text-yellow-800 p-2 rounded-full hover:bg-yellow-100 transition-colors"
                                title="Chỉnh sửa"
                            >
                                <FaEdit size={24} />
                            </button>
                            <button
                                onClick={() => handleDelete(employee.id, employee.name)}
                                className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-colors"
                                title="Xóa"
                            >
                                <FaTrash size={24} />
                            </button>
                        </td>
                    </tr>
                ))}
                </tbody>
            </table>

            {/* Modal cập nhật */}
            {isUpdateModalOpen && selectedEmployee && (
                <Modal
                    isOpen={isUpdateModalOpen}
                    onClose={() => setIsUpdateModalOpen(false)}
                >
                    <UpdateEmployeeForm
                        employee={selectedEmployee}
                        onSubmit={handleUpdateEmployee}
                        onClose={() => {
                            setIsUpdateModalOpen(false);
                            setSelectedEmployee(null);
                        }}
                    />
                </Modal>
            )}
        </div>
    );
}