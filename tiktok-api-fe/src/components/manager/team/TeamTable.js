"use client";
import { FaPlus, FaUserPlus, FaEdit, FaTrash } from "react-icons/fa";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { changeStatusAutoGetLable, deleteCategory, updateCategoryName } from "@/service/categoryService";
import Modal from "@/components/Modal";
import UpdateTeamForm from "@/components/manager/team/UpdateTeamForm";
import AddAccountModalContent from "@/components/manager/team/AddAccountModalContent";
import AddShopModalContent from "@/components/manager/team/AddShopModalContent";
import { useState } from "react";
import { toast } from "react-toastify";
import { MdAutoMode } from "react-icons/md";

const MySwal = withReactContent(Swal);

export default function TeamTable({ categoryList, callData, isLoading }) {
    const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
    const [isShopModalOpen, setIsShopModalOpen] = useState(false);
    const [selectedTeam, setSelectedTeam] = useState(null);

    function formatISODate(isoString) {
        const date = new Date(isoString);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");
        return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
    }

    const handleDelete = async (categoryId, categoryName) => {
        try {
            const result = await MySwal.fire({
                title: "Bạn có chắc chắn?",
                text: `Bạn muốn xóa category "${categoryName}"? Hành động này không thể hoàn tác!`,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#d33",
                cancelButtonColor: "#3085d6",
                confirmButtonText: "Có, xóa nó!",
                cancelButtonText: "Hủy",
            });

            if (result.isConfirmed) {
                await deleteCategory(categoryId);
                callData();
                await MySwal.fire({
                    title: "Đã xóa!",
                    text: "Category đã được xóa thành công.",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false,
                });
            }
        } catch (error) {
            await MySwal.fire({
                title: "Lỗi!",
                text: "Có lỗi xảy ra khi xóa category: " + error.message,
                icon: "error",
            });
        }
    };

    const handleUpdateTeam = async (categoryId, newName, noteUrl, folderId) => {
        if (!newName) {
            toast.error("Tên không được trống!");
            return;
        }
        await updateCategoryName(categoryId, { categoryName: newName, noteUrl, folderId})
            .then(() => {
                callData();
                toast.success("Cập nhật thành công!");
            })
            .catch((e) => toast.error("Lỗi khi cập nhật category: " + e.message));

        setIsUpdateModalOpen(false);
        setSelectedCategory(null);
    };

    const handleAutoGetLable = async (categoryId, status) => {
        let text = status ? "BẬT" : "TĂT";

        const result = await MySwal.fire({
            title: "Bạn có chắc chắn?",
            text: `Bạn có muốn ${text} tự động lấy lable cho team này không?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Có",
            cancelButtonText: "Hủy",
        });

        if (result.isConfirmed) {
            changeStatusAutoGetLable(categoryId, status)
                .then(() => {
                    callData();
                    toast.success("Cập nhật thành công!");
                })
                .catch((e) => console.log(e));
        }
    };

    const openUpdateModal = (category) => {
        setSelectedCategory(category);
        setIsUpdateModalOpen(true);
    };

    const openAccountModal = (team) => {
        setSelectedTeam(team);
        setIsAccountModalOpen(true);
    };

    const openShopModal = (team) => {
        setSelectedTeam(team);
        setIsShopModalOpen(true);
    };

    const getEmployeeNamesFromTeam = (employeeSet) => {
        return employeeSet.map(employee => employee.user.name);
    };

    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            {isLoading ? (
                <div className="flex justify-center items-center h-64">
                    <div className="flex flex-col items-center">
                        <svg
                            className="animate-spin h-10 w-10 text-blue-600 mb-2"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                            />
                            <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            />
                        </svg>
                        <span className="text-gray-500 text-lg">Đang tải dữ liệu...</span>
                    </div>
                </div>
            ) : (
                <table className="w-full text-sm text-left text-gray-500">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Tên Team</th>
                        <th scope="col" className="px-6 py-3">Số lượng Shop</th>
                        <th scope="col" className="px-6 py-3">Số lượng Người Quản</th>
                        <th scope="col" className="px-6 py-3">Action</th>
                    </tr>
                    </thead>
                    <tbody>
                    {categoryList.length === 0 ? (
                        <tr>
                            <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                                Không có dữ liệu để hiển thị
                            </td>
                        </tr>
                    ) : (
                        categoryList.map((team) => (
                            <tr key={team.id} className="bg-white border-b border-gray-200 hover:bg-gray-50">
                                <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                    {team.name}
                                    <br />
                                    <span className="text-gray-500 text-xs">
                                            {formatISODate(team.createdAt)}
                                        </span>
                                </th>
                                <td className="px-6 py-4">{team.shopSet.length}</td>
                                <td style={{ maxWidth: "300px" }} className="px-6 py-4">
                                    Tổng: {team.employeeSet.length}
                                    <br />
                                    {getEmployeeNamesFromTeam(team.employeeSet).join(", ")}
                                </td>
                                <td className="px-6 py-4 flex space-x-4">
                                    <button
                                        onClick={() => openShopModal(team)}
                                        className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-100 transition-colors"
                                        title="Thêm Shop"
                                    >
                                        <FaPlus size={24} />
                                    </button>
                                    <button
                                        onClick={() => openAccountModal(team)}
                                        className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-100 transition-colors"
                                        title="Thêm Người Quản"
                                    >
                                        <FaUserPlus size={24} />
                                    </button>
                                    <button
                                        onClick={() => openUpdateModal(team)}
                                        className="text-yellow-600 hover:text-yellow-800 p-2 rounded-full hover:bg-yellow-100 transition-colors"
                                        title="Chỉnh sửa"
                                    >
                                        <FaEdit size={24} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(team.id, team.name)}
                                        className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-colors"
                                        title="Xóa"
                                    >
                                        <FaTrash size={24} />
                                    </button>
                                    <button
                                        onClick={() => handleAutoGetLable(team.id, !team.autoGetLabel)}
                                        className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-colors"
                                        title="Tự động lấy label"
                                    >
                                        <MdAutoMode className={team.autoGetLabel ? `text-red-500` : `text-gray-400`} size={24} />
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                    </tbody>
                </table>
            )}

            {/* Modal cập nhật */}
            {isUpdateModalOpen && selectedCategory && (
                <Modal
                    isOpen={isUpdateModalOpen}
                    onClose={() => setIsUpdateModalOpen(false)}
                    size="md"
                >
                    <UpdateTeamForm
                        category={selectedCategory}
                        onSubmit={handleUpdateTeam}
                        onClose={() => {
                            setIsUpdateModalOpen(false);
                            setSelectedCategory(null);
                        }}
                    />
                </Modal>
            )}

            {/* Modal thêm tài khoản */}
            {isAccountModalOpen && selectedTeam && (
                <Modal
                    isOpen={isAccountModalOpen}
                    onClose={() => setIsAccountModalOpen(false)}
                    size="2xl"
                >
                    <AddAccountModalContent
                        team={selectedTeam}
                        callData={callData}
                        onClose={() => {
                            setIsAccountModalOpen(false);
                            setSelectedTeam(null);
                        }}
                    />
                </Modal>
            )}

            {/* Modal thêm shop */}
            {isShopModalOpen && selectedTeam && (
                <Modal
                    isOpen={isShopModalOpen}
                    onClose={() => setIsShopModalOpen(false)}
                    size="2xl"
                >
                    <AddShopModalContent
                        team={selectedTeam}
                        callData={callData}
                        onClose={() => {
                            setIsShopModalOpen(false);
                            setSelectedTeam(null);
                        }}
                    />
                </Modal>
            )}
        </div>
    );
}