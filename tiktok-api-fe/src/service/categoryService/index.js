import authorizeAxiosInstance from "@/hooks/authorizeAxiosInstance";
import {toast} from "react-toastify";

export async function getCategoryList(){
    return await authorizeAxiosInstance.get("/auth/category/get-list-category")
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error)
            toast.error(error?.data?.error || "Thêm mới thất bại");
            return  Promise.reject(error);
        });
}
export async function addCategory(payload){

    return await authorizeAxiosInstance.post("/auth/category", payload)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error)
            toast.error(error?.data?.error || "Thêm mới thất bại");
            return  Promise.reject(error);
        });
}

export async function deleteCategory(id){
    return await authorizeAxiosInstance.delete(`/auth/category?category_id=${id}`)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error)
            toast.error(error?.data?.error || "Thêm mới thất bại");
            return  Promise.reject(error);
        });
}
export async function updateCategoryName(id, payload){
    return await authorizeAxiosInstance.put(`/auth/category/${id}/name`, payload)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error)
            toast.error(error?.data?.error || "Thêm mới thất bại");
            return  Promise.reject(error);
        });
}
export function updateEmpolyeeCategory(categoryId, empolyeeIds){
    return authorizeAxiosInstance.put(`/auth/category/update-employee-categories/${categoryId}/employees`, empolyeeIds)
            .then(response => {
                return response.data;
            })
            .catch(error => {
                console.log(error)
                toast.error(error?.data?.error || "Thêm mới thất bại");
                return  Promise.reject(error);
            });
}

export function updateShopIntoCategory(categoryId, shopIds){
    return authorizeAxiosInstance.put(`/auth/category/categories/${categoryId}/shops`, shopIds)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error)
            toast.error(error?.data?.error || "Thêm mới thất bại");
            return  Promise.reject(error);
        });
}

export function getCategoryByToken(token){
    return authorizeAxiosInstance.get(`get-category-by-token?token=${token}`)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error)
            toast.error(error?.data?.error || "Thêm mới thất bại");
            return  Promise.reject(error);
        });
}

export function changeStatusAutoGetLable(categoryId, status){
    return authorizeAxiosInstance.put(`/auth/category/categories/${categoryId}/change-auto-get-label?status=${status}`)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error)
            toast.error(error?.data?.error || "Chỉnh sửa thất bại");
            return  Promise.reject(error);
        });
}