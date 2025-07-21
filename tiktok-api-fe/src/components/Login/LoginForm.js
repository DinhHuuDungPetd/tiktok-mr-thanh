'use client';
import { useState } from 'react';
import Link from 'next/link';
import {login} from "@/service/userService";
import { useSearchParams } from 'next/navigation';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [hidePassword, setHidePassword] = useState(true);
    const [errors, setErrors] = useState({ email: '', password: '' });
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || "/view";

    const validateForm = () => {
        let newErrors = { email: '', password: '' };
        let isValid = true;

        // Kiểm tra email có đúng định dạng không
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            newErrors.email = 'Email không hợp lệ!';
            isValid = false;
        }

        // Kiểm tra mật khẩu có đủ 6 ký tự không
        if (password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự!';
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        console.log("Truoc", callbackUrl)
        e.preventDefault();
        if (validateForm()) {
            e.preventDefault();
            await login({email, password, callBackUrl: callbackUrl})
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100">
            <div className="w-full max-w-md bg-white p-8 shadow-lg rounded-lg">
                <h2 className="text-2xl font-bold text-center mb-6">Hi! chúc bạn nhiều đơn</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 pb-2">Email</label>
                        <input
                            type="email"
                            autoComplete="off"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                    </div>
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 pb-2">Password</label>
                        <input
                            type={hidePassword ? 'password' : 'text'}
                            autoComplete="new-password"
                            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <label className="flex items-center text-sm text-gray-600">
                            <input
                                type="checkbox"
                                className="mr-2"
                                checked={!hidePassword}
                                onChange={() => setHidePassword(!hidePassword)}
                            />
                            Hiển thị mật khẩu
                        </label>
                        <Link href="/forgot-password" className="text-sm text-blue-500 hover:underline">
                            Quên mật khẩu
                        </Link>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
                    >
                        Đăng nhập
                    </button>
                </form>
                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">Hoặc đăng nhập với</p>
                    <div className="mt-2 flex justify-center gap-4">
                        <button className="bg-red-500 text-white px-4 py-2 rounded-lg">Google</button>
                        <button className="bg-blue-700 text-white px-4 py-2 rounded-lg">Facebook</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
