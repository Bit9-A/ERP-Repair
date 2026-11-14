import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../store/auth.store";
import { authService } from "../services/auth.service";
import { APP_SUBTITLE, APP_ECOSYSTEM } from "../../../lib/constants";
import { AnimatedMeshBg } from "../../../components/ui/AnimatedMeshBg";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Loader2,
  Wrench,
  ShoppingCart,
  BarChart3,
  Building2,
  Sparkles,
} from "lucide-react";

// ── Ecosistema ALLCODE ────────────────────────────────────────────────────────
const ECOSYSTEM = [
  {
    name: "ALL REPAIR",
    desc: "Gestión para talleres, órdenes técnicas y repuestos",
    icon: Wrench,
    color: "from-blue-500 to-indigo-600",
    active: true,
  },
  {
    name: "ALL MARKET",
    desc: "ERP para bodegas, supermercados y retail",
    icon: ShoppingCart,
    color: "from-emerald-500 to-emerald-700",
    active: false,
  },
  {
    name: "ALL ANALYTICS",
    desc: "Dashboard inteligente y analítica de negocio",
    icon: BarChart3,
    color: "from-purple-500 to-indigo-700",
    active: false,
  },
  {
    name: "SIGEPAT",
    desc: "Control de bienes y patrimonio institucional",
    icon: Building2,
    color: "from-cyan-500 to-blue-700",
    active: false,
  },
];

export function LoginPage() {
  const [nombre, setNombre] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);

  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const handleFillDemo = () => {
    setNombre("admin");
    setPassword("admin");
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !password.trim()) {
      setError("Por favor ingresa usuario y contraseña");
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }

    try {
      setLoading(true);
      setError("");
      setShake(false);

      const { user, token } = await authService.login({ nombre, password });
      login(user, token);
      navigate("/");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Credenciales incorrectas. Verifica usuario o correo y contraseña."
      );
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AnimatedMeshBg />

      <div className="min-h-screen w-full flex items-center justify-center p-4 sm:p-6 lg:p-12 relative z-10 font-sans selection:bg-blue-600 selection:text-white">
        <div className="w-full max-w-5xl flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          {/* ── Left Side: Branding & ALLCODE Ecosystem ── */}
          <div className="flex-1 text-center lg:text-left space-y-8 lg:max-w-lg">
            {/* Header / Logo */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700 flex items-center justify-center mx-auto lg:mx-0 mb-6 shadow-2xl shadow-blue-500/30 ring-4 ring-blue-500/20">
                <Wrench className="w-10 h-10 text-white" strokeWidth={2.5} />
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-xs font-bold uppercase tracking-wider mb-3">
                <ShieldCheck size={14} />
                <span>{APP_ECOSYSTEM}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight leading-tight font-heading">
                ALL <span className="text-blue-500">REPAIR</span>
              </h1>
              <p className="text-slate-400 text-sm sm:text-base mt-3 max-w-md mx-auto lg:mx-0 leading-relaxed font-normal">
                {APP_SUBTITLE}. Flujo de servicio para talleres, inspección de dispositivos, repuestos y control financiero.
              </p>
            </motion.div>

            {/* Ecosystem Cards */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.15 }}
              className="space-y-2.5"
            >
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Módulos del Ecosistema
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
                {ECOSYSTEM.map((app) => {
                  const Icon = app.icon;
                  return (
                    <div
                      key={app.name}
                      className={`flex items-center gap-3 p-3 rounded-2xl transition-all ${
                        app.active
                          ? "bg-slate-900/80 border border-blue-500/40 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/20"
                          : "bg-slate-950/40 border border-slate-800/60 opacity-60 hover:opacity-80"
                      }`}
                    >
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${app.color} flex items-center justify-center shrink-0 shadow-md text-white`}
                      >
                        <Icon size={20} strokeWidth={2.2} />
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-black text-white font-heading">
                            {app.name}
                          </p>
                          {app.active && (
                            <span className="text-[9px] font-extrabold text-blue-400 bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 rounded-full">
                              ACTIVO
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {app.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            {/* Cloud Status */}
            <div className="hidden lg:flex items-center gap-2 text-xs font-semibold text-slate-500">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Servidores Cloud Operativos • Latencia ~45ms</span>
            </div>
          </div>

          {/* ── Right Side: Signature Sigepat/Market Login Card ── */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-full max-w-md"
          >
            <motion.div
              animate={shake ? { x: [-10, 10, -10, 10, 0] } : {}}
              transition={{ duration: 0.4 }}
              className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800/90 rounded-[32px] p-7 sm:p-9 shadow-2xl shadow-black/70 relative overflow-hidden"
            >
              {/* Sigepat Watermark Icon in background */}
              <div className="absolute -top-6 -right-6 text-white opacity-[0.035] pointer-events-none select-none">
                <Wrench size={160} strokeWidth={1.5} />
              </div>

              {/* Ambient top border glow */}
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-blue-500/70 to-transparent" />

              {/* Header */}
              <div className="mb-6 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-black text-white font-heading tracking-tight">
                    Iniciar Sesión
                  </h2>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-bold">
                    <ShieldCheck size={12} />
                    <span>TLS 256-bit</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400 font-medium">
                  Accede al sistema con tus credenciales autorizadas
                </p>
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/25 flex items-center gap-3 text-red-400 text-xs font-semibold"
                >
                  <AlertCircle size={17} className="flex-shrink-0 text-red-400" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
                {/* Username / Email */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] block">
                    Usuario o Correo
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                      <User size={18} />
                    </div>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      placeholder="admin o admin@gmail.com"
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-slate-950/90 transition-all font-medium"
                      autoComplete="username"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[0.15em] block">
                      Contraseña
                    </label>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500 group-focus-within:text-blue-400 transition-colors">
                      <Lock size={18} />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={loading}
                      className="w-full pl-10 pr-11 py-3.5 bg-slate-950/70 border border-slate-800 rounded-2xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-slate-950/90 transition-all font-medium"
                      autoComplete="current-password"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-white transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? "Ocultar clave" : "Mostrar clave"}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Demo Helper Pill */}
                <button
                  type="button"
                  onClick={handleFillDemo}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-blue-500/5 hover:bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-1.5 font-semibold text-[11px]">
                    <Sparkles size={13} className="text-blue-400 group-hover:rotate-12 transition-transform" />
                    <span>Credenciales: <strong>admin</strong> / <strong>admin</strong></span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400/80 group-hover:text-blue-300">
                    Autocompletar →
                  </span>
                </button>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-500 hover:from-blue-500 hover:via-indigo-500 hover:to-blue-400 text-white font-extrabold text-sm tracking-wide shadow-xl shadow-blue-500/30 hover:shadow-blue-500/50 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      <span>Verificando acceso...</span>
                    </>
                  ) : (
                    <>
                      <span>Ingresar al Taller</span>
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="mt-7 pt-5 border-t border-slate-800/80 text-center space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  ALL REPAIR • ALLCODE PLATFORM
                </p>
                <p className="text-[11px] text-slate-500">
                  © {new Date().getFullYear()} ALLCODE. Todos los derechos reservados.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
