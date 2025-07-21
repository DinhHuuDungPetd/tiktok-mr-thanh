// components/manager/team/AddTeamForm.js
import {useState} from "react";

export default function AddTeamForm({ onSubmit, onClose }) {
    const [teamName, setTeamName] = useState("");
    const [noteUrl, setNoteUrl] = useState("");
    const [folderId, setFolderId] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (teamName.trim()) {
            onSubmit(teamName, noteUrl, folderId);
            setTeamName("");
            onClose();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Thêm Team Mới</h3>
            <div>
                <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">
                    Tên Team
                </label>
                <input
                    type="text"
                    id="teamName"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập tên team"
                    required
                />
                <label htmlFor="urlNote" className="block text-sm font-medium text-gray-700 pt-2">
                    Note đơn <span className="text-red-500 text-xs">* (có thể bỏ trống nếu không cần)</span>
                </label>
                <input
                    type="text"
                    id="urlNote"
                    value={noteUrl}
                    onChange={(e) => setNoteUrl(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập url note đơn"
                />
                <label htmlFor="urlNote" className="block text-sm font-medium text-gray-700 pt-2">
                    Folder id<span className="text-red-500 text-xs">* (có thể bỏ trống nếu không cần)</span>
                </label>
                <input
                    type="text"
                    id="folderId"
                    value={folderId}
                    onChange={(e) => setFolderId(e.target.value)}
                    className="mt-1 block w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Nhập folderId"
                />
            </div>
            <div className="flex justify-end space-x-2">
                <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Thêm
                </button>
            </div>
        </form>
    );
}