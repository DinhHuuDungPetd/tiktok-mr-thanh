import {useState} from "react";

export default function UpdateTeamForm({ category, onSubmit, onClose }) {
    const [teamName, setTeamName] = useState(category.name);
    const [noteUrl, setNoteUrl] = useState(category.noteUrl || "");
    const [folderId, setFolderId] = useState(category.folderId || "");

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(category.id, teamName, noteUrl, folderId);
    };

    return (
        <div className="p-4">
            <h2 className="text-lg font-semibold mb-4">Cập nhật tên team</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="teamName" className="block text-sm font-medium text-gray-700">
                        Tên team
                    </label>
                    <input
                        type="text"
                        id="teamName"
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập tên team"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="urlNote" className="block text-sm font-medium text-gray-700">
                        Note đơn <span className="text-red-500 text-xs">* (có thể bỏ trống nếu không cần)</span>
                    </label>
                    <input
                        type="text"
                        id="urlNote"
                        value={noteUrl}
                        onChange={(e) => setNoteUrl(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Url note đơn"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="urlNote" className="block text-sm font-medium text-gray-700">
                        Folder Id <span className="text-red-500 text-xs">* (có thể bỏ trống nếu không cần)</span>
                    </label>
                    <input
                        type="text"
                        id="urlNote"
                        value={folderId}
                        onChange={(e) => setFolderId(e.target.value)}
                        className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nhập folderId"
                    />
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