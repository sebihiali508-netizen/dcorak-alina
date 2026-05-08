import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getOrders,
  getOrder,
  createOrder,
  getPendingOrdersCount,
  updateOrderStatus,
  updatePaymentStatus,
  updateOrderNotes,
} from "@/lib/api/orders";

export function useOrders(_params?: any) {
  return useQuery({
    queryKey: ["orders", _params],
    queryFn: () => getOrders(),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrder({ data: { id } } as any),
    enabled: !!id,
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: any) => createOrder({ data: input } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function usePendingOrdersCount() {
  return useQuery({
    queryKey: ["pending-orders-count"],
    queryFn: () => getPendingOrdersCount(),
    refetchInterval: 30_000,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateOrderStatus({ data: { id, status } } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useUpdatePaymentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payment_status }: { id: string; payment_status: string }) =>
      updatePaymentStatus({ data: { id, payment_status } } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}

export function useUpdateOrderNotes() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      updateOrderNotes({ data: { id, notes } } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });
}
