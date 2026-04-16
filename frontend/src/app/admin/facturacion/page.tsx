"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { CreditCard, CheckCircle, XCircle, Clock, Loader2, RefreshCw, Receipt, AlertCircle, Download } from 'lucide-react';
import jsPDF from 'jspdf';

const ESTADO_CONFIG: Record<string, { label: string; color: string }> = {
    APROBADO: { label: 'Aprobado', color: 'text-green-400 bg-green-500/10 border-green-500/20' },
    PENDIENTE: { label: 'Pendiente', color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
    RECHAZADO: { label: 'Rechazado', color: 'text-red-400 bg-red-500/10 border-red-500/20' },
    EN_PROCESO: { label: 'En proceso', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
    DEVUELTO: { label: 'Devuelto', color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
};

export default function AdminFacturacionPage() {
    const [pagos, setPagos] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const cargar = () => {
        setLoading(true);
        api.get('/facturacion/pagos')
            .then(r => setPagos(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    const descargarPDF = (pago: any) => {
        const doc = new jsPDF();
        
        doc.setFontSize(22);
        doc.text("ONRADIO - RECIBO DE PAGO", 14, 20);
        
        doc.setFontSize(12);
        doc.text(`Fecha: ${new Date(pago.fechaCreacion).toLocaleDateString('es-AR')}`, 14, 30);
        doc.text(`ID Transaccion: ${pago.mpPaymentId || pago.id}`, 14, 38);
        doc.text(`Estado: ${pago.estado}`, 14, 46);
        
        doc.setLineWidth(0.5);
        doc.line(14, 50, 196, 50);

        doc.setFontSize(14);
        doc.text(`Plan Contratado: ${pago.orden?.plan?.nombre || 'Suscripción'}`, 14, 60);
        doc.text(`Periodo: ${pago.orden?.datosPagador?.periodoFacturacion || 'mensual'}`, 14, 68);
        doc.text(`Metodo de Pago: ${pago.metodo}`, 14, 76);

        doc.setFontSize(16);
        doc.text(`Total Pagado: $${pago.monto?.toLocaleString('es-AR')} ${pago.moneda}`, 14, 90);

        doc.save(`Recibo_ONRADIO_${pago.id.slice(0, 8)}.pdf`);
    };

    useEffect(() => { cargar(); }, []);

    const totalPagado = pagos.filter(p => p.estado === 'APROBADO').reduce((a, p) => a + p.monto, 0);

    return (
        <div className="p-6 lg:p-8 max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <CreditCard className="text-primary w-8 h-8" /> Facturación
                    </h1>
                    <p className="text-slate-400 mt-1">Historial completo de pagos de tu suscripción.</p>
                </div>
                <button onClick={cargar} className="text-slate-500 hover:text-white flex items-center gap-2 text-sm transition-colors">
                    <RefreshCw className="w-4 h-4" /> Actualizar
                </button>
            </div>

            {/* Resumen */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
                <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5">
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Total Pagado</p>
                    <p className="text-3xl font-black text-green-400">
                        ${totalPagado.toLocaleString('es-AR')}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">ARS en pagos aprobados</p>
                </div>
                <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5">
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Total Transacciones</p>
                    <p className="text-3xl font-black text-white">{pagos.length}</p>
                    <p className="text-xs text-slate-500 mt-1">registros en historial</p>
                </div>
                <div className="bg-[#0f172a] border border-white/5 rounded-2xl p-5">
                    <p className="text-xs text-slate-500 uppercase tracking-widest mb-2">Último Pago</p>
                    {pagos[0] ? (
                        <>
                            <p className="text-xl font-black text-white">${pagos[0].monto?.toLocaleString('es-AR')}</p>
                            <p className="text-xs text-slate-500 mt-1">{new Date(pagos[0].fechaCreacion).toLocaleDateString('es-AR')}</p>
                        </>
                    ) : (
                        <p className="text-lg text-slate-600">Sin pagos</p>
                    )}
                </div>
            </div>

            {/* Tabla */}
            <div className="bg-[#0f172a] border border-white/5 rounded-2xl overflow-hidden">
                <div className="p-5 border-b border-white/5">
                    <h2 className="font-bold text-white flex items-center gap-2"><Receipt className="w-4 h-4 text-primary" /> Historial de Pagos</h2>
                </div>
                {loading ? (
                    <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-primary animate-spin" /></div>
                ) : pagos.length === 0 ? (
                    <div className="py-16 text-center">
                        <AlertCircle className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm">No hay pagos registrados aún.</p>
                        <p className="text-slate-600 text-xs mt-1">Los pagos aparecerán aquí automáticamente al confirmar tu suscripción.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5 bg-black/20">
                                    {['Fecha', 'Monto', 'Método', 'Estado', 'ID de Pago', ''].map(h => (
                                        <th key={h} className="p-4 text-xs font-bold text-slate-500 uppercase tracking-widest">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {pagos.map((p: any) => {
                                    const est = ESTADO_CONFIG[p.estado] || ESTADO_CONFIG.PENDIENTE;
                                    return (
                                        <tr key={p.id} className="hover:bg-white/5 transition-colors">
                                            <td className="p-4 text-sm text-slate-400">
                                                {new Date(p.fechaCreacion).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="p-4 text-sm font-bold text-white">
                                                ${p.monto?.toLocaleString('es-AR')} <span className="text-xs text-slate-500 font-normal">{p.moneda}</span>
                                            </td>
                                            <td className="p-4">
                                                <span className="text-xs text-slate-400 capitalize flex items-center gap-1.5">
                                                    <CreditCard className="w-3 h-3" /> {p.metodo || 'mercadopago'}
                                                </span>
                                            </td>
                                            <td className="p-4">
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${est.color}`}>
                                                    {p.estado === 'APROBADO' ? <CheckCircle className="w-3 h-3 inline mr-1" /> :
                                                        p.estado === 'RECHAZADO' ? <XCircle className="w-3 h-3 inline mr-1" /> :
                                                            <Clock className="w-3 h-3 inline mr-1" />}
                                                    {est.label}
                                                </span>
                                            </td>
                                            <td className="p-4 text-xs text-slate-500 font-mono">
                                                {p.mpPaymentId || p.id.slice(0, 12) + '...'}
                                            </td>
                                            <td className="p-4 text-right">
                                                {p.estado === 'APROBADO' && (
                                                    <button 
                                                        onClick={() => descargarPDF(p)}
                                                        className="text-blue-400 hover:text-blue-300 p-2 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                        title="Descargar Recibo HTTP"
                                                    >
                                                        <Download className="w-5 h-5" />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
