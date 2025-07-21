"use client";

import { useState, useEffect, useRef } from "react";
import { addTagInShop, getListShop } from "@/service/shopService";
import { useRouter } from "next/navigation";
import { FaEye, FaSave, FaTag, FaTimes } from "react-icons/fa";
import Drawer from "@/components/Drawer";
import TagList from "@/components/TagList";
import { getListTag } from "@/service/tagService";
import { toast } from "react-toastify";
import { useDebounce } from "use-debounce"; // Thêm use-debounce

const ShopTable = ({ type }) => {
    const router = useRouter();
    const { data, isLoading, mutate } = getListShop();
    const { data: dataTag, mutate: mutateTag } = getListTag();
    const [search, setSearch] = useState("");
    const [debouncedSearch] = useDebounce(search, 300); // Debounce search với 300ms
    const [editingShopId, setEditingShopId] = useState(null);
    const [selectedTag, setSelectedTag] = useState("");
    const [filteredShops, setFilteredShops] = useState([]);
    const selectRef = useRef(null);
    const [loadingBtn, setloadingBtn] = useState(false)

    // Xử lý click ra ngoài để hủy
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (selectRef.current && !selectRef.current.contains(event.target)) {
                setEditingShopId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    // Hàm tìm kiếm
    useEffect(() => {
        if (!data?.data) return;

        if (!debouncedSearch) {
            setFilteredShops(data.data);
        } else {
            const filtered = data.data.filter((shop) => {
                const searchLower = debouncedSearch.toLowerCase();
                return (
                    (shop.name && shop.name.toLowerCase().includes(searchLower)) ||
                    (shop.note && shop.note.toLowerCase().includes(searchLower)) ||
                    (shop.tagName && shop.tagName.toLowerCase().includes(searchLower)) ||
                    (shop.categoryNames && shop.categoryNames.some(category =>
                            category.toLowerCase().includes(searchLower)
                        )
                    ));
            }); 
            setFilteredShops(filtered);
        }
    }, [debouncedSearch, data]); // Sử dụng debouncedSearch thay vì search

    const handleType = (shop) => {
        setloadingBtn(true)
        window.localStorage.setItem("current-shop", shop.note);
        if (type === "ORDER") {
            router.push(`/view/orders/${shop.id}`);
        } else if (type === "REFUND") {
            router.push(`/view/refund-return/${shop.id}`);
        }
        else if (type === "FINANCE") {
            router.push(`/view/finance/${shop.id}`);
        }
    };

    const handleTagClick = (shop) => {
        setEditingShopId(shop.id);
        setSelectedTag(shop.tag || "");
    };

    const handleSaveTag = async (shopId) => {
        console.log(selectedTag);
        addTagInShop(shopId, selectedTag ? selectedTag : 0).then(() => {
            toast.success("Chỉnh sửa thành công!");
            mutate();
            handleCancelEdit();
        });
    };

    const handleCancelEdit = () => {
        setEditingShopId(null);
    };

    return (
        <>
            <div className="header flex items-center justify-between bg-white p-4 shadow-md rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800">Shop list</h2>
                <div className="relative w-1/3 ml-2">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm kiếm theo team, note, tag.."
                        className="w-full px-4 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            <div className="m-2 flex" style={{ alignItems: "center" }}>
                <Drawer
                    icon={<FaTag className="text-lg" />}
                    btnIcon={<FaTag className="text-lg" />}
                    textButton="Tag"
                    title="Quản lý tag"
                    children={<TagList callData={mutate} tagList={dataTag} mutate={mutateTag} />}
                />
            </div>
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-700">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3">Stt</th>
                        <th scope="col" className="px-6 py-3">Shop name</th>
                        <th scope="col" className="px-6 py-3">Note</th>
                        <th scope="col" className="px-6 py-3">Tag</th>
                        <th scope="col" className="px-6 py-3">Team</th>
                        <th scope="col" className="px-6 py-3">
                            <span className="sr-only">Edit</span>
                        </th>
                    </tr>
                    </thead>
                    <tbody>
                    {isLoading ? (
                        <tr>
                            <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                Loading...
                            </td>
                        </tr>
                    ) : filteredShops.length > 0 ? (
                        filteredShops.map((shop, index) => (
                            <tr
                                key={shop.id}
                                className="bg-white border-b border-gray-200 hover:bg-gray-50"
                            >
                                <td className="px-6 py-4">{index+1}</td>
                                <th
                                    scope="row"
                                    className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap"
                                >
                                    {shop.name}
                                </th>
                                <td className="px-6 py-4">{shop.note}</td>
                                <td style={{ width: "200px" }} className="px-6 py-4">
                                    {editingShopId === shop.id ? (
                                        <div className="flex items-center space-x-2" ref={selectRef}>
                                            <select
                                                style={{ width: "100px" }}
                                                value={selectedTag}
                                                onChange={(e) => setSelectedTag(e.target.value)}
                                                className="p-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                                            >
                                                <option value="0">Không có tag</option>
                                                {dataTag?.data.map((tag) => (
                                                    <option key={tag.id} value={tag.id}>
                                                        {tag.name}
                                                    </option>
                                                ))}
                                            </select>
                                            <button
                                                onClick={() => handleSaveTag(shop.id)}
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
                                        <span
                                            onClick={() => handleTagClick(shop)}
                                            className="cursor-pointer hover:underline"
                                        >
                                                {shop.tagName ? shop.tagName : "Chưa có"}
                                            </span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    {shop.categoryNames.length > 0
                                        ? shop.categoryNames.join(",")
                                        : "Chưa có"}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleType(shop)}
                                        className="text-white bg-green-600 hover:bg-green-700 rounded px-3 py-1 text-xs flex items-center justify-center"
                                    >
                                        {loadingBtn ? "Đang tải..." : (
                                            <>
                                                <FaEye className="mr-1 text-lg" />
                                                Xem shop
                                            </>
                                        )}
                                    </button>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                                Không tìm thấy shop nào
                            </td>
                        </tr>
                    )}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default ShopTable;