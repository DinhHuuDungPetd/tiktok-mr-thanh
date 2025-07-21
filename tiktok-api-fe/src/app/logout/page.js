"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function Logout() {
    const router = useRouter();

    useEffect(() => {
        // Xóa token trong cookie
        Cookies.remove("access-token");
        Cookies.remove("role");
        Cookies.remove("fullName");
        Cookies.remove("email");

        // Chuyển hướng về trang login
        router.replace("/login");
    }, []);

    return <p>Đang đăng xuất...</p>;
}
