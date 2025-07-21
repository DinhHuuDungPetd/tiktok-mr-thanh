import {toast} from "react-toastify";
import authorizeAxiosInstance from "@/hooks/authorizeAxiosInstance";

export function login({email, password, callBackUrl}){
    console.log("Dữ liệu nhận vào login:", { email, password, callBackUrl });
    authorizeAxiosInstance.post("/login", {email,password})
        .then(response =>{
            const {accessToken, role, expiration} = response.data;

            const expires = new Date(expiration).toUTCString();
            document.cookie = `access-token=${accessToken}; path=/; SameSite=None; Secure; Expires=${expires}`;
            document.cookie = `role=${role}; path=/; SameSite=None; Secure; Expires=${expires}`;
            toast.success("Login thành công")
            window.location.href = callBackUrl;
        })
        .catch(error =>{
            let data = error?.message || "Login thất bại";
            toast.error(data);
        })
}

export function addEmployeeByOwner(employye){
    return authorizeAxiosInstance.post("/auth/user/create-employee", employye)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error)
            toast.error(error?.data?.error || "Thêm mới thất bại");
            return  Promise.reject(error);
        });
}

export function getEmployeeByOwner(){
    return authorizeAxiosInstance.get("/auth/user/get-employee-of-owner")
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error)
            toast.error(error?.data?.error || "Lỗi");
            return  Promise.reject(error);
        });
}

export function deleteEmployee(employeeId){
    return authorizeAxiosInstance.delete(`/auth/user/employees/${employeeId}`)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error)
            toast.error(error?.data?.error || "Lỗi");
            return Promise.reject(error);
        });
}
export function updateEmployee(employeeId, userUpdate){
    return authorizeAxiosInstance.put(`/auth/user/employees/${employeeId}`, userUpdate)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error)
            toast.error(error?.data?.error || "Lỗi");
            return Promise.reject(error);
        });
}
export function getAuth(){
    return authorizeAxiosInstance.get(`/auth/user/auth`)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error)
            toast.error(error?.data?.error || "Lỗi");
            return Promise.reject(error);
        });
}

export function getUserLogin(){
    return authorizeAxiosInstance.get(`/auth/user/get-user-login`)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error)
            toast.error(error?.data?.error || "Lỗi");
            return Promise.reject(error);
        });
}
export function updateUser(email, userUpdate){
    return authorizeAxiosInstance.put(`/auth/user/update-user/${email}`, userUpdate)
        .then(response => {
            return response.data;
        })
        .catch(error => {
            console.log(error)
            toast.error(error?.data?.error || "Lỗi");
            return Promise.reject(error);
        });
}