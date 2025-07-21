import { useState, useEffect, useRef } from 'react';
import { FaEdit, FaTrash } from 'react-icons/fa'; // Thêm FaTrash
import { toast } from "react-toastify";
import {deleteTelegram, updateNotification} from "@/service/webhookService";

export default function NotificationChannelForm({ selectedTeams, telegramList, callData }) {
    const [notificationData, setNotificationData] = useState(() => {
        const initialData = {
            channel1: { chatId: '', tokenId: '', eventType: 'ORDER_STATUS_CHANGE' },
            channel2: { chatId: '', tokenId: '', eventType: 'RETURN_STATUS_CHANGE' },
            channel3: { chatId: '', tokenId: '', eventType: 'PRODUCT_STATUS_CHANGE' },
            channel4: { chatId: '', tokenId: '', eventType: 'CANCELLATION_STATUS_CHANGE' },
        };
        if (telegramList && telegramList.length > 0) {
            telegramList.forEach((item, index) => {
                const channelKey = `channel${index + 1}`;
                if (initialData[channelKey]) {
                    initialData[channelKey] = {
                        chatId: item.chatId || '',
                        tokenId: item.token || '',
                        eventType: item.eventType || initialData[channelKey].eventType,
                    };
                }
            });
        }

        return initialData;
    });

    const mapName = {
        'ORDER_STATUS_CHANGE': "Đơn hàng mới",
        'RETURN_STATUS_CHANGE': "Trả hàng", // Có thể sửa lại nếu cần
        'CANCELLATION_STATUS_CHANGE': "Hủy đơn hàng",
        'PRODUCT_STATUS_CHANGE': "Sản phẩm hỏng"
    };

    const [editingChannel, setEditingChannel] = useState(null);
    const [originalData, setOriginalData] = useState(null);
    const formRef = useRef(null);

    const handleInputChange = (channel, field, value) => {
        setNotificationData(prev => ({
            ...prev,
            [channel]: {
                ...prev[channel],
                [field]: value
            }
        }));
    };

    const handleEdit = (channel) => {
        setOriginalData({ ...notificationData[channel] });
        setEditingChannel(channel);
    };

    const handleSave = (channel) => {
        if (!notificationData[channel].chatId) {
            toast.error("Không được để trống chat id");
            return;
        }
        if (!notificationData[channel].tokenId) {
            toast.error("Không được để trống token id");
            return;
        }
        const newChat = { ...notificationData[channel], categoryId: selectedTeams[0].id };
        updateNotification(newChat)
            .then(() => {
                callData();
                toast.success("Thành công!");
                setEditingChannel(null);
                setOriginalData(null);
            })
            .catch((e) => toast.error("Lỗi khi cập nhật: " + e.message));
    };

    const handleCancel = (channel) => {
        if (originalData && editingChannel) {
            setNotificationData(prev => ({
                ...prev,
                [channel]: { ...originalData }
            }));
        }
        setEditingChannel(null);
        setOriginalData(null);
    };

    // Xử lý xóa kênh thông báo
    const handleDelete = (channel) => {
        const confirmDelete = window.confirm("Bạn có chắc chắn muốn xóa kênh thông báo này?");
        if (!confirmDelete) return;

        // Đặt chatId và tokenId về rỗng
        const payload = {
            eventType: notificationData[channel].eventType.trim(),
            categoryId: selectedTeams[0].id.trim()
        };
        // Gọi API để cập nhật
        deleteTelegram(payload)
            .then(() => {
                const updatedData = {
                    ...notificationData[channel],
                    chatId: '',
                    tokenId: '',
                };
                setNotificationData(prev => ({
                    ...prev,
                    [channel]: updatedData
                }));
                callData();
                toast.success("Xóa kênh thông báo thành công!");
            })
            .catch((e) => {
                setNotificationData(prev => ({
                    ...prev,
                    [channel]: notificationData[channel]
                }));
            });
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (formRef.current && !formRef.current.contains(event.target)) {
                handleCancel(editingChannel);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [editingChannel, originalData]);

    return (
        <div className="flex flex-col h-full">
            <div className="bg-white z-10 p-2 border-b">
                <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">Kênh Thông Báo</h3>
                </div>
            </div>

            <div className="flex-1 p-6 overflow-y-auto" ref={formRef}>
                <div className="space-y-6">
                    {['channel1', 'channel2', 'channel3', 'channel4'].map((channel, index) => (
                        <div key={channel} className="pb-1">
                            <h4 className="font-medium mb-2">{mapName[notificationData[channel].eventType]}</h4>
                            <div className="space-y-4">
                                {/* Chat ID */}
                                <div className="flex items-center">
                                    <label className="block text-sm text-gray-600 mr-2 w-20">Chat ID:</label>
                                    {editingChannel === channel ? (
                                        <div className="flex-1 flex items-center space-x-2">
                                            <input
                                                type="text"
                                                value={notificationData[channel].chatId}
                                                onChange={(e) => handleInputChange(channel, 'chatId', e.target.value)}
                                                placeholder="Enter Chat ID"
                                                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                            <button
                                                onClick={() => handleSave(channel)}
                                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md"
                                            >
                                                Lưu
                                            </button>
                                            <button
                                                onClick={() => handleCancel(channel)}
                                                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-3 py-1 rounded-md"
                                            >
                                                Hủy
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex items-center space-x-2">
                                            <span className="text-gray-700">
                                                {notificationData[channel].chatId || 'Chưa thiết lập'}
                                            </span>
                                            <button
                                                onClick={() => handleEdit(channel)}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                <FaEdit />
                                            </button>
                                            {/* Nút xóa */}
                                            {(notificationData[channel].chatId || notificationData[channel].tokenId) && (
                                                <button
                                                    onClick={() => handleDelete(channel)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <FaTrash />
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Token ID */}
                                <div className="flex items-center">
                                    <label className="block text-sm text-gray-600 mr-2 w-20">Token ID:</label>
                                    {editingChannel === channel ? (
                                        <div className="flex-1 flex items-center space-x-2">
                                            <input
                                                type="text"
                                                value={notificationData[channel].tokenId}
                                                onChange={(e) => handleInputChange(channel, 'tokenId', e.target.value)}
                                                placeholder="Enter Token ID"
                                                className="flex-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    ) : (
                                        <div className="flex-1 flex items-center space-x-2">
                                            <span className="text-gray-700">
                                                {notificationData[channel].tokenId || 'Chưa thiết lập'}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}