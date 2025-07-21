// context/UserContext.js
"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { getUserLogin } from "@/service/userService";
import Cookies from "js-cookie";

const UserContext = createContext();

export function UserProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const checkAuth = () => {
        const token = Cookies.get("access-token"); // Giả sử cookie tên là "token"
        return !!token; // Trả về true nếu có token
    };

    useEffect(() => {
        const authenticated = checkAuth();
        setIsAuthenticated(authenticated);
        if(authenticated){
            getUserLogin()
                .then(data =>{
                    setUser(data);
                })
                .finally(() =>{
                    setLoading(false);
                })
        }
    }, []);

    const updateUserData = (newUserData) => {
        setUser(prev => ({ ...prev, ...newUserData }));
    };

    return (
        <UserContext.Provider value={{ user, loading, updateUserData, isAuthenticated }}>
            {children}
        </UserContext.Provider>
    );
}

export const useUser = () => useContext(UserContext);