"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Package, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RecentOrdersProps {
  limit?: number;
  status?: string;
  showReviewButton?: boolean;
}

interface OrderProduct {
  id: string;
  title: string;
  quantity: number;
  priceAtPurchase: number;
  imageUrl: string | null;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  createdAt: string;
  products: OrderProduct[];
}

export function RecentOrders({ limit = 10, status, showReviewButton = false }: RecentOrdersProps): React.ReactElement {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecentOrders() {
      try {
        const params = new URLSearchParams();
        if (limit) params.append("limit", limit.toString());
        if (status) params.append("status", status);

        const response = await fetch(`/api/orders/recent?${params.toString()}`);
        
        if (!response.ok) {
          let errorMessage = "Failed to fetch orders";
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.details || errorMessage;
          } catch {
            errorMessage = `HTTP ${response.status}: ${response.statusText}`;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        setOrders(data.orders || []);
      } catch (err: any) {
        console.error("Error fetching recent orders:", err);
        const errorMessage = err.message || "Failed to load orders";
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecentOrders();
  }, [limit, status]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 font-medium mb-2">{error}</p>
        <p className="text-sm text-muted-foreground">
          Please check the browser console for more details.
        </p>
        <Button 
          onClick={() => {
            setError(null);
            setIsLoading(true);
            // Retry fetch
            fetch(`/api/orders/recent?limit=${limit}${status ? `&status=${status}` : ''}`)
              .then(res => res.json())
              .then(data => {
                setOrders(data.orders || []);
                setIsLoading(false);
              })
              .catch(err => {
                setError(err.message);
                setIsLoading(false);
              });
          }}
          className="mt-4"
          variant="outline"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-2">No recent orders</p>
          <Link href="/app">
            <Button>Start Shopping</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <Card key={order.id} className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <Link href={`/app/orders/${order.id}`}>
                  <h3 className="font-semibold text-lg hover:text-primary transition-colors mb-1">
                    Order {order.orderNumber}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg mb-2">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "MAD",
                  }).format(Number(order.total))}
                </div>
                <Badge
                  variant={
                    order.status === "delivered"
                      ? "default"
                      : order.status === "cancelled"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {order.status.toUpperCase()}
                </Badge>
              </div>
            </div>

            {/* Products */}
            <div className="space-y-3 border-t pt-4">
              {order.products.map((product) => (
                <div key={product.id} className="flex items-center gap-4">
                  <Link href={`/p/${product.id}`} className="flex-shrink-0">
                    <div className="relative w-16 h-16 overflow-hidden bg-muted">
                      {product.imageUrl ? (
                        <Image
                          src={product.imageUrl}
                          alt={product.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                          No image
                        </div>
                      )}
                    </div>
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/p/${product.id}`}>
                      <h4 className="font-medium hover:text-primary transition-colors line-clamp-2">
                        {product.title}
                      </h4>
                    </Link>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span>Qty: {product.quantity}</span>
                      <span>
                        {new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: "MAD",
                        }).format(Number(product.priceAtPurchase))}
                      </span>
                    </div>
                  </div>
                  {showReviewButton && order.status === "delivered" && (
                    <Link href={`/p/${product.id}#review`}>
                      <Button size="sm" variant="outline">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Review
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t">
              <Link href={`/app/orders/${order.id}`}>
                <Button variant="ghost" size="sm" className="w-full">
                  View Order Details
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

