"use client";

import { useState, useEffect, useCallback } from "react";
import { FaEdit, FaTrash, FaSave, FaTimes, FaPlus, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { addTag, deleteTag, updateTag } from "@/service/tagService";
import { getCookieValue } from "@/hooks/authorizeAxiosInstance";
import {getCategoryList} from "@/service/categoryService";

const MySwal = withReactContent(Swal);


export default function TagList({ mutate, tagList, callData = () => null }) {
    const [role, setRole] = useState("EMPLOYEE");
    const [tags, setTags] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [newTagName, setNewTagName] = useState("");
    const [categoryList, setCategoryList] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [isCategoryOpen, setIsCategoryOpen] = useState(false);
    const [editingTagId, setEditingTagId] = useState(null);
    const [editedTagName, setEditedTagName] = useState("");
    const [originalTags, setOriginalTags] = useState([]); // Lưu danh sách gốc

    // Cập nhật tags từ tagList khi tagList thay đổi
    useEffect(() => {
        setRole(getCookieValue("role"));
        const initialTags = tagList?.data || [];
        setTags(initialTags);
        setOriginalTags(initialTags); // Lưu danh sách gốc
    }, [tagList]);

    useEffect(() => {
       getCategoryList()
           .then(data =>{
               setCategoryList(data);
           })
    }, []);


    // Hàm debounce để trì hoãn tìm kiếm
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => func(...args), delay);
        };
    };

    // Hàm tìm kiếm
    const handleSearch = useCallback(() => {
        if (searchTerm) {
            const filteredTags = originalTags.filter((tag) =>
                tag.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
            setTags(filteredTags);
        } else {
            setTags(originalTags); // Khôi phục danh sách gốc
        }
    }, [searchTerm, originalTags]);

    // Sử dụng useEffect để đồng bộ tìm kiếm với searchTerm
    useEffect(() => {
        const debouncedSearch = debounce(handleSearch, 300);
        debouncedSearch();
    }, [searchTerm, handleSearch]); // Gọi lại khi searchTerm hoặc handleSearch thay đổi

    const handleCreateTag = () => {
        if (!newTagName.trim()) {
            toast.error("Tên tag không được để trống!");
            return;
        }
        const payload = {
            name: newTagName,
            categoryId: role === "OWNER" ? selectedCategories : null,
        };
        addTag(payload)
            .then((data) => {
                toast.success("Đã tạo tag!");
                setNewTagName("");
                setSelectedCategories([]);
                setIsCategoryOpen(false);
                mutate();
            })
            .catch((error) => toast.error("Lỗi khi tạo tag: " + error.message));
    };

    const handleCategoryToggle = (categoryId) => {
        setSelectedCategories((prev) =>
            prev.includes(categoryId)
                ? prev.filter((id) => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const handleEditTag = (tag) => {
        setEditingTagId(tag.id);
        setEditedTagName(tag.name);
    };

    const handleSaveTag = async (tagId) => {
        updateTag(tagId, editedTagName)
            .then(() => {
                toast.success("Đã cập nhật tag!");
                setEditingTagId(null);
                mutate();
                callData();
            });
    };

    const handleCancelEdit = () => {
        setEditingTagId(null);
        setEditedTagName("");
    };

    const handleDeleteTag = async (tagId, tagName) => {
        const result = await MySwal.fire({
            title: "Bạn có chắc chắn?",
            text: `Bạn muốn xóa tag "${tagName}"?`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Có, xóa nó!",
            cancelButtonText: "Hủy",
        });

        if (result.isConfirmed) {
            deleteTag(tagId)
                .then(() => {
                    callData();
                    mutate();
                    MySwal.fire({
                        title: "Đã xóa!",
                        text: "Tag đã được xóa thành công.",
                        icon: "success",
                        timer: 2000,
                        showConfirmButton: false,
                    });
                })
                .catch((error) => toast.error("Lỗi khi xóa tag: " + error.message));
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Ô tìm kiếm */}
            <div className="mb-4">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} // Chỉ cập nhật searchTerm
                    placeholder="Tìm kiếm tag..."
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm shadow-sm"
                />
            </div>

            {/* Input tạo tag và nút tạo */}
            <div className="mb-4 flex items-center justify-center space-x-2">
                <input
                    type="text"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    placeholder="Nhập tên tag..."
                    className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm shadow-sm"
                />
                <button
                    onClick={handleCreateTag}
                    className="flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg px-3 py-2 transition-colors duration-200 shadow-md"
                >
                    <FaPlus size={14} />
                </button>
            </div>

            {/* Nút "Thêm Category" và danh sách checkbox (chỉ cho OWNER) */}
            {role === "OWNER" && (
                <div className="mb-4">
                    <button
                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                        className="w-full flex items-center justify-between p-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200 shadow-sm"
                    >
                        <span>Thêm Category</span>
                        {isCategoryOpen ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
                    </button>
                    <div
                        className={`mt-2 overflow-hidden transition-all duration-300 ease-in-out ${
                            isCategoryOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                        }`}
                    >
                        <div className="border border-gray-200 rounded-lg p-3 bg-white shadow-sm max-h-32 overflow-y-auto">
                            {categoryList.map((category) => (
                            <div key={category.id} className="flex items-center space-x-2 py-1">
                                <input
                                    type="checkbox"
                                    id={`category-${category.id}`}
                                    checked={selectedCategories.includes(category.id)}
                                    onChange={() => handleCategoryToggle(category.id)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                />
                                <label
                                    htmlFor={`category-${category.id}`}
                                    className="text-sm text-gray-700 hover:text-gray-900"
                                >
                                    {category.name}
                                </label>
                            </div>
                        ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Danh sách tag */}
            <div className="overflow-y-auto flex-1">
                {tags.length > 0 ? (
                    tags.map((tag) => (
                        <div
                            key={tag.id}
                            className="flex items-center justify-between p-2 mb-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200 shadow-sm"
                        >
                            {editingTagId === tag.id ? (
                                <div className="flex items-center space-x-2 w-full">
                                    <input
                                        type="text"
                                        value={editedTagName}
                                        onChange={(e) => setEditedTagName(e.target.value)}
                                        className="flex-1 p-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-sm shadow-sm"
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => handleSaveTag(tag.id)}
                                        className="text-green-600 hover:text-green-800 p-1 rounded-full hover:bg-green-100 transition-colors"
                                        title="Lưu"
                                    >
                                        <FaSave size={16} />
                                    </button>
                                    <button
                                        onClick={handleCancelEdit}
                                        className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition-colors"
                                        title="Hủy"
                                    >
                                        <FaTimes size={16} />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <span
                                        className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full truncate max-w-[180px] shadow-sm"
                                        title={tag.name}
                                    >
                                        {tag.name}
                                    </span>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => handleEditTag(tag)}
                                            className="text-yellow-600 hover:text-yellow-800 p-1 rounded-full hover:bg-yellow-100 transition-colors"
                                            title="Sửa"
                                        >
                                            <FaEdit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTag(tag.id, tag.name)}
                                            className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 transition-colors"
                                            title="Xóa"
                                        >
                                            <FaTrash size={16} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 text-center">Không có tag nào để hiển thị</p>
                )}
            </div>
        </div>
    );
}