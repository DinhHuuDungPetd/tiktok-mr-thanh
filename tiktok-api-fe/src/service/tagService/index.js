import useFetch from "@/hooks/useFetch";
import authorizeAxiosInstance from "@/hooks/authorizeAxiosInstance";
import {toast} from "react-toastify";


export function getListTag(){
    const {data,isLoading, error, mutate} = useFetch("/auth/tag");
    return {data, mutate, isLoading}
}

export function addTag(tag) {
    return authorizeAxiosInstance.post("/auth/tag", tag)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error)
            toast.error(error?.data?.error || "Có lỗi xảy ra");
            return  Promise.reject(error);
        });
}

export function deleteTag(tagId) {
    return authorizeAxiosInstance.delete(`/auth/tag/${tagId}`)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error)
            toast.error(error?.data?.error || "Có lỗi xảy ra");
            return  Promise.reject(error);
        });
}

export function updateTag(tagId, tagName) {
    return authorizeAxiosInstance.put(`/auth/tag/${tagId}`, {tagName})
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error)
            toast.error(error?.data?.error || "Có lỗi xảy ra");
            return  Promise.reject(error);
        });
}