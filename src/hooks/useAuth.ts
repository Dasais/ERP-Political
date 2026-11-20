import { useCallback, useEffect, useMemo } from "react";
import { useNavigate } from "react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { LOGIN_PATH } from "@/const";

type UseAuthOptions = {
  redirectOnUnauthenticated?: boolean;
  redirectPath?: string;
};

export type AuthUser = { name: string; role: "admin" | "user" };

export function useAuth(options?: UseAuthOptions) {
  const { redirectOnUnauthenticated = false, redirectPath = LOGIN_PATH } = options ?? {};
  const navigate = useNavigate();
  const qc = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: ["session"],
    staleTime: Infinity,
    queryFn: async () => {
      const { data } = await supabase.auth.getSession();
      return data.session;
    },
  });

  // Держим сессию в актуальном состоянии (вход, выход, автообновление токена)
  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      qc.setQueryData(["session"], session);
      setTimeout(() => qc.invalidateQueries({ queryKey: ["is-admin"] }), 0);
    });
    return () => data.subscription.unsubscribe();
  }, [qc]);

  const userId = sessionQuery.data?.user.id;

  const adminQuery = useQuery({
    queryKey: ["is-admin", userId],
    enabled: !!userId,
    retry: false,
    queryFn: async () => {
      const { data, error } = await supabase.rpc("is_admin");
      if (error) throw new Error(error.message);
      return data === true;
    },
  });

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    qc.setQueryData(["session"], null);
    qc.removeQueries({ queryKey: ["is-admin"] });
    navigate(redirectPath);
  }, [qc, navigate, redirectPath]);

  const isLoading = sessionQuery.isLoading || (!!userId && adminQuery.isLoading);
  const user: AuthUser | null = userId
    ? { name: "Администратор", role: adminQuery.data ? "admin" : "user" }
    : null;

  useEffect(() => {
    if (redirectOnUnauthenticated && !isLoading && !user) {
      if (window.location.pathname.replace(/\/$/, "").endsWith(redirectPath)) return;
      navigate(redirectPath);
    }
  }, [redirectOnUnauthenticated, isLoading, user, navigate, redirectPath]);

  return useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isLoading,
      error: sessionQuery.error ?? adminQuery.error ?? null,
      logout,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId, adminQuery.data, isLoading, sessionQuery.error, adminQuery.error, logout],
  );
}
