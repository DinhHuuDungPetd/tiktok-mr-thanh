import { useState, useEffect } from "react";
import {createLabel, getShippingService} from "@/service/shopService";
import OrderLineItems from "@/components/view/Order/id/OrderLineItems";
import {toast} from "react-toastify";

export default function CreateLabel({ shopId, orderId, lineItem, change, close}) {
    const [dimension, setDimension] = useState({ height: "", length: "", width: "", unit: "INCH" });
    const [weight, setWeight] = useState({ unit: "POUND", value: "" });
    const [shippingServices, setShippingServices] = useState([]);
    const [selectedService, setSelectedService] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState({}); // State để lưu lỗi
    const [isOpen, setIsOpen] = useState(false);

    // Hàm kiểm tra giá trị hợp lệ
    const validateValue = (name, value) => {
        const numValue = parseFloat(value);
        if (value === "" || isNaN(numValue)) return `${name} is required`;
        if (numValue <= 0) return `${name} must be greater than 0`;
        return "";
    };

    // Hàm gọi API khởi tạo
    const fetchInitialData = async () => {
        if (!shopId || !orderId) return;
        setIsLoading(true);
        try {
            const { data } = await getShippingService({ orderId, shopId });
            console.log("Initial data:", JSON.stringify(data));

            if (data.dimension) setDimension({ ...data.dimension });
            if (data.weight) setWeight({ ...data.weight });
            if (data.shippingServices?.length) {
                setShippingServices(data.shippingServices);
                setSelectedService(data.shippingServices[0].id);
            }
            setErrors({}); // Reset lỗi khi tải dữ liệu mới
        } catch (error) {
            console.error("Error fetching initial data:", error);
        } finally {
            setIsLoading(false);
        }
    };

    // Hàm gọi API khi thay đổi dimension/weight
    const updateShippingServices = async () => {
        if (!shopId || !orderId) return;

        // Kiểm tra validation trước khi gọi API
        const newErrors = {};
        ["height", "length", "width"].forEach(field => {
            const error = validateValue(field, dimension[field]);
            if (error) newErrors[field] = error;
        });
        const weightError = validateValue("Weight", weight.value);
        if (weightError) newErrors.value = weightError;

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return; // Không gọi API nếu có lỗi

        setIsLoading(true);
        try {
            const { data } = await getShippingService({
                orderId,
                shopId,
                dimension: {
                    height: dimension.height,
                    length: dimension.length,
                    width: dimension.width,
                    unit: dimension.unit
                },
                weight: {
                    unit: weight.unit,
                    value: weight.value
                }
            });
            console.log("Updated shipping data:", JSON.stringify(data));

            if (data.shippingServices?.length) {
                setShippingServices(data.shippingServices);
                setSelectedService(data.shippingServices[0].id);
            }
        } catch (error) {
            console.error("Error updating shipping services:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, [shopId, orderId]);

    const handleChange = (setState, stateKey) => (e) => {
        const { name, value } = e.target;
        setState(prev => ({ ...prev, [name]: value }));
        // Xóa lỗi của field khi người dùng bắt đầu nhập lại
        setErrors(prev => ({ ...prev, [name]: "" }));
    };

    const handleBlur = (name) => () => {
        const value = name === "value" ? weight[name] : dimension[name];
        const error = validateValue(name === "value" ? "Weight" : name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
        if (!error) updateShippingServices();
    };

    const handleServiceChange = (e) => setSelectedService(e.target.value);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};
        ["height", "length", "width"].forEach(field => {
            const error = validateValue(field, dimension[field]);
            if (error) newErrors[field] = error;
        });
        const weightError = validateValue("Weight", weight.value);
        if (weightError) newErrors.value = weightError;

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        const payload = {
            shopId,
            orderId,
            dimension: {
                height: parseFloat(dimension.height) || 0,
                length: parseFloat(dimension.length) || 0,
                width: parseFloat(dimension.width) || 0,
                unit: dimension.unit
            },
            weight: {
                value: parseFloat(weight.value) || 0,
                unit: weight.unit
            },
            shippingServiceId: selectedService
        };
        (async () => {
            try {
                setIsLoading(true)
                const data = await createLabel(payload);
                toast.success("Tạo label thành công, sẽ đồng bộ sau 4s");
                setIsLoading(false)
                setTimeout(() => {
                    change();
                }, 2000); // Chờ 2 giây mới gọi change()
                close(false);
                console.log(data);
            } catch (error) {
                setIsLoading(false)
                console.error("Lỗi khi tạo label:", error);
            }
        })();
    };

    const inputStyles = "w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent";
    const labelStyles = "block text-xs font-medium text-gray-600 mb-1";
    const sectionStyles = "border border-gray-200 p-4 rounded bg-white shadow-sm mb-4";
    const errorStyles = "text-xs text-red-500 mt-1";
    const selectedServicePrice = shippingServices.find(s => s.id === selectedService)?.price || "";

    return (
        <div className="relative max-w-xl mx-auto text-sm">
            <h3 className="text-base font-semibold text-gray-800 mb-3">Order Id:  {orderId}</h3>
            <div onClick={() => setIsOpen(true)} className="flex flex-wrap gap-2 p-2 transition-colors duration-300 hover:bg-gray-300 rounded-md">
                {lineItem.map(item => (
                    <div key={item.id} className="relative">
                        <img
                            src={item.skuImage}
                            alt="Product image"
                            height="40"
                            width="40"
                            className="rounded-md"
                        />
                    </div>
                ))}
            </div>
            <OrderLineItems setIsOpen={setIsOpen} isOpen={isOpen} lineItems={lineItem}/>
            <form onSubmit={handleSubmit} className="relative">
                {/* Dimension Section */}
                <div className={sectionStyles}>
                    <h3 className="text-base font-semibold text-gray-800 mb-3">📏 Dimensions</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { label: "Height", name: "height", value: dimension.height },
                            { label: "Length", name: "length", value: dimension.length },
                            { label: "Width", name: "width", value: dimension.width },
                            {
                                label: "Unit",
                                name: "unit",
                                value: dimension.unit,
                                isSelect: true,
                                options: [
                                    { value: "INCH", label: "In" },
                                    { value: "CM", label: "Cm" }
                                ]
                            }
                        ].map((field) => (
                            <div key={field.name}>
                                <label className={labelStyles}>{field.label}</label>
                                {field.isSelect ? (
                                    <select
                                        name={field.name}
                                        value={field.value}
                                        onChange={handleChange(setDimension, "dimension")}
                                        onBlur={handleBlur(field.name)}
                                        className={inputStyles}
                                        disabled={isLoading}
                                    >
                                        {field.options.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                ) : (
                                    <input
                                        type="number"
                                        name={field.name}
                                        value={field.value}
                                        onChange={handleChange(setDimension, "dimension")}
                                        onBlur={handleBlur(field.name)}
                                        className={`${inputStyles} ${errors[field.name] ? "border-red-500" : ""}`}
                                        min="0"
                                        step="0.01"
                                        onKeyDown={(e) => ["ArrowUp", "ArrowDown"].includes(e.key) && e.preventDefault()}
                                        onWheel={(e) => e.target.blur()}
                                        disabled={isLoading}
                                    />
                                )}
                                {errors[field.name] && <p className={errorStyles}>{errors[field.name]}</p>}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Weight Section */}
                <div className={sectionStyles}>
                    <h3 className="text-base font-semibold text-gray-800 mb-3">⚖️ Weight</h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className={labelStyles}>Weight</label>
                            <input
                                type="number"
                                name="value"
                                value={weight.value}
                                onChange={handleChange(setWeight, "weight")}
                                onBlur={handleBlur("value")}
                                className={`${inputStyles} ${errors.value ? "border-red-500" : ""}`}
                                min="0"
                                step="0.01"
                                onKeyDown={(e) => ["ArrowUp", "ArrowDown"].includes(e.key) && e.preventDefault()}
                                onWheel={(e) => e.target.blur()}
                                disabled={isLoading}
                            />
                            {errors.value && <p className={errorStyles}>{errors.value}</p>}
                        </div>
                        <div>
                            <label className={labelStyles}>Unit</label>
                            <select
                                name="unit"
                                value={weight.unit}
                                onChange={handleChange(setWeight, "weight")}
                                onBlur={handleBlur("unit")}
                                className={inputStyles}
                                disabled={isLoading}
                            >
                                <option value="GRAM">g</option>
                                <option value="POUND">lb</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Shipping Services Section */}
                <div className={sectionStyles}>
                    <h3 className="text-base font-semibold text-gray-800 mb-3">🚚 Shipping</h3>
                    <div>
                        <label className={labelStyles}>Service</label>
                        <select
                            value={selectedService}
                            onChange={handleServiceChange}
                            className={inputStyles}
                            disabled={isLoading || !shippingServices.length}
                        >
                            {shippingServices.length ? (
                                shippingServices.map(s => (
                                    <option key={s.id} value={s.id}>{s.name} - {s.price}</option>
                                ))
                            ) : (
                                <option value="">No services</option>
                            )}
                        </select>
                    </div>
                </div>

                {/* Shipping Price Display */}
                <div className="text-right text-sm text-gray-700 mb-4">
                    Shipping Cost: <span className="font-semibold">{selectedServicePrice || "N/A"}</span>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    className="w-full bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium py-2 px-3 rounded transition-colors duration-150 disabled:bg-gray-400 disabled:cursor-not-allowed"
                    disabled={isLoading}
                >
                    Create Label
                </button>
            </form>

            {/* Loading Effect */}
            {isLoading && (
                <div className="absolute inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center rounded">
                    <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}
        </div>
    );
}