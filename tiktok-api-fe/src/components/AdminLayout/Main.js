"use client"
import PerfectScrollbar from "react-perfect-scrollbar";

export default function MainPage ({children}){
    return(
        <PerfectScrollbar>
            <div className="admin-main">
                {children} {/* Hiển thị nội dung route con */}
            </div>
        </PerfectScrollbar>
    )
}