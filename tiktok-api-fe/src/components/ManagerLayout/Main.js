"use client";
import PerfectScrollbar from "react-perfect-scrollbar";
import { useRef, useEffect } from "react";
import {useResizeDetector} from "react-resize-detector";

export default function MainPage({ children }) {
    const { ref } = useResizeDetector();

    return (
        <PerfectScrollbar>
            <div ref={ref} className="admin-main">{children}</div>
        </PerfectScrollbar>
    );
}