import React from "react";
import { useParams } from 'react-router-dom';
import { getOrderDetail , changeOrderStatus} from "../../../api/controller/order_controller/order_controller";
import { useEffect, useState } from "react";

const OrderDetailsPage = () => {
  const statusLabels = [
    "Order Placed", "Order Validity Check", "Order Approved", "Packaging",
    "Package Complete", "Shipping Started", "Delivered", "Balance Added"
  ];
 const [orderDetail, setOrders] = useState({});
  const [loading, setLoading] = useState(true);  // To handle loading state
  const [error, setError] = useState(null);      // To handle error state
  const [selectedStatus, setSelectedStatus] = useState("");
  const [isChanging, setIsChanging] = useState(false);

  const { id } = useParams();
  
  useEffect(() => {
    const fetchOrdersDetail = async () => {
      try {
         // Get Order ID
        console.log("id is:", id);
        const response = await getOrderDetail(id);
        console.log("Data is:", response);
  
        if (response?.data) {
          setOrders(response.data?.data);
          setSelectedStatus(response.data?.data?.order_status);
        }
      } catch (error) {
        console.error("Error fetching orders:", error);
        setError("Error fetching orders");
      } finally {
        setLoading(false);
      }
    };
  
    fetchOrdersDetail();
  }, []);

  const handleStatusChange = async () => {
    try {
      setIsChanging(true);
      await changeOrderStatus({ order_id: id, order_status: selectedStatus });
      alert("Order status updated successfully");
    } catch (error) {
      console.error("Error changing status:", error);
      alert("Failed to update order status");
    } finally {
      setIsChanging(false);
    }
  };

  const { customer_name, customer_address, customer_phone, total_cart, order_status, cart_list, note, lastUpdated, statusNotes } = orderDetail;
  return (
    <div className="container mx-auto p-5 bg-gray-50">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Order Details</h1>

      <section className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Customer Information</h2>
        <p className="text-lg text-gray-700"><strong>Name:</strong> {customer_name}</p>
        <p className="text-lg text-gray-700"><strong>Address:</strong> {customer_address}</p>
        <p className="text-lg text-gray-700"><strong>Phone:</strong> {customer_phone}</p>
        <p className="text-lg text-gray-700"><strong>Total Cart added:</strong> {total_cart}</p>
        <p className="text-lg text-gray-700"><strong>Note:</strong> {note}</p>
      </section>

      <section className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Cart Details</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left table-auto">
            <thead className="bg-gray-100">
              <tr>
                <th className="py-2 px-4 border-b">Product Name</th>
                <th className="py-2 px-4 border-b">Quantity</th>
                <th className="py-2 px-4 border-b">Seller Total Price</th>
                <th className="py-2 px-4 border-b">Product Base Price</th>
                <th className="py-2 px-4 border-b">Profit</th>
              </tr>
            </thead>
            <tbody>
              {(cart_list || []).map((cartItem) => (
                <tr key={cartItem.id} className="border-b">
                  <td className="py-2 px-4">{cartItem.product?.product_name}</td>
                  <td className="py-2 px-4">{cartItem.quantity}</td>
                  <td className="py-2 px-4">${cartItem.seller_total_price}</td>
                  <td className="py-2 px-4">${cartItem.product_base_price_total}</td>
                  <td className="py-2 px-4">${cartItem.profit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Delivery Status</h2>
        <ul className="space-y-4">
          {statusLabels.map((step, index) => (
            <li
              key={index}
              className={`flex items-center ${order_status > index ? "text-green-600" : "text-gray-400"}`}
            >
              <span className={`mr-2 w-8 h-8 rounded-full flex justify-center items-center border-2 ${order_status > index ? "bg-green-600 text-white" : "bg-gray-200"}`}>
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
        <div className="mt-6">
          <select
            className="border p-2 rounded-md"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            {statusLabels.map((label, index) => (
              <option key={index} value={index}>{label}</option>
            ))}
          </select>
          <button
            className="ml-4 bg-blue-600 text-white px-4 py-2 rounded-md"
            onClick={handleStatusChange}
            disabled={isChanging}
          >
            {isChanging ? "Updating..." : "Change Status"}
          </button>
        </div>
        <div className="mt-6 text-gray-500">
          <span className="font-semibold">Last Updated: </span>
          <span>{lastUpdated}</span>
        </div>
      </section>
    </div>
  );
};

export default OrderDetailsPage;
