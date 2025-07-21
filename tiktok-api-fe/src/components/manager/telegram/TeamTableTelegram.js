// pages/TeamTableTelegram.jsx
import { useState } from 'react';
import NotificationChannelForm from "@/components/manager/telegram/NotificationChannelForm";
import Modal from "@/components/Modal";

export default function TeamTableTelegram({ categoryList, callData, isLoading }) {
    const [selectedTeams, setSelectedTeams] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);

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

    const handleSelectTeam = (team) => {
        setSelectedTeams(prev =>
            prev.some(selected => selected.id === team.id)
                ? prev.filter(selected => selected.id !== team.id)
                : [...prev, team]
        );
    };

    const handleSelectAll = () => {
        if (selectedTeams.length === categoryList.length) {
            setSelectedTeams([]);
        } else {
            setSelectedTeams([...categoryList]);
        }
    };

    const openModal = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const handleAddNotification = (notificationData) => {
        console.log('Selected Teams:', selectedTeams);
        console.log('Notification Data:', notificationData);
        // Gọi API nếu cần
        // callData({ teams: selectedTeams, notifications: notificationData });
        closeModal();
    };

    return (
        <div className="relative pt-2">
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
                    ) :(
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                        <tr>
                            <th scope="col" className="px-6 py-3 w-16">
                                <input
                                    type="checkbox"
                                    checked={selectedTeams.length === categoryList.length && categoryList.length > 0}
                                    onChange={handleSelectAll}
                                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                />
                            </th>
                            <th scope="col" className="px-6 py-3">Tên Team</th>
                            <th scope="col" className="px-6 py-3">Số lượng Shop</th>
                            <th scope="col" className="px-6 py-3">Số lượng Người Quản</th>
                            <th scope="col" className="px-6 py-3">Action</th>
                        </tr>
                        </thead>
                        <tbody>
                        {categoryList.map((team) => (
                            <tr
                                key={team.id}
                                className="bg-white border-b border-gray-200 hover:bg-gray-50"
                            >
                                <td className="px-6 py-4 w-16">
                                    <input
                                        type="checkbox"
                                        checked={selectedTeams.some(selected => selected.id === team.id)}
                                        onChange={() => handleSelectTeam(team)}
                                        className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                    />
                                </td>
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
                                </td>
                                <td className="px-6 py-4 flex space-x-4">
                                    <button
                                        onClick={() => {
                                            setSelectedTeams([team]);
                                            openModal();
                                        }}
                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md transition-colors"
                                    >
                                        Add
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                )}
            </div>

            {isModalOpen && (
                <Modal
                    isOpen={isModalOpen}
                    onClose={closeModal}
                    size="2xl"
                >
                    <NotificationChannelForm
                        callData={callData}
                        selectedTeams={selectedTeams}
                        telegramList={selectedTeams[0]?.telegramList} // Giữ nguyên logic này vì selectedTeams giờ là array of team objects
                        onSubmit={handleAddNotification}
                        onClose={closeModal}
                    />
                </Modal>
            )}
        </div>
    );
}