// components/ShopTable.js
import { useState } from "react";
import { FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import axios from "axios";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {updateShopName} from "@/service/shopService";

const MySwal = withReactContent(Swal);

export default function ShopTable({ shopList, isLoading, mutate }) {
    const [editingShopId, setEditingShopId] = useState(null);
    const [editedNote, setEditedNote] = useState("");

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const handleEditNote = (shop) => {
        setEditingShopId(shop.id);
        setEditedNote(shop.note || "");
    };

    const handleSaveNote = async (shopId) => {

        updateShopName(shopId,editedNote)
            .then(() =>{
                toast.success("Đã lưu ghi chú!");
                mutate();
                setEditingShopId(null);
            })
    };

    const handleCancelEdit = () => {
        setEditingShopId(null);
        setEditedNote("");
    };

    const handleRowClick = (shopId) => {
        if (editingShopId && editingShopId !== shopId) {
            handleCancelEdit();
        }
    };

    const handleDelete = async (shopId, shopName) => {
        const result = await MySwal.fire({
            title: "Bạn có chắc chắn?",
            text: `Bạn muốn xóa shop "${shopName}"? Hành động này không thể hoàn tác!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Có, xóa nó!",
            cancelButtonText: "Hủy",
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/shops/${shopId}`); // Giả định API xóa shop
                toast.success("Đã xóa shop thành công!");
                mutate(); // Làm mới danh sách
                MySwal.fire({
                    title: "Đã xóa!",
                    text: "Shop đã được xóa thành công.",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false,
                });
            } catch (error) {
                toast.error("Lỗi khi xóa shop: " + error.message);
                MySwal.fire({
                    title: "Lỗi!",
                    text: "Có lỗi xảy ra khi xóa shop.",
                    icon: "error",
                });
            }
        }
    };

    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
            <table className="w-full text-sm text-left text-gray-500">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3">Tên Shop</th>
                    <th scope="col" className="px-6 py-3">Ghi chú</th>
                    <th scope="col" className="px-6 py-3">Tag</th>
                    <th scope="col" className="px-6 py-3">Team</th>
                    <th scope="col" className="px-6 py-3">Hành động</th>
                </tr>
                </thead>
                <tbody>
                {isLoading ? (
                    <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                            Đang tải danh sách shop...
                        </td>
                    </tr>
                ) : shopList.length > 0 ? (
                    shopList.map((shop) => (
                        <tr
                            key={shop.id}
                            className="bg-white border-b border-gray-200 hover:bg-gray-50"
                            onClick={() => handleRowClick(shop.id)}
                        >
                            <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
                                <div className="flex flex-col space-y-1">
                                    <span className="text-base">{shop.name}</span>
                                    <span className="text-xs text-gray-500">
                                            {formatDate(shop.createdAt)}
                                        </span>
                                </div>
                            </td>
                            <td
                                className="px-6 py-4 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
                                onClick={() => handleEditNote(shop)}
                                style={{ maxWidth: "200px" }}
                            >
                                {editingShopId === shop.id ? (
                                    <div className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            value={editedNote}
                                            onChange={(e) => setEditedNote(e.target.value)}
                                            className="w-[200px] p-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                                            autoFocus
                                        />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSaveNote(shop.id);
                                            }}
                                            className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100 transition-colors"
                                            title="Lưu"
                                        >
                                            <FaSave size={16} />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleCancelEdit();
                                            }}
                                            className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition-colors"
                                            title="Hủy"
                                        >
                                            <FaTimes size={16} />
                                        </button>
                                    </div>
                                ) : (
                                    <span className="w-[200px] inline-block truncate">
                                            {shop.note || "Không có ghi chú"}
                                        </span>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                {shop.tagName || "Chưa gắn tag"}
                            </td>
                            <td className="px-6 py-4">
                                {shop.categoryNames && shop.categoryNames.length > 0
                                    ? shop.categoryNames.join(", ")
                                    : "Chưa thuộc team"}
                            </td>
                            <td className="px-6 py-4 flex space-x-4">
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Ngăn click ảnh hưởng đến handleRowClick
                                        handleDelete(shop.id, shop.name);
                                    }}
                                    className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-100 transition-colors"
                                    title="Xóa"
                                >
                                    <FaTrash size={20} />
                                </button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                            Không có shop nào để hiển thị
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
}