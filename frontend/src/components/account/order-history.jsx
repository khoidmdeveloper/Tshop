"use client";
import { formatPrice, formatDate } from "@/lib/utils";
import { PaginationNav } from "@/components/common/pagination-nav";
import { Button } from "@/components/ui/button";
import { Eye, Loader2, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { listOrdersApi, cancelOrderApi } from "@/lib/api/order-api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const ORDERS_PER_PAGE = 10;

function normalizeStatus(value) {
  return String(value || "").trim().toLowerCase();
}

function getOrderStatusMeta(order) {
  const status = normalizeStatus(order.status || order.orderStatus);
  const paymentStatus = normalizeStatus(order.paymentStatus);
  const paymentMethod = normalizeStatus(order.paymentMethod);

  if (paymentMethod === "vnpay" && paymentStatus === "failed") {
    return {
      label: "Payment Failed",
      tone: "bg-destructive/20 text-destructive",
      isPending: false,
    };
  }

  if (paymentMethod === "vnpay" && status === "pending") {
    return {
      label: "Awaiting Payment",
      tone: "bg-amber-500/15 text-amber-600",
      isPending: true,
    };
  }

  switch (status) {
    case "confirmed":
      return {
        label: "Confirmed",
        tone: "bg-primary/20 text-primary",
        isPending: false,
      };
    case "cancelled":
      return {
        label: "Cancelled",
        tone: "bg-destructive/20 text-destructive",
        isPending: false,
      };
    case "shipped":
      return {
        label: "Shipped",
        tone: "bg-sky-500/15 text-sky-600",
        isPending: false,
      };
    case "delivered":
      return {
        label: "Delivered",
        tone: "bg-emerald-500/15 text-emerald-600",
        isPending: false,
      };
    default:
      return {
        label: status ? status.charAt(0).toUpperCase() + status.slice(1) : "Pending",
        tone: "bg-accent/20 text-accent",
        isPending: status === "pending",
      };
  }
}

export function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const fetchOrders = async (pageNum) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await listOrdersApi({ page: pageNum - 1, size: ORDERS_PER_PAGE });
      setOrders(result.items);
      setTotalPages(Math.max(1, result.totalPages));
      setTotalOrders(result.totalElements);
    } catch (err) {
      setError("Failed to load orders");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchOrders(currentPage);
  }, [currentPage]);

  const handleCancel = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      await cancelOrderApi(orderId);

      if (orders.length === 1 && currentPage > 1) {
        setCurrentPage((previousPage) => previousPage - 1);
        return;
      }

      void fetchOrders(currentPage);
    } catch (err) {
      alert("Failed to cancel order: " + (err?.message || ""));
    }
  };

  if (isLoading && orders.length === 0) {
    return <div className="flex justify-center items-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  if (error) {
    return <div className="text-center py-12 text-destructive">{error}</div>;
  }

  if (orders.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">You have no orders yet.</div>;
  }

  return <div className="bg-secondary border border-border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Order ID</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Date</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Total</th>
              <th className="px-6 py-4 text-left text-sm font-bold text-foreground">Status</th>
              <th className="px-6 py-4 text-right text-sm font-bold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => {
              const statusMeta = getOrderStatusMeta(order);

              return <tr key={order.id} className="border-b border-border hover:bg-background/50 transition-colors">
                <td className="px-6 py-4 text-sm text-foreground font-bold">{order.id}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{formatDate(new Date(order.createdAt || order.date))}</td>
                <td className="px-6 py-4 text-sm text-primary font-bold">{formatPrice(order.totalAmount || order.total)}</td>
                <td className="px-6 py-4 text-sm">
                  <span className={`px-3 py-1 rounded text-xs font-bold ${statusMeta.tone}`}>
                    {statusMeta.label}
                  </span>
                </td>
                <td className="px-6 py-4 text-right flex justify-end gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-border text-foreground hover:bg-primary/10 bg-transparent"
                    onClick={() => setSelectedOrder(order)}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  {statusMeta.isPending && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
                      onClick={() => handleCancel(order.id)}
                    >
                      <XCircle className="w-4 h-4" />
                    </Button>
                  )}
                </td>
              </tr>;
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-border bg-background px-6 py-4">
        <PaginationNav currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
      </div>

      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Order Details: {selectedOrder?.id}</DialogTitle>
          </DialogHeader>
          
          {selectedOrder && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Status</p>
                  <p className="font-bold text-foreground">{getOrderStatusMeta(selectedOrder).label}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Date</p>
                  <p className="font-bold text-foreground">
                    {formatDate(new Date(selectedOrder.createdAt || selectedOrder.date || Date.now()))}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Shipping Fee</p>
                  <p className="font-bold text-foreground">{formatPrice(selectedOrder.shippingFee || 0)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Amount</p>
                  <p className="font-bold text-primary">{formatPrice(selectedOrder.totalAmount || selectedOrder.total || 0)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-foreground mb-2">Shipping Details</h4>
                <div className="text-sm text-muted-foreground bg-background border border-border p-3 rounded-lg">
                  <p className="font-bold text-foreground mb-1">
                    {selectedOrder.receiverName || "Not provided"}
                  </p>
                  <p>{selectedOrder.receiverPhone}</p>
                  <p>{selectedOrder.shippingAddress}</p>
                </div>
              </div>

              {selectedOrder.items && selectedOrder.items.length > 0 && (
                <div>
                  <h4 className="font-bold text-foreground mb-2">Items</h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-background border border-border p-3 rounded-lg">
                        <div className="flexItems-center space-x-3">
                          <div className="w-12 h-12 rounded border border-border bg-secondary flex items-center justify-center shrink-0">
                            {item.productThumbnail ? (
                              <img 
                                src={item.productThumbnail} 
                                alt={item.productName} 
                                className="w-full h-full rounded object-cover" 
                              />
                            ) : (
                              <span className="text-xl">📦</span>
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground line-clamp-1">{item.productName || "Product"}</p>
                            <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-foreground">{formatPrice(item.unitPrice * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>;
}

