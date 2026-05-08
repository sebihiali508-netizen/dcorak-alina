import { useQuery } from "@tanstack/react-query";
import { getCustomers } from "@/lib/api/customers";

export function useCustomers(_params?: any) {
  return useQuery({
    queryKey: ["customers", _params],
    queryFn: () => getCustomers(),
  });
}
