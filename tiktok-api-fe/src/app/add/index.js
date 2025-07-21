'use client'
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from 'next/navigation';
import authorizeAxiosInstance from "@/hooks/authorizeAxiosInstance";
import {getCategoryByToken} from "@/service/categoryService";
import {addShop} from "@/service/shopService";
const TikTokTokenForm = () => {
    const searchParams = useSearchParams();
    const code = searchParams.get("code");

    const [formData, setFormData] = useState({
        authCode: code || "",
        note: "",
        token: "",
        categoryId: "0", // Thêm categoryId vào formData
    });

    const [responseData, setResponseData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [categories, setCategories] = useState([]);
    const [categoryLoading, setCategoryLoading] = useState(false);

    const debounceTimeout = useRef(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Gọi API lấy danh sách category khi ownerId thay đổi với debounce
    useEffect(() => {
        if (!formData.token) {
            setCategories([]);
            setFormData((prev) => ({ ...prev, categoryId: "0" })); // Reset categoryId nếu không có ownerId
            return;
        }

        setCategoryLoading(true);
        clearTimeout(debounceTimeout.current);

        debounceTimeout.current = setTimeout(async () => {

            getCategoryByToken(formData.token)
                .then(data =>{
                    console.log(data);
                    setCategories(data);
                    setFormData((prev) => ({
                        ...prev,
                        categoryId: data[0]?.id || "0",
                    }));
                    setCategoryLoading(false);
                })
                .catch(e =>{
                    setCategories([]);
                    setCategoryLoading(false);
                })
        }, 500); // Debounce 500ms
    }, [formData.token]);

    const handleCategoryChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            categoryId: e.target.value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setResponseData(null);
        if(!formData.categoryId) formData.categoryId =0;
        console.log(formData)
        addShop(formData)
            .then(data =>{
                setResponseData(data);
            })
            .catch(error =>{
                setError(error.data?.error || "Đã có lỗi xảy ra");
            })
        setLoading(false);
    };

    return (
        <div style={{height:"100vh"}}>
            <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-md mt-10">
                <h2 className="text-2xl font-bold mb-6 text-center">Lấy TikTok Token</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="ownerId" className="block text-gray-700 font-medium mb-1">
                            Token:
                        </label>
                        <input
                            type="text"
                            id="token"
                            name="token"
                            value={formData.token}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                        />
                    </div>

                    <div>
                        <label htmlFor="auth_code" className="block text-gray-700 font-medium mb-1">
                            Auth Code:
                        </label>
                        <input
                            type="text"
                            id="auth_code"
                            name="authCode"
                            value={formData.authCode}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                        />
                    </div>

                    <div>
                        <label htmlFor="note" className="block text-gray-700 font-medium mb-1">
                            Note:
                        </label>
                        <input
                            type="text"
                            id="note"
                            name="note"
                            value={formData.note}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                        />
                    </div>

                    <div>
                        <label htmlFor="categoryId" className="block text-gray-700 font-medium mb-1">
                            Category:
                        </label>
                        <select
                            id="categoryId"
                            name="categoryId"
                            value={formData.categoryId}
                            onChange={handleCategoryChange}
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring focus:border-blue-300"
                            disabled={categoryLoading || categories.length === 0}
                        >
                            {categoryLoading ? (
                                <option>Đang tải danh mục...</option>
                            ) : categories.length > 0 ? (
                                categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                        {category.name}
                                    </option>
                                ))
                            ) : (
                                <option value="">Không có danh mục</option>
                            )}
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition-colors"
                    >
                        {loading ? "Đang gửi..." : "Gửi Yêu Cầu"}
                    </button>
                </form>

                {error && (
                    <div className="mt-4 p-4 bg-red-100 text-red-600 rounded-md">
                        <p>Lỗi: {JSON.stringify(error)}</p>
                    </div>
                )}

                {responseData && (
                    <div className="mt-4 p-4 bg-green-100 text-green-700 rounded-md">
                        <h3 className="font-bold mb-2">Kết Quả:</h3>
                        <pre className="overflow-x-auto">
                        {JSON.stringify(responseData, null, 2)}
                    </pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TikTokTokenForm;
