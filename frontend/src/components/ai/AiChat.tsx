// =============================================================================
// AI CHAT — Floating Chat Component (TechLand & ALLMARKET Design System)
// =============================================================================

import { useState, useRef, useEffect, useCallback } from 'react';
import { api } from '../../lib/api';
import { useAuthStore } from '../../features/auth/store/auth.store';
import { notifications } from '@mantine/notifications';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    sql?: string | null;
    rows?: any[] | null;
    exportData?: any[] | null;
    timestamp: Date;
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────
const IconBot = ({ className = 'w-5 h-5' }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 8V4H8" /><rect width="16" height="12" x="4" y="8" rx="2" /><path d="M2 14h2" /><path d="M20 14h2" /><path d="M15 13v2" /><path d="M9 13v2" />
    </svg>
);

const IconSend = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);

const IconClose = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const IconFile = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" /><polyline points="14 2 14 8 20 8" />
    </svg>
);

const IconTrash = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
);

const IconDownload = ({ className = 'w-3 h-3' }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" />
    </svg>
);

// ─── Quick Questions para Taller de Reparaciones ─────────────────────────────
const QUICK_QUESTIONS = [
    { icon: '🔧', text: '¿Cuántos equipos están en reparación?' },
    { icon: '💰', text: '¿Cuánto se vendió y facturó hoy?' },
    { icon: '📦', text: '¿Qué repuestos tienen stock crítico?' },
    { icon: '👨‍🔧', text: '¿Cuáles técnicos tienen más tickets activos?' },
    { icon: '📊', text: 'Resumen financiero de la semana' },
];

