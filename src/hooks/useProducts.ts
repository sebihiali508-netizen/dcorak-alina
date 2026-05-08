import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getProducts,
  getProduct,
  getActiveProducts,
  createProduct,
  createFullProduct,
  updateProduct,
  deleteProduct,
  generateSlug,
  generateSkuFn,
} from "@/lib/api/products";

export function useProducts(_params?: any) {
  return useQuery({
    queryKey: ["products", _params],
    queryFn: () => getProducts(),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ["product", id],
    queryFn: () => getProduct({ data: id } as any),
    enabled: !!id,
  });
}

export function useActiveProducts() {
  return useQuery({
    queryKey: ["products", "active"],
    queryFn: () => getActiveProducts(),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => createProduct({ data } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useCreateFullProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => createFullProduct({ data } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useGenerateSlug() {
  return useMutation({
    mutationFn: (name: string) => generateSlug({ data: name } as any),
  });
}

export function useGenerateSku() {
  return useMutation({
    mutationFn: (data: { category: string }) => generateSkuFn({ data } as any),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      updateProduct({ data: { id, ...data } } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteProduct({ data: id } as any),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useBulkDeleteProducts() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => {
      const { bulkDeleteProducts } = await import("@/lib/api/products");
      return bulkDeleteProducts({ data: ids } as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useBulkUpdateProductStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      ids,
      status,
    }: {
      ids: string[];
      status: "active" | "draft" | "archived";
    }) => {
      const { bulkUpdateProductStatus } = await import("@/lib/api/products");
      return bulkUpdateProductStatus({ data: { ids, status } } as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
