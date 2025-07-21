const Pagination = ({ totalPages, currentPage, handle }) => {
    // Tính toán các trang hiển thị
    const getPageNumbers = () => {
        const pages = [];
        const delta = 2;

        // `currentPage` bắt đầu từ 0, nhưng khi tính toán, ta cần hiển thị từ 1
        const startPage = Math.max(0, currentPage - delta); // Bắt đầu từ 0 (logic)
        const endPage = Math.min(totalPages - 1, currentPage + delta); // `totalPages - 1` vì trang cuối là totalPages - 1

        // Thêm nút "..." nếu cần
        if (startPage > 0) {
            pages.push(0); // Trang đầu tiên (logic: 0, hiển thị: 1)
            if (startPage > 1) pages.push("...");
        }

        // Thêm các số trang
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i);
        }

        // Thêm nút "..." và trang cuối nếu cần
        if (endPage < totalPages - 1) {
            if (endPage < totalPages - 2) pages.push("...");
            pages.push(totalPages - 1); // Trang cuối (logic: totalPages - 1, hiển thị: totalPages)
        }

        return pages;
    };

    const handlePageChange = (page) => {
        if (page === "..." || page === currentPage) return;
        handle(page); // Gọi hàm handle với giá trị page gốc (bắt đầu từ 0)
    };

    return (
        <div className="flex items-center justify-center gap-2 my-4">
            {/* Nút Previous */}
            <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 0} // Trang đầu tiên là 0
                className={`px-3 py-1 rounded-md ${
                    currentPage === 0
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-white text-blue-600 hover:bg-blue-50"
                } border border-gray-300 transition-colors`}
            >
                Previous
            </button>

            {/* Các số trang */}
            {getPageNumbers().map((page, index) => (
                <button
                    key={index}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-md border border-gray-300 transition-colors ${
                        page === currentPage
                            ? "bg-blue-600 text-white"
                            : page === "..."
                                ? "bg-white text-gray-600 cursor-default"
                                : "bg-white text-blue-600 hover:bg-blue-50"
                    }`}
                >
                    {page === "..." ? "..." : page + 1} {/* Hiển thị page + 1 */}
                </button>
            ))}

            {/* Nút Next */}
            <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages - 1} // Trang cuối là totalPages - 1
                className={`px-3 py-1 rounded-md ${
                    currentPage === totalPages - 1
                        ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-white text-blue-600 hover:bg-blue-50"
                } border border-gray-300 transition-colors`}
            >
                Next
            </button>
        </div>
    );
};

export default Pagination;