export default function ManagerPage() {
    return (
        <div className="p-8">
            <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">Trang Quản Lý</h1>

            <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Giới Thiệu</h2>
                <p className="text-gray-700 mb-4">
                    Trang quản lý là nơi bạn có thể quản lý tất cả các hoạt động và dữ liệu quan trọng của hệ thống. Tại đây, bạn có thể thực hiện các thao tác như thêm, sửa, xóa, và xem thông tin chi tiết về các đối tượng quản lý như người dùng, sản phẩm, đơn hàng, và nhiều hơn nữa.
                </p>
                <p className="text-gray-700 mb-4">
                    Với giao diện thân thiện và dễ sử dụng, trang quản lý giúp bạn tiết kiệm thời gian và nâng cao hiệu quả công việc. Bạn có thể dễ dàng tìm kiếm, lọc, và sắp xếp dữ liệu theo nhu cầu của mình.
                </p>
                <p className="text-gray-700 mb-4">
                    Hãy bắt đầu bằng cách chọn một mục từ menu bên trái để điều hướng đến các chức năng cụ thể. Nếu bạn cần hỗ trợ, vui lòng liên hệ với đội ngũ kỹ thuật của chúng tôi.
                </p>

                <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Các Tính Năng Chính</h2>
                <ul className="list-disc list-inside text-gray-700 mb-4">
                    <li className="mb-2">Quản lý nhân viên: Thêm, sửa, xóa, và xem thông tin chi tiết về nhân viên.</li>
                    <li className="mb-2">Quản lý shop: Quản lý danh sách các shop, bao gồm thông tin chi tiết và trạng thái hoạt động.</li>
                    <li className="mb-2">Quản lý thông báo: Tạo, gửi và theo dõi các thông báo quan trọng đến nhân viên và shop.</li>
                    <li className="mb-2">Chia nhóm: Phân chia nhân viên vào các nhóm làm việc để quản lý hiệu quả hơn.</li>
                </ul>

                <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Hướng Dẫn Sử Dụng</h2>
                <p className="text-gray-700 mb-4">
                    Để sử dụng trang quản lý một cách hiệu quả, bạn có thể tham khảo các hướng dẫn sau:
                </p>
                <ul className="list-decimal list-inside text-gray-700 mb-4">
                    <li className="mb-2">Đăng nhập vào hệ thống bằng tài khoản owner của bạn.</li>
                    <li className="mb-2">Chọn một mục từ menu bên trái để điều hướng đến chức năng tương ứng.</li>
                    <li className="mb-2">Thực hiện các thao tác quản lý như thêm, sửa, xóa, và xem thông tin.</li>
                    <li className="mb-2">Sử dụng các công cụ tìm kiếm và lọc để tìm kiếm dữ liệu nhanh chóng.</li>
                </ul>

                <h2 className="text-2xl font-semibold text-gray-800 mt-8 mb-4">Liên Hệ Hỗ Trợ</h2>
                <p className="text-gray-700 mb-4">
                    Nếu bạn gặp bất kỳ vấn đề nào hoặc cần hỗ trợ, vui lòng liên hệ với chúng tôi qua:
                </p>
                <ul className="list-disc list-inside text-gray-700 mb-4">
                    <li className="mb-2">Tele: @petdung</li>
                    <li className="mb-2">Số điện thoại: 0386117963</li>
                    <li className="mb-2">Địa chỉ: 123 Đường ABC, Quận XYZ, Thành phố HCM</li>
                </ul>
            </div>
        </div>
    );
}