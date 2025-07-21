import { FaStore } from "react-icons/fa";
import {useRouter} from "next/navigation";
import {getListShop} from "@/service/shopService";

export default function DrShopList({type ="ORDER", shopId}) {
    const router = useRouter();
    const { data } = getListShop();

    const handleType = (shop) =>{
        window.localStorage.setItem("current-shop", shop.note)
        if(type === "ORDER"){
            router.push(`/view/orders/${shop.id}`)
        }else if(type === "REFUND"){
            router.push(`/view/refund-return/${shop.id}`)
        }
        else if(type === "FINANCE"){
            router.push(`/view/finance/${shop.id}`)
        }
    }

    return (
        <div className="w-full max-w-md mx-auto p-4">
            {data?.data.map((shop) => (
                <div
                    key={shop.id}
                    onClick={() => handleType(shop)}
                    className={`flex items-center gap-3 p-3 cursor-pointer rounded-lg transition 
                        ${Number(shopId) === shop.id ? "bg-green-200" : "hover:bg-gray-100"}`}
                >
                    <FaStore className="text-green-600 text-xl" />
                    <div>
                        <p className="font-semibold">{shop.name}</p>
                        <p className="text-sm text-gray-500">{shop.note}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}
