import axios from "axios";

let authorizeAxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_URL_ROOT,
    withCredentials: true, // đảm bảo gửi cookie cùng request
    timeout: 1000 * 60 * 10,
});

// Hàm lấy giá trị cookie
export function getCookieValue(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    return parts.length === 2 ? parts.pop().split(';').shift() : null;
}

// Interceptor Request: Thêm token vào header
authorizeAxiosInstance.interceptors.request.use(
    (config) => {
        const accessToken = getCookieValue("access-token");
        if (accessToken) {
            config.headers["access-token"] = accessToken;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor Response: Xử lý lỗi 401 và 403
authorizeAxiosInstance.interceptors.response.use(
    (response) => response.data,
    async (error) => {
        if (error.response) {
            const statusCode = error.response.status;

            switch (statusCode) {
                case 401: // Hết hạn phiên đăng nhập -> Đăng xuất và chuyển về trang login
                    document.cookie = "access-token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    window.location.href = "/login";
                    break;

                case 403: // Không có quyền truy cập -> Chuyển về trang 403
                    window.location.href = "/403";
                    break;

                default:

                    return Promise.reject({status: statusCode,...error.response.data}); // Trả lỗi về cho `then/catch` xử lý
            }
        } else if (error.request) {
            return Promise.reject(new Error("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."));
        } else {
            return Promise.reject(new Error("Đã xảy ra lỗi. Vui lòng thử lại sau."));
        }
    }
);

export default authorizeAxiosInstance;
