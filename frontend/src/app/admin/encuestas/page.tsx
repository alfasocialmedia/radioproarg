"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import {
    PlusCircle, Search, Trash2, Pencil, ImageIcon, Upload, Loader2, CheckCircle2,
    AlertCircle, X, Eye, EyeOff, SearchCode, Share2, Heart, BarChart3, Clock,
    Calendar, Palette, Info, Archive, Plus, PieChart as PieChartIcon, FileText, Download,
    ChevronRight, CheckSquare, Square, Save, ChevronUp, ChevronDown
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import jsPDF from 'jspdf';

type EstadoEncuesta = "DRAFT" | "PUBLISHED" | "CLOSED";
type EstiloEncuesta = "basic" | "premium" | "modern" | "brutal";

interface Opcion {
    id?: string;
    texto: string;
    imagenUrl?: string | null;
    votos?: number;
    orden?: number;
}

const ESTILOS = [
    { id: 'basic', name: 'Básico', desc: 'Limpio y funcional' },
    { id: 'premium', name: 'Cristal Premium', desc: 'Efectos de transparencia y desenfoque' },
    { id: 'modern', name: 'Moderno Oscuro', desc: 'Contraste alto y neones azules' },
    { id: 'brutal', name: 'Neo-Brutalista', desc: 'Bordes gruesos y sombras planas' },
];

