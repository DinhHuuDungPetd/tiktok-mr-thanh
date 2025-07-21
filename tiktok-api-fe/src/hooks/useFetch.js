import authorizeAxiosInstance from "@/hooks/authorizeAxiosInstance";
import useSWR from "swr";

const fetcher = (url) => authorizeAxiosInstance.get(url).then((res) => res);

const useFetch = (url) => {
    const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
        revalidateOnFocus: false, // Không tự động fetch lại khi focus vào tab
        revalidateIfStale: false, // Không fetch lại nếu cache chưa hết hạn
        revalidateOnReconnect: false, // Không fetch lại khi kết nối lại mạng
    });

    return { data, error, isLoading, mutate };
};

export default useFetch;