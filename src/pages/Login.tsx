import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { trpc } from "@/providers/trpc";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const utils = trpc.useUtils();
  const { isAuthenticated, isLoading } = useAuth();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Уже вошли — сразу в панель
  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate("/admin", { replace: true });
  }, [isLoading, isAuthenticated, navigate]);

  const login = trpc.auth.login.useMutation({
    onSuccess: async () => {
      await utils.auth.me.invalidate();
      navigate("/admin", { replace: true });
    },
    onError: (err) => setError(err.message || "Не удалось войти. Попробуйте ещё раз."),
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password) {
      setError("Введите пароль.");
      return;
    }
    login.mutate({ password });
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center bg-ink-950 px-4 py-10 text-paper">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <img src="/assets/logo.png" alt="Эмблема партии ERP" className="mx-auto h-16 w-auto object-contain" />
          <h1 className="mt-5 font-display text-3xl font-bold text-gold-300">Вход в панель</h1>
          <p className="mt-2 text-sm text-paper-dim">Доступ только для Высшего Совета</p>
        </div>

        <form onSubmit={submit} className="gold-frame bg-ink-900 p-6 sm:p-7">
          <label htmlFor="login-password" className="mb-2 block text-sm font-semibold text-paper/90">
            Пароль
          </label>
          <input
            id="login-password"
            type="password"
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="min-h-[48px] w-full border border-gold-500/20 bg-ink-950 px-4 text-[15px] text-paper transition-colors focus:border-gold-400 focus:outline-none"
          />
          {error && (
            <p className="mt-3 text-sm text-red-400" role="alert">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={login.isPending}
            className="btn-gold mt-5 min-h-[48px] w-full text-sm disabled:opacity-60"
          >
            {login.isPending ? "Проверка…" : "Войти"}
          </button>
        </form>

        <p className="mt-6 text-center">
          <Link to="/" className="text-sm text-paper-dim transition-colors hover:text-gold-300">
            ← На главную
          </Link>
        </p>
      </div>
    </div>
  );
}
