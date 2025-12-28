"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface UpdateOrderStatusButtonProps {
  orderId: string;
  currentStatus: string;
}

export function UpdateOrderStatusButton({ orderId, currentStatus }: UpdateOrderStatusButtonProps): React.ReactElement {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleUpdateStatus(newStatus: string) {
    if (!confirm(`Are you sure you want to mark this order as ${newStatus}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        alert(data.error || "Failed to update order status");
        return;
      }

      router.refresh();
    } catch (error) {
      alert("Failed to update order status");
    } finally {
      setIsLoading(false);
    }
  }

  const getNextStatus = () => {
    switch (currentStatus) {
      case "pending":
        return "paid";
      case "paid":
        return "confirmed";
      case "confirmed":
        return "shipped";
      case "shipped":
        return "delivered";
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus();

  if (!nextStatus || currentStatus === "delivered" || currentStatus === "cancelled") {
    return (
      <Button variant="outline" disabled>
        {currentStatus === "delivered" ? "Delivered" : currentStatus === "cancelled" ? "Cancelled" : "No action"}
      </Button>
    );
  }

  const statusLabels: Record<string, string> = {
    paid: "Mark as Paid",
    confirmed: "Confirm Shipment",
    shipped: "Mark as Shipped",
    delivered: "Mark as Delivered",
  };

  return (
    <Button
      onClick={() => handleUpdateStatus(nextStatus)}
      disabled={isLoading}
    >
      {isLoading ? "Updating..." : statusLabels[nextStatus] || "Update Status"}
    </Button>
  );
}