export default function AdminEncuestasPage() {
    const [encuestas, setEncuestas] = useState<any[]>([]);
    const [noticias, setNoticias] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [editId, setEditId] = useState<string | null>(null);

    // Formulario
    const [pregunta, setPregunta] = useState("");
    const [opciones, setOpciones] = useState<Opcion[]>([
        { texto: "" }, { texto: "" }
    ]);
    const [noticiaId, setNoticiaId] = useState("");
    const [estado, setEstado] = useState<EstadoEncuesta>("PUBLISHED");
    const [estilo, setEstilo] = useState<EstiloEncuesta>("premium");
    const [fechaFin, setFechaFin] = useState("");
    const [mostrarResultados, setMostrarResultados] = useState(true);
    const [showReportModal, setShowReportModal] = useState(false);
    const [reporteData, setReporteData] = useState<any>(null);
    const [loadingReporte, setLoadingReporte] = useState(false);

    const radioId = typeof window !== 'undefined' ? localStorage.getItem('radioId') : null;

    useEffect(() => {
        cargarDatos();
    }, []);

    const cargarDatos = async () => {
        setLoading(true);
        try {
            const [resNoticias, resEncuestas] = await Promise.all([
                api.get('/noticias/admin/todas'),
                radioId ? api.get(`/encuestas/todas`) : Promise.resolve({ data: [] })
            ]);
            setNoticias(resNoticias.data);
            setEncuestas(resEncuestas.data);
        } catch (error) {
            console.error("Error al cargar datos:", error);
        } finally {
            setLoading(false);
        }
    };

    const moveOpcion = (index: number, direction: 'up' | 'down') => {
        const newOpts = [...opciones];
        const nextIndex = direction === 'up' ? index - 1 : index + 1;
        if (nextIndex < 0 || nextIndex >= newOpts.length) return;
        [newOpts[index], newOpts[nextIndex]] = [newOpts[nextIndex], newOpts[index]];
        setOpciones(newOpts);
    };

    const addOpcion = () => setOpciones([...opciones, { texto: "" }]);
    const removeOpcion = (index: number) => setOpciones(opciones.filter((_, i) => i !== index));
    const updateOpcion = (index: number, val: string) => {
        const newOpts = [...opciones];
        newOpts[index] = { ...newOpts[index], texto: val };
        setOpciones(newOpts);
    };
    const updateImagenOpcion = (index: number, url: string) => {
        const newOpts = [...opciones];
        newOpts[index] = { ...newOpts[index], imagenUrl: url };
        setOpciones(newOpts);
    };

    const abrirNueva = () => {
        setEditId(null);
        resetForm();
        setShowModal(true);
    };

    const abrirEditar = (e: any) => {
        setEditId(e.id);
        setPregunta(e.pregunta);
        setOpciones(e.opciones.map((o: any) => ({
            id: o.id,
            texto: o.texto,
            imagenUrl: o.imagenUrl
        })));
        setNoticiaId(e.noticiaId || "");
        setEstilo(e.estilo as EstiloEncuesta);
        setEstado(e.estado || "PUBLISHED");
        setFechaFin(e.fechaFin ? e.fechaFin.substring(0, 16) : "");
        setMostrarResultados(e.mostrarResultados !== undefined ? e.mostrarResultados : true);
        setShowModal(true);
    };

    const handleGuardar = async () => {
        if (!pregunta.trim()) {
            alert("Por favor, escribe una pregunta.");
            return;
        }
        if (opciones.some(o => !o.texto.trim())) {
            alert("No puedes dejar opciones vacías. Por favor, complétalas o elimína las que no uses.");
            return;
        }
        if (!radioId) {
            alert("Error: No se encontró el ID de la radio. Por favor, re-inicia sesión.");
            return;
        }

        setIsSaving(true);
        try {
            const payload = {
                pregunta,
                opciones: opciones.map((o, index) => ({
                    id: o.id,
                    texto: o.texto.trim(),
                    imagenUrl: o.imagenUrl || null,
                    orden: index + 1 // Assign order based on current array position
                })).filter(o => o.texto),
                noticiaId: noticiaId || null,
                estado,
                estilo,
                mostrarResultados,
                fechaFin: fechaFin || null,
            };

            console.log("DEBUG: Guardando encuesta con payload:", payload);

            if (editId) {
                await api.put(`/encuestas/${editId}`, payload);
            } else {
                await api.post(`/encuestas`, payload);
            }

            setShowModal(false);
            resetForm();
            cargarDatos();
        } catch (error) {
            console.error("Error al guardar encuesta:", error);
            alert("No se pudo guardar la encuesta. Revisa la consola para más detalles.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleUploadImagen = async (index: number, file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        
        // El tenant se inyecta vía cabecera o interceptor si ya está configurado
        const headers: any = {};
        if (radioId) headers['x-tenant-id'] = radioId;

        try {
            const res = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data', ...headers }
            });
            updateImagenOpcion(index, res.data.url);
        } catch (error) {
            console.error("Error al subir imagen:", error);
            alert("No se pudo subir la imagen.");
        }
    };

    const handleDownloadCSV = () => {
        if (!reporteData) return;
        const headers = ["OPCION", "VOTOS", "PORCENTAJE"];
        const rows = reporteData.opciones.map((o: any) => [o.texto, o.votos, `${o.porcentaje}%`]);
        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `Reporte_${reporteData.pregunta.replace(/\s+/g, '_')}.csv`;
        link.click();
    };

    const handleDownloadPDF = () => {
        if (!reporteData) return;
        const doc = new jsPDF();
        doc.setFontSize(20);
        doc.text("Reporte de Encuesta Pro", 20, 20);
        doc.setFontSize(14);
        doc.text(`Pregunta: ${reporteData.pregunta}`, 20, 35);
        doc.text(`Votos Totales: ${reporteData.totalVotos}`, 20, 45);
        doc.text(`Estado: ${reporteData.estado === 'PUBLISHED' ? 'Público' : 'Borrador'}`, 20, 55);
        
        let y = 70;
        reporteData.opciones.forEach((o: any, i: number) => {
            doc.text(`${i+1}. ${o.texto}: ${o.votos} votos (${o.porcentaje}%)`, 20, y);
            y += 10;
        });
        
        doc.save(`Reporte_${reporteData.pregunta.replace(/\s+/g, '_')}.pdf`);
    };

    const handleVerReporte = async (id: string) => {
        setLoadingReporte(true);
        setShowReportModal(true);
        try {
            const res = await api.get(`/encuestas/${id}/reporte`);
            setReporteData(res.data);
        } catch (error) {
            console.error("Error al cargar reporte:", error);
            alert("No se pudo cargar el reporte.");
            setShowReportModal(false);
        } finally {
            setLoadingReporte(false);
        }
    };

    const handleEliminar = async (id: string) => {
        if (!confirm("¿Seguro que quieres eliminar esta encuesta? Se perderán todos los votos.")) return;
        try {
            await api.delete(`/encuestas/${id}`);
            cargarDatos();
        } catch (error) {
            console.error("Error al eliminar encuesta:", error);
            alert("No se pudo eliminar la encuesta.");
        }
    };

    const resetForm = () => {
        setPregunta("");
        setOpciones([{ texto: "" }, { texto: "" }]);
        setNoticiaId("");
        setEstado("PUBLISHED");
        setEstilo("premium");
        setFechaFin("");
        setMostrarResultados(true);
    };

    const getVotosTotales = (e: any) => e.opciones.reduce((acc: number, o: any) => acc + o.votos, 0);

    return (
        <div className="p-6 lg:p-10 max-w-7xl mx-auto space-y-8">
            {/* Header Pro */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white/5 p-8 rounded-[2.5rem] border border-white/10 backdrop-blur-xl">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tight flex items-center gap-4">
                        <BarChart3 className="text-primary w-10 h-10" /> 
                        Encuestas <span className="text-primary tracking-normal font-medium text-xl bg-primary/10 px-3 py-1 rounded-full">PRO</span>
                    </h1>
                    <p className="text-slate-400 mt-2 text-lg">Interactúa con tu audiencia y obtén feedback en tiempo real.</p>
                </div>
                <button 
                    onClick={abrirNueva}
                    className="group relative flex items-center gap-3 bg-primary hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black transition-all shadow-2xl shadow-primary/30 active:scale-95 overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    <Plus className="w-6 h-6" /> Nueva Encuesta
                </button>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-32 space-y-4">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                    <p className="text-slate-500 font-bold animate-pulse">Cargando comunidad...</p>
                </div>
            ) : encuestas.length === 0 ? (
                <div className="bg-white/5 border border-white/10 rounded-[3rem] p-20 text-center flex flex-col items-center max-w-2xl mx-auto shadow-inner">
                    <div className="bg-primary/10 p-6 rounded-full mb-6">
                        <PieChart className="w-20 h-20 text-primary" />
                    </div>
                    <h3 className="text-3xl font-black text-white mb-4">¿Qué opina tu audiencia?</h3>
                    <p className="text-slate-400 text-lg leading-relaxed mb-8">
                       Crea una encuesta y vincúlala a una noticia o déjala global para que todos voten desde el portal.
                    </p>
                    <button onClick={() => setShowModal(true)} className="text-primary font-bold flex items-center gap-2 hover:underline">
                        <PlusCircle /> Crear mi primera encuesta ahora
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {encuestas.map((e) => {
                        const total = getVotosTotales(e);
                        return (
                            <div key={e.id} className="group bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden transition-all hover:bg-white/[0.07] hover:border-primary/30 flex flex-col cursor-pointer" onClick={() => abrirEditar(e)}>
                                <div className="p-8 space-y-6 flex-1">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-3">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                                                    e.estado === 'PUBLISHED' ? 'bg-green-500/10 text-green-500' : 
                                                    e.estado === 'DRAFT' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-400'
                                                }`}>
                                                    {e.estado === 'PUBLISHED' ? <CheckCircle2 className="w-3 h-3" /> : e.estado === 'DRAFT' ? <Clock className="w-3 h-3" /> : <Archive className="w-3 h-3" />}
                                                    {e.estado === 'PUBLISHED' ? 'PÚBLICO' : e.estado === 'DRAFT' ? 'BORRADOR' : 'CERRADO'}
                                                </span>
                                                <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                                                    e.mostrarResultados ? 'bg-blue-500/10 text-blue-400' : 'bg-slate-500/10 text-slate-500'
                                                }`}>
                                                    {e.mostrarResultados ? 'Resultados Visibles' : 'Resultados Ocultos'}
                                                </span>
                                                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/5 text-slate-400">
                                                    Estilo: {ESTILOS.find(s => s.id === e.estilo)?.name || e.estilo}
                                                </span>
                                                {e.noticia && (
                                                    <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 truncate max-w-[200px]">
                                                        📰 {e.noticia.titulo}
                                                    </span>
                                                )}
                                            </div>
                                            <h3 className="text-2xl font-black text-white group-hover:text-primary transition-colors leading-tight">{e.pregunta}</h3>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="text-3xl font-black text-white">{total}</div>
                                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Votos Totales</div>
                                        </div>
                                    </div>

                                    {/* Resultados Visuales */}
                                    <div className="space-y-4">
                                        {e.opciones.map((opt: any) => {
                                            const pct = total > 0 ? Math.round((opt.votos / total) * 100) : 0;
                                            return (
                                                <div key={opt.id} className="space-y-1.5">
                                                    <div className="flex justify-between text-xs font-bold px-1">
                                                        <span className="text-slate-300">{opt.texto}</span>
                                                        <span className="text-white">{opt.votos} ({pct}%)</span>
                                                    </div>
                                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                                                        <div 
                                                            className={`h-full transition-all duration-1000 ${
                                                                pct > 50 ? 'bg-primary' : 
                                                                pct > 25 ? 'bg-blue-400' : 'bg-slate-400'
                                                            }`} 
                                                            style={{ width: `${pct}%` }} 
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                                
                                {/* Footer Info */}
                                <div className="px-8 py-4 bg-white/5 border-t border-white/5 flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-tighter">
                                        <Calendar className="w-3 h-3" /> 
                                        Creada el {new Date(e.creadaEn).toLocaleDateString()}
                                        {e.fechaFin && (
                                            <> · <Clock className="w-3 h-3 ml-2" /> Cierra {new Date(e.fechaFin).toLocaleDateString()}</>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={(ev) => { ev.stopPropagation(); handleVerReporte(e.id); }}
                                            className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all border border-primary/20"
                                        >
                                            <BarChart3 className="w-3.5 h-3.5" /> Reporte
                                        </button>
                                        <button 
                                            onClick={(ev) => { ev.stopPropagation(); handleEliminar(e.id); }}
                                            className="text-slate-500 hover:text-red-400 transition-colors p-2 hover:bg-red-400/10 rounded-lg shadow-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal Pro */}
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-xl" onClick={() => setShowModal(false)} />
                    <div className="relative bg-[#0f172a] border border-white/10 w-full max-w-5xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]">
                        {/* Panel de Edición */}
                        <div className="flex-1 p-8 md:p-12 overflow-y-auto custom-scrollbar space-y-8">
                            <div className="flex justify-between items-center">
                                <h2 className="text-3xl font-black text-white">{editId ? 'Editar' : 'Diseñar'} Encuesta</h2>
                                <button onClick={() => setShowModal(false)} className="p-3 hover:bg-white/5 rounded-full text-slate-400 transition-all"><X /></button>
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                                <div className="space-y-4">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Info className="w-3 h-3" /> La Pregunta
                                    </label>
                                    <input 
                                        type="text" 
                                        value={pregunta}
                                        onChange={(e) => setPregunta(e.target.value)}
                                        placeholder="¿Qué te gustaría preguntar hoy?"
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white text-lg font-bold focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all placeholder:text-slate-700"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center justify-between">
                                        <span>Opciones de Respuesta</span>
                                        <span className="text-primary">{opciones.length} / 10</span>
                                    </label>
                                    <div className="grid gap-4">
                                        {opciones.map((opt, i) => (
                                            <div key={opt.id || i} className="flex flex-col gap-3 p-5 bg-white/5 border border-white/10 rounded-2xl group hover:border-white/20 transition-all">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-black text-primary border border-primary/20 shrink-0">
                                                        {i + 1}
                                                    </div>
                                                    <input 
                                                        type="text" 
                                                        value={opt.texto}
                                                        onChange={(e) => updateOpcion(i, e.target.value)}
                                                        placeholder={`Escribe la opción ${i + 1}`}
                                                        className="flex-1 bg-transparent border-none p-0 text-white font-black text-lg focus:outline-none placeholder:text-slate-700"
                                                    />
                                                    <div className="flex flex-col gap-0.5 shrink-0">
                                                        <button 
                                                            onClick={() => moveOpcion(i, 'up')} 
                                                            disabled={i === 0}
                                                            className="p-1 text-slate-500 hover:text-primary transition-all disabled:opacity-20"
                                                            title="Subir opción"
                                                        >
                                                            <ChevronUp className="w-4 h-4" />
                                                        </button>
                                                        <button 
                                                            onClick={() => moveOpcion(i, 'down')} 
                                                            disabled={i === opciones.length - 1}
                                                            className="p-1 text-slate-500 hover:text-primary transition-all disabled:opacity-20"
                                                            title="Bajar opción"
                                                        >
                                                            <ChevronDown className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                    {opciones.length > 1 && (
                                                        <button 
                                                            onClick={() => removeOpcion(i)} 
                                                            className="p-2 text-slate-600 hover:text-red-400 rounded-xl transition-all"
                                                            title="Eliminar esta opción"
                                                        >
                                                            <Trash2 className="w-5 h-5" />
                                                        </button>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-4 bg-black/20 p-3 rounded-xl border border-white/5">
                                                    <div className="w-12 h-12 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                                        {opt.imagenUrl ? (
                                                            <img src={opt.imagenUrl} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Palette className="w-5 h-5 text-slate-700" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Imagen de la opción</p>
                                                        <div className="flex items-center gap-2">
                                                            <input 
                                                                type="text" 
                                                                value={opt.imagenUrl || ""}
                                                                onChange={(e) => updateImagenOpcion(i, e.target.value)}
                                                                placeholder="URL o sube un archivo..."
                                                                className="flex-1 bg-transparent border-none p-0 text-xs text-primary focus:outline-none placeholder:text-slate-800 font-medium"
                                                            />
                                                            <label className="cursor-pointer bg-primary/10 hover:bg-primary/20 text-primary text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all border border-primary/20">
                                                                Subir Archivo
                                                                <input 
                                                                    type="file" 
                                                                    className="hidden" 
                                                                    accept="image/*"
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) handleUploadImagen(i, file);
                                                                    }}
                                                                />
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        {opciones.length < 10 && (
                                            <button 
                                                onClick={addOpcion}
                                                className="flex items-center justify-center gap-2 text-slate-400 hover:text-white font-bold py-3 border border-dashed border-white/10 rounded-xl hover:bg-white/5 transition-all w-full"
                                            >
                                                <PlusCircle className="w-5 h-5" /> Añadir otra opción
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Eye className="w-3 h-3" /> Estado Inicial
                                        </label>
                                        <div className="flex bg-black/40 p-1 rounded-2xl border border-white/5">
                                            {(['PUBLISHED', 'DRAFT', 'CLOSED'] as const).map(s => (
                                                <button
                                                    key={s}
                                                    onClick={() => setEstado(s)}
                                                    className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${estado === s ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                                                >
                                                    {s === 'PUBLISHED' ? 'Público' : s === 'DRAFT' ? 'Borrador' : 'Cerrado'}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Eye className="w-3 h-3" /> Privacidad
                                        </label>
                                        <button 
                                            onClick={() => setMostrarResultados(!mostrarResultados)}
                                            className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all group"
                                        >
                                            <div className="flex flex-col items-start gap-1">
                                                <span className="text-sm font-bold text-white">Mostrar resultados al público</span>
                                                <span className="text-[10px] text-slate-500 font-medium">Si se desactiva, solo tú verás los porcentajes en el panel.</span>
                                            </div>
                                            {mostrarResultados ? (
                                                <CheckSquare className="w-6 h-6 text-primary" />
                                            ) : (
                                                <Square className="w-6 h-6 text-slate-700" />
                                            )}
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Calendar className="w-3 h-3" /> Fecha de Cierre
                                        </label>
                                        <input 
                                            type="datetime-local" 
                                            value={fechaFin}
                                            onChange={(e) => setFechaFin(e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3 text-white text-sm focus:outline-none focus:border-primary/50 transition-all"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Info className="/3 h-3" /> Vincular a Noticia (Opcional)
                                    </label>
                                    <select 
                                        value={noticiaId}
                                        onChange={(e) => setNoticiaId(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white font-medium focus:outline-none focus:border-primary/50 transition-all appearance-none"
                                    >
                                        <option value="" className="bg-[#0f172a]">Encuesta Global para toda la radio</option>
                                        {noticias.map(n => (
                                            <option key={n.id} value={n.id} className="bg-[#0f172a]">{n.titulo}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Panel de Estilos y Preview */}
                        <div className="w-full md:w-[350px] bg-black/40 border-l border-white/10 p-8 md:p-10 flex flex-col space-y-10">
                            <div className="space-y-6">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <Palette className="w-3 h-3" /> Elegir Estilo
                                </label>
                                <div className="grid grid-cols-1 gap-3">
                                    {ESTILOS.map((s) => (
                                        <button
                                            key={s.id}
                                            onClick={() => setEstilo(s.id as EstiloEncuesta)}
                                            className={`text-left p-4 rounded-2xl border transition-all ${
                                                estilo === s.id 
                                                ? 'bg-primary/10 border-primary text-primary shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                                                : 'bg-white/5 border-white/5 text-slate-400 hover:border-white/20'
                                            }`}
                                        >
                                            <p className="text-sm font-black uppercase tracking-wider">{s.name}</p>
                                            <p className="text-[10px] opacity-60 mt-1">{s.desc}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col justify-end space-y-4">
                                <div className="bg-blue-500/10 border border-blue-500/20 p-5 rounded-2xl">
                                    <div className="flex items-start gap-3 text-blue-400">
                                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                                        <p className="text-xs leading-relaxed">
                                            Una vez publicada, la encuesta aparecerá automáticamente en el widget del portal según el estilo seleccionado.
                                        </p>
                                    </div>
                                </div>
                                <button 
                                    onClick={handleGuardar}
                                    disabled={isSaving}
                                    className="w-full bg-primary hover:bg-blue-500 disabled:opacity-50 text-white py-5 rounded-3xl font-black text-lg shadow-2xl shadow-primary/40 transition-all flex items-center justify-center gap-3 active:scale-95"
                                >
                                    {isSaving ? <Loader2 className="w-6 h-6 animate-spin" /> : <Save className="w-6 h-6" />}
                                    {editId ? 'Guardar Cambios' : (estado === 'PUBLISHED' ? 'Publicar Ahora' : 'Guardar Borrador')}
                                </button>
                                <button onClick={() => setShowModal(false)} className="w-full py-4 rounded-3xl text-sm font-bold text-slate-500 hover:text-white transition-all">
                                    Descartar cambios
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Reportes */}
            {showReportModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/80 backdrop-blur-2xl" onClick={() => setShowReportModal(false)} />
                    <div className="relative bg-[#0f172a] border border-white/10 w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
                        <div className="p-8 md:p-12 overflow-y-auto custom-scrollbar">
                            {loadingReporte ? (
                                <div className="py-20 flex flex-col items-center gap-4">
                                    <Loader2 className="w-10 h-10 text-primary animate-spin" />
                                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Generando Reporte Pro...</p>
                                </div>
                            ) : reporteData ? (
                                <div className="space-y-10">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Métricas de Audiencia</p>
                                            <h2 className="text-4xl font-black text-white leading-tight">{reporteData.pregunta}</h2>
                                        </div>
                                        <button onClick={() => setShowReportModal(false)} className="bg-white/5 border border-white/10 p-4 rounded-full text-slate-400 hover:text-white transition-all"><X /></button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Votos</p>
                                            <p className="text-4xl font-black text-white">{reporteData.totalVotos}</p>
                                        </div>
                                        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Estado</p>
                                            <p className="text-4xl font-black text-green-400">{reporteData.estado}</p>
                                        </div>
                                        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Participación</p>
                                            <p className="text-4xl font-black text-blue-400">{reporteData.totalVotos > 100 ? 'Muy Alta' : 'Moderada'}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center bg-white/5 p-10 rounded-[3rem] border border-white/5 shadow-inner">
                                        <div className="h-[300px] w-full">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <PieChart>
                                                    <Pie
                                                        data={reporteData.opciones}
                                                        cx="50%"
                                                        cy="50%"
                                                        innerRadius={60}
                                                        outerRadius={100}
                                                        paddingAngle={5}
                                                        dataKey="votos"
                                                        nameKey="texto"
                                                    >
                                                        {reporteData.opciones.map((_: any, index: number) => (
                                                            <Cell key={`cell-${index}`} fill={['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'][index % 6]} />
                                                        ))}
                                                    </Pie>
                                                    <RechartsTooltip 
                                                        contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem' }}
                                                        itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="space-y-4">
                                            <h3 className="text-xl font-black text-white">Resumen Visual</h3>
                                            <p className="text-sm text-slate-400 font-medium">Este gráfico representa la distribución real de la audiencia. La opción más elegida es <span className="text-primary font-bold">"{[...reporteData.opciones].sort((a,b)=>b.votos-a.votos)[0].texto}"</span>.</p>
                                            <div className="grid gap-2">
                                                {reporteData.opciones.map((opt: any, i: number) => (
                                                    <div key={i} className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#6366f1'][i % 6] }} />
                                                        {opt.texto}: {opt.porcentaje}%
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-xl font-bold text-white flex items-center gap-3">
                                            <PieChartIcon className="text-primary w-6 h-6" /> Desglose Detallado
                                        </h3>
                                        <div className="grid gap-4">
                                            {reporteData.opciones.map((opt: any) => (
                                                <div key={opt.id} className="bg-white/5 border border-white/5 p-6 rounded-[2rem] flex items-center gap-6 group hover:bg-white/[0.08] transition-all">
                                                    <div className="w-16 h-16 rounded-2xl bg-black/40 border border-white/10 overflow-hidden shrink-0">
                                                        {opt.imagenUrl ? (
                                                            <img src={opt.imagenUrl} alt="" className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-slate-700 font-black text-xl">{opt.texto.charAt(0)}</div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 space-y-3">
                                                        <div className="flex justify-between items-end">
                                                            <div>
                                                                <p className="text-lg font-black text-white leading-none">{opt.texto}</p>
                                                                <p className="text-xs font-bold text-slate-500 mt-1">{opt.votos} votos registrados</p>
                                                            </div>
                                                            <div className="text-2xl font-black text-primary">{opt.porcentaje}%</div>
                                                        </div>
                                                        <div className="h-3 bg-black/40 rounded-full overflow-hidden p-0.5 border border-white/5">
                                                            <div 
                                                                className="h-full bg-gradient-to-r from-primary to-blue-400 rounded-full transition-all duration-1000"
                                                                style={{ width: `${opt.porcentaje}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="pt-6 border-t border-white/5 flex gap-4">
                                        <button 
                                            onClick={handleDownloadCSV}
                                            className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/10 shadow-xl shadow-black/20 flex items-center justify-center gap-2"
                                        >
                                            <FileText className="w-5 h-5" /> Descargar CSV
                                        </button>
                                        <button 
                                            onClick={handleDownloadPDF}
                                            className="flex-1 py-4 bg-white/5 hover:bg-white/10 text-white rounded-2xl font-bold transition-all border border-white/10 shadow-xl shadow-black/20 flex items-center justify-center gap-2"
                                        >
                                            <Download className="w-5 h-5" /> Descargar PDF
                                        </button>
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
