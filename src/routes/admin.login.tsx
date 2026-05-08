import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Store, Eye, EyeOff } from "lucide-react";
import { loginSchema, type LoginFormData } from "@/lib/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      remember: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      // In production, call server function:
      // await login({ data: { email: data.email, password: data.password } })
      await new Promise((r) => setTimeout(r, 1000)); // Simulate
      toast.success("Connexion réussie");
      navigate({ to: "/admin/dashboard" });
    } catch (err: any) {
      toast.error(err.message || "Erreur de connexion");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Toaster position="top-center" />
      <div className="relative flex min-h-screen items-center justify-center bg-[#0a0a0f] px-4">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-gold/5 blur-[120px]" />
          <div className="absolute -bottom-40 left-0 h-[400px] w-[400px] rounded-full bg-gold/3 blur-[100px]" />
        </div>

        <div className="relative w-full max-w-sm">
          {/* Logo + Title */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10">
              <Store className="h-8 w-8 text-gold" />
            </div>
            <h1 className="text-2xl font-bold text-foreground font-display">Decorak Alina</h1>
            <p className="mt-1 text-sm text-muted-foreground">Administration</p>
          </div>

          {/* Login Card */}
          <div className="rounded-2xl border border-white/5 bg-surface p-6 shadow-soft">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm text-muted-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email")}
                  placeholder="admin@decorak-alina.dz"
                  className="h-11 bg-surface-2 border-white/5 text-foreground placeholder:text-muted-foreground"
                />
                {errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm text-muted-foreground">
                  Mot de passe
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder="••••••••"
                    className="h-11 bg-surface-2 border-white/5 text-foreground placeholder:text-muted-foreground pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  {...register("remember")}
                  className="border-white/20 data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                />
                <Label htmlFor="remember" className="text-xs text-muted-foreground cursor-pointer">
                  Se souvenir de moi
                </Label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-gold text-gold-foreground hover:bg-gold/90 font-semibold"
              >
                {isLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Se connecter"}
              </Button>
            </form>
          </div>

          <p className="mt-6 text-center text-[11px] text-muted-foreground">
            &copy; {new Date().getFullYear()} Decorak Alina. Tous droits réservés.
          </p>
        </div>
      </div>
    </>
  );
}
