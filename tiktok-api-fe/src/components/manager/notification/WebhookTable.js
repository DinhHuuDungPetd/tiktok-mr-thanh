"use client";

import { useState } from "react";
import { FaEdit, FaTrash, FaSave, FaTimes } from "react-icons/fa";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {getListWebhooks, updateWebhook} from "@/service/webhookService";
import axios from "axios";

const MySwal = withReactContent(Swal);

const WebhookTable = () => {
    const { data, isLoading, mutate } = getListWebhooks();
    const [editingWebhookId, setEditingWebhookId] = useState(null);
    const [editedUrl, setEditedUrl] = useState("");

    const handleEditWebhook = (webhook) => {
        setEditingWebhookId(webhook.id);
        setEditedUrl(webhook.url || "");
    };

    const handleSaveWebhook = async (webhook) => {
        if (!editedUrl.trim()) {
            toast.error("URL không được để trống!");
            return;
        }
        updateWebhook(editedUrl, webhook.eventType )
            .then((data)=>{
                console.log(data)
                mutate()
                toast.success("Cập nhật thành công!");
                handleCancelEdit();
            })
    };

    const handleCancelEdit = () => {
        setEditingWebhookId(null);
        setEditedUrl("");
    };

    const handleDeleteWebhook = async (id, eventType) => {
        const result = await MySwal.fire({
            title: "Bạn có chắc chắn?",
            text: `Bạn muốn xóa webhook với event type "${eventType}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Có, xóa nó!",
            cancelButtonText: "Hủy",
        });

        if (result.isConfirmed) {
            try {
                await axios.delete(`/api/webhooks/${id}`);
                toast.success("Xóa webhook thành công!");
                mutate(); // Làm mới danh sách
                MySwal.fire({
                    title: "Đã xóa!",
                    text: "Webhook đã được xóa thành công.",
                    icon: "success",
                    timer: 2000,
                    showConfirmButton: false,
                });
            } catch (error) {
                toast.error("Lỗi khi xóa webhook: " + error.message);
            }
        }
    };

    return (
        <div className="relative overflow-x-auto shadow-md sm:rounded-lg m-2">
            <table className="w-full text-sm text-left text-gray-700">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                <tr>
                    <th scope="col" className="px-6 py-3">URL</th>
                    <th scope="col" className="px-6 py-3">Event Type</th>
                    <th scope="col" className="px-6 py-3">
                        <span className="sr-only">Actions</span>
                    </th>
                </tr>
                </thead>
                <tbody>
                {isLoading ? (
                    <tr>
                        <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                            Loading...
                        </td>
                    </tr>
                ) : data?.data?.length > 0 ? (
                    data.data.map((webhook) => (
                        <tr
                            key={webhook.id}
                            className="bg-white border-b border-gray-200 hover:bg-gray-50"
                        >
                            <td className="px-6 py-4">
                                {editingWebhookId === webhook.id ? (
                                    <input
                                        type="text"
                                        value={editedUrl}
                                        onChange={(e) => setEditedUrl(e.target.value)}
                                        className="w-full p-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                                        autoFocus
                                    />
                                ) : (
                                    webhook.url || "Chưa thêm"
                                )}
                            </td>
                            <td className="px-6 py-4">
                                {webhook.eventType} {/* Không hiển thị input cho eventType */}
                            </td>
                            <td className="px-6 py-4 text-right">
                                {editingWebhookId === webhook.id ? (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleSaveWebhook(webhook)}
                                            className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100"
                                            title="Lưu"
                                        >
                                            <FaSave size={14} />
                                        </button>
                                        <button
                                            onClick={handleCancelEdit}
                                            className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100"
                                            title="Hủy"
                                        >
                                            <FaTimes size={14} />
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEditWebhook(webhook)}
                                            className="text-yellow-600 hover:text-yellow-800 p-1 rounded-full hover:bg-yellow-100"
                                            title="Sửa"
                                        >
                                            <FaEdit size={14} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteWebhook(webhook.id, webhook.eventType)}
                                            className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100"
                                            title="Xóa"
                                        >
                                            <FaTrash size={14} />
                                        </button>
                                    </div>
                                )}
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan="3" className="px-6 py-4 text-center text-gray-500">
                            Không có webhook nào để hiển thị
                        </td>
                    </tr>
                )}
                </tbody>
            </table>
        </div>
    );
};

export default WebhookTable;