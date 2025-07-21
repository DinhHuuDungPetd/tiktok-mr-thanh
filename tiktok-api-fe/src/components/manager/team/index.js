"use client";

import { useEffect, useState } from "react";
import TeamTable from "@/components/manager/team/TeamTable";
import { addCategory, getCategoryList } from "@/service/categoryService";
import { IoIosAddCircle } from "react-icons/io";
import Modal from "@/components/Modal";
import AddTeamForm from "@/components/manager/team/AddTeamForm";
import { toast } from "react-toastify";

export default function TeamManagerComponent() {
    const [categoryList, setCategoryList] = useState([]);
    const [filteredCategories, setFilteredCategories] = useState([]); // Danh sách đã lọc
    const [searchTerm, setSearchTerm] = useState(""); // Giá trị tìm kiếm
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setIsLoading(true)
        getCategoryList()
            .then((data) => {
                console.log(data);
                setCategoryList(data || []);
                setFilteredCategories(data || []);
            })
            .finally(() =>{
                setIsLoading(false)
            })
    }, []);

    const callData = () => {
        getCategoryList()
            .then((data) => {
                console.log(data);
                setCategoryList(data || []);
                setFilteredCategories(data || []); // Khởi tạo danh sách đã lọc
            })
    };

    // Lọc danh mục dựa trên searchTerm
    useEffect(() => {
        if (!searchTerm) {
            setFilteredCategories(categoryList); // Nếu không có từ khóa tìm kiếm, hiển thị toàn bộ danh sách
        } else {
            const filtered = categoryList.filter((category) =>
                category.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setFilteredCategories(filtered);
        }
    }, [searchTerm, categoryList]);

    const handleAddTeam =  (teamName, noteUrl, folderId) => {
        if (!teamName) {
            toast.error("Tên không được trống!");
            return;
        }
        addCategory({ categoryName: teamName, noteUrl, folderId })
            .then((data) => {
                console.log(data);
                callData();
                toast.success("Thành công!");
            })

        setIsAddModalOpen(false);
    };

    return (
        <div className="relative">
            <div className="header flex items-center justify-between bg-white p-4 shadow-md rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800">Team List</h2>
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
                            placeholder="Tìm kiếm theo tên danh mục..."
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
                <TeamTable
                    categoryList={filteredCategories} // Truyền danh sách đã lọc
                    callData={callData}
                    isLoading={isLoading}
                />
            </div>
            {/* Modal thêm mới */}
            {isAddModalOpen && (
                <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)}>
                    <AddTeamForm
                        onSubmit={handleAddTeam}
                        onClose={() => setIsAddModalOpen(false)}
                    />
                </Modal>
            )}
        </div>
    );
}