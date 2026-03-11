import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../queryKeys";
import * as usersService from "../users.service";
import type { CreateUserPayload, UpdateUserPayload } from "../users.service";

// ============================================
// React Query hooks — Users
// ============================================

export function useMe() {
  return useQuery({
    queryKey: queryKeys.users.me,
    queryFn: usersService.getMe,
  });
}

export function useUsers() {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: usersService.getAll,
  });
}

export function useUser(id: string) {
  return useQuery({
    queryKey: queryKeys.users.detail(id),
    queryFn: () => usersService.getById(id),
    enabled: !!id,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersService.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: UpdateUserPayload & { id: string }) =>
      usersService.update(id, payload),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: queryKeys.users.all });
      qc.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.id),
      });
    },
  });
}

export function useResetPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      usersService.resetPassword(id, newPassword),
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({
        queryKey: queryKeys.users.detail(variables.id),
      });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
}
