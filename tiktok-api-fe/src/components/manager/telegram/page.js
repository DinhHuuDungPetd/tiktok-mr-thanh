"use client"
import {useEffect, useState} from "react";
import {getCategoryList} from "@/service/categoryService";
import TeamTableTelegram from "@/components/manager/telegram/TeamTableTelegram";

export default function TelegramManagerComponent() {
    const [categoryList, setCategoryList] = useState([]);
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setIsLoading(true)
        getCategoryList()
            .then((data) => {
                setCategoryList(data || []);
            })
            .catch((e) => console.error("Error fetching categories:", e))
            .finally(() =>{
                setIsLoading(false)
            })
    }, []);

    const callData = () => {
        getCategoryList()
            .then((data) => {
                setCategoryList(data || []);
            })
            .catch((e) => console.error("Error fetching categories:", e))
    };

    return(
        <div>
            <div className="header flex items-center justify-between bg-white p-4 shadow-md rounded-lg">
                <h2 className="text-xl font-semibold text-gray-800">Team List</h2>
            </div>
            <TeamTableTelegram
                categoryList={categoryList}
                callData={callData}
                isLoading = {isLoading}
            />
        </div>
    )
}