// ─── Main Component ──────────────────────────────────────────────────────────
export function AiChat() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { token } = useAuthStore();

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
    }, [isOpen]);

    const loadSession = useCallback(async () => {
        try {
            const res = await api.get('/ai-chat/session');
            const data = res.data?.data;
            if (Array.isArray(data) && data.length > 0) {
                setMessages(data.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
            }
        } catch { /* silent */ }
    }, []);

    useEffect(() => {
        if (isOpen && token && messages.length === 0) loadSession();
    }, [isOpen, token, loadSession, messages.length]);

    const clearSession = async () => {
        try {
            await api.delete('/ai-chat/session');
            setMessages([]);
            notifications.show({
                title: 'Historial borrado',
                message: 'La conversación fue reiniciada',
                color: 'teal',
            });
        } catch {
            notifications.show({
                title: 'Error',
                message: 'No se pudo limpiar la sesión',
                color: 'red',
            });
        }
    };

    const handleSend = async (questionText?: string) => {
        const text = (questionText || input).trim();
        if (!text || loading) return;

        const userMsg: Message = { role: 'user', content: text, timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const res = await api.post('/ai-chat', { question: text });
            const data = res.data?.data;
            const assistantMsg: Message = {
                role: 'assistant',
                content: data?.answer || 'Sin respuesta.',
                rows: data?.rows,
                exportData: data?.exportData,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, assistantMsg]);
        } catch (err: any) {
            const errMsg = err?.response?.data?.error || 'Error al comunicarse con el asistente.';
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `⚠️ ${errMsg}`,
                timestamp: new Date(),
            }]);
        } finally {
            setLoading(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        const userMsg: Message = {
            role: 'user',
            content: `📎 Subió archivo: ${file.name}`,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMsg]);

        try {
            const res = await api.post('/ai-chat/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const data = res.data?.data;
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data?.answer || 'Archivo analizado.',
                rows: data?.rows,
                timestamp: new Date(),
            }]);
        } catch (err: any) {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: `⚠️ Error al procesar archivo: ${err?.response?.data?.error || err.message}`,
                timestamp: new Date(),
            }]);
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const downloadFile = async (data: any[], format: 'csv' | 'excel') => {
        try {
            const res = await api.post('/ai-chat/export', { data, format, filename: 'reporte_ia' }, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([res.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `reporte_ia_${new Date().toISOString().slice(0, 10)}.${format === 'excel' ? 'xlsx' : 'csv'}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            notifications.show({
                title: 'Descarga iniciada',
                message: `Archivo ${format.toUpperCase()} generado correctamente`,
                color: 'blue',
            });
        } catch {
            notifications.show({
                title: 'Error de exportación',
                message: 'No se pudo generar el archivo',
                color: 'red',
            });
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        handleSend();
    };

    return (
        <>
            {/* Botón flotante */}
            <button
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 text-white shadow-xl shadow-teal-500/30 flex items-center justify-center hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer border border-white/20"
                title="Asistente IA TechLand"
            >
                {isOpen ? <IconClose /> : <IconBot className="w-7 h-7" />}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full animate-pulse" />
                )}
            </button>

            {/* Ventana de Chat */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[95vw] sm:w-[440px] h-[600px] max-h-[80vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200">
                    {/* Header */}
                    <div className="px-5 py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 text-white flex items-center justify-between shrink-0 shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
                                <IconBot className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                                    TechLand AI
                                    <span className="text-[10px] bg-white/25 px-1.5 py-0.5 rounded-full font-medium tracking-wide">PRO</span>
                                </h3>
                                <p className="text-[11px] text-teal-100/90 font-medium">Asesor de Taller & Negocio</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {messages.length > 0 && (
                                <button
                                    type="button"
                                    onClick={clearSession}
                                    className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-xl transition-colors cursor-pointer"
                                    title="Limpiar chat"
                                >
                                    <IconTrash />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-white/80 hover:text-white hover:bg-white/15 rounded-xl transition-colors cursor-pointer"
                                title="Cerrar"
                            >
                                <IconClose />
                            </button>
                        </div>
                    </div>

                    {/* Contenedor de Mensajes */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/70 dark:bg-slate-950/40">
                        {messages.length === 0 && (
                            <div className="py-6 text-center">
                                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 flex items-center justify-center border border-teal-100 dark:border-teal-900/50">
                                    <IconBot className="w-8 h-8" />
                                </div>
                                <h4 className="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1">
                                    ¡Hola! ¿En qué puedo ayudarte hoy?
                                </h4>
                                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto mb-5 leading-relaxed">
                                    Preguntame sobre órdenes en reparación, ventas de hoy, repuestos bajos o subí un archivo para analizar.
                                </p>
                                <div className="space-y-1.5 text-left">
                                    {QUICK_QUESTIONS.map((q, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleSend(q.text)}
                                            className="w-full text-left px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800/80 hover:bg-teal-50/70 dark:hover:bg-teal-950/40 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 transition-all flex items-center gap-2.5 group cursor-pointer shadow-sm"
                                        >
                                            <span className="text-base">{q.icon}</span>
                                            <span className="flex-1 font-medium group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                                                {q.text}
                                            </span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {messages.map((msg, i) => (
                            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-[85%] rounded-2xl shadow-sm ${
                                    msg.role === 'user'
                                        ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-br-sm'
                                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-sm border border-slate-200 dark:border-slate-700'
                                } px-4 py-3`}>
                                    <div className="text-sm whitespace-pre-wrap leading-relaxed">
                                        {formatMarkdown(msg.content)}
                                    </div>

                                    {/* Botones de Exportar cuando el usuario pide explícitamente un reporte */}
                                    {((msg.exportData && msg.exportData.length > 0) || (msg.rows && msg.rows.length > 0 && msg.content.includes('📊'))) && (
                                        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-700/60">
                                            <button
                                                type="button"
                                                onClick={() => downloadFile(msg.exportData?.length ? msg.exportData : msg.rows!, 'csv')}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold rounded-xl border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition-colors cursor-pointer"
                                            >
                                                <IconDownload /> CSV
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => downloadFile(msg.exportData?.length ? msg.exportData : msg.rows!, 'excel')}
                                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 text-[11px] font-bold rounded-xl border border-blue-200 dark:border-blue-800 hover:bg-blue-100 transition-colors cursor-pointer"
                                            >
                                                <IconDownload /> Excel
                                            </button>
                                        </div>
                                    )}

                                    <p className={`text-[10px] mt-1.5 font-medium ${msg.role === 'user' ? 'text-white/60' : 'text-slate-400'}`}>
                                        {msg.timestamp.toLocaleTimeString('es-VE', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        ))}

                        {(loading || uploading) && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-slate-800 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm border border-slate-200 dark:border-slate-700">
                                    <div className="flex items-center gap-2.5">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:0ms]" />
                                            <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:150ms]" />
                                            <span className="w-2 h-2 bg-teal-400 rounded-full animate-bounce [animation-delay:300ms]" />
                                        </div>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">
                                            {uploading ? 'Analizando archivo...' : 'Pensando...'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input y Acciones */}
                    <div className="border-t border-slate-200 dark:border-slate-800 px-4 py-3 bg-white dark:bg-slate-900 shrink-0">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleFileUpload}
                            className="hidden"
                        />
                        <form onSubmit={handleSubmit} className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={loading || uploading}
                                className="w-10 h-10 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-xl flex items-center justify-center hover:bg-teal-50 hover:text-teal-600 transition-colors disabled:opacity-50 cursor-pointer shrink-0 border border-slate-200/60 dark:border-slate-700"
                                title="Subir CSV o Excel"
                            >
                                <IconFile />
                            </button>
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                placeholder="Escribí tu pregunta sobre el taller..."
                                disabled={loading || uploading}
                                className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-sm text-slate-800 dark:text-slate-100 placeholder:text-slate-400 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/30 border border-transparent focus:border-teal-400 disabled:opacity-50 transition-all"
                            />
                            <button
                                type="submit"
                                disabled={loading || uploading || !input.trim()}
                                className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-600 text-white rounded-xl flex items-center justify-center hover:from-emerald-600 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0 shadow-sm shadow-teal-500/25"
                            >
                                <IconSend />
                            </button>
                        </form>
                        <p className="text-[10px] text-slate-400 mt-2 text-center font-medium">
                            TechLand AI · Asistente inteligente de gestión
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}

function formatMarkdown(text: string): React.ReactNode {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={i} className="font-bold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
        }
        const italicParts = part.split(/(_[^_]+_)/g);
        return italicParts.map((ip, j) => {
            if (ip.startsWith('_') && ip.endsWith('_')) {
                return <em key={`${i}-${j}`} className="italic text-slate-500 dark:text-slate-400">{ip.slice(1, -1)}</em>;
            }
            return <span key={`${i}-${j}`}>{ip}</span>;
        });
    });
}
