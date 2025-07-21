import useFetch from "@/hooks/useFetch";
import authorizeAxiosInstance from "@/hooks/authorizeAxiosInstance";
import {toast} from "react-toastify";

export function getListWebhooks(){
    const {data,isLoading, error, mutate} = useFetch("/auth/webhook/list");
    return {data, mutate, isLoading}
}
export function updateWebhook(url, eventType){
    return authorizeAxiosInstance.put("/auth/webhook/update", {url,eventType})
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error)
            toast.error(error?.data?.error || "Có lỗi xảy ra");
            return  Promise.reject(error);
        });
}

export function updateNotification(notification){
    return authorizeAxiosInstance.put("/auth/webhook/update-notification", notification)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error)
            toast.error(error?.data?.error || "Có lỗi xảy ra");
            return  Promise.reject(error);
        });
}
export function deleteTelegram(payload){
    console.log(payload)
    return authorizeAxiosInstance.put("/auth/webhook/delete-notification", payload)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error)
            toast.error(error?.data?.error || "Có lỗi xảy ra");
            return  Promise.reject(error);
        });
}