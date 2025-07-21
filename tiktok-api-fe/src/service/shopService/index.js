import useFetch from "@/hooks/useFetch";
import authorizeAxiosInstance from "@/hooks/authorizeAxiosInstance";
import {toast} from "react-toastify";


export function getListShop(){
    const {data,isLoading, mutate} = useFetch("/auth/shop/list-shop");
    return {data, mutate, isLoading}
}

export async function getOrderByShopId(condition) {
    return authorizeAxiosInstance.post("/auth/shop/list-orders", condition)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error)
            toast.error("Có lỗi xảy ra");
            return  Promise.reject(error);
        });
}

export async function getShippingService(shippingService){
    return authorizeAxiosInstance.post("/auth/order/get-shipping-service", shippingService)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error)
            toast.error(error?.data?.error || "Thêm mới thất bại");
            return  Promise.reject(error);
        });
}
export async function createLabel(shippingService){
    return authorizeAxiosInstance.post("/auth/order/create-label", shippingService)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error)
            toast.error(error?.data?.error || "Thêm mới thất bại");
            return  Promise.reject(error);
        });
}

export async function getLabelByShopId(shopId, packageId){
    return authorizeAxiosInstance.get(`/auth/order/get-label?package_id=${packageId}&shop_id=${shopId}`)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error)
            toast.error(error?.data?.error || "Thêm mới thất bại");
            return  Promise.reject(error);
        });
}

export async function getShippingProviders (shopId,deliveryOptionId ){
    return authorizeAxiosInstance.get(`/auth/order/get-shipping-providers?delivery_option_id=${deliveryOptionId}&shop_id=${shopId}`)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error)
            toast.error(error?.data?.error || "Thêm mới thất bại");
            return  Promise.reject(error);
        });
}
export async function addTracking (tracking ){
    return authorizeAxiosInstance.post("/auth/order/add-tracking", tracking)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error)
            toast.error(error?.data?.error || "Thêm mới thất bại");
            return  Promise.reject(error);
        });
}

export async function getRefundList(condition){
    return authorizeAxiosInstance.post("/auth/shop/list-refund", condition)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error)
            toast.error(error?.data?.error || "Thêm mới thất bại");
            return  Promise.reject(error);
        });
}
export function addTagInShop(shopId, tagId){
    return authorizeAxiosInstance.put(`/auth/shop/add-tag/${shopId}`, {tagId})
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error)
            toast.error(error?.data?.error || "Thêm mới thất bại");
            return  Promise.reject(error);
        });
}

export function updateShopName(shopId, shopName){
    return authorizeAxiosInstance.put(`/auth/shop/update-name/${shopId}`, {shopName})
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error)
            toast.error(error?.data?.error || "Thêm mới thất bại");
            return  Promise.reject(error);
        });
}
export function addShop(payload){
    return authorizeAxiosInstance.post(`/add-shop`, payload)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error)
            toast.error(error?.data?.error || "Thêm mới thất bại");
            return  Promise.reject(error);
        });
}

