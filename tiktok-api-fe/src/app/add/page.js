"use client"
import TikTokTokenForm from "@/app/add/index";
import { Suspense } from 'react'
import MainPage from "@/components/AdminLayout/Main";

export default function AddPage() {
    return (
        <Suspense>
            <MainPage>
                <TikTokTokenForm/>
            </MainPage>
        </Suspense>
    );
}
