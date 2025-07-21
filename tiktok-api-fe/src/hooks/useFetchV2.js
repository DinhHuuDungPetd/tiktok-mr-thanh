import useSWR from "swr";
import authorizeAxiosInstance from "@/hooks/authorizeAxiosInstance";

const fetcher = (url, params) =>
    authorizeAxiosInstance.get(url, { params }).then((res) => res);

const useFetchV2 = (url, params = {}, refreshInterval = 0) => {
    const { data, error, isLoading, mutate } = useSWR(
        url ? [url, params] : null,
        ([url, params]) => fetcher(url, params),
        {   refreshInterval,
            revalidateOnFocus: true,
            revalidateOnReconnect: true,
        }
    );

    return { data, error, isLoading, mutate };
};

export default useFetchV2;
