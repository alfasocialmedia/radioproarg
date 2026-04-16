import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Términos y Condiciones — ONRADIO',
    description: 'Términos y condiciones del servicio de streaming de radio online ONRADIO.',
};

export default function TerminosPage() {
    return (
        <div className="bg-[#04080f] text-slate-50 min-h-screen">
            <div className="max-w-3xl mx-auto px-5 pt-32 pb-24">
                <div className="mb-12">
                    <p className="text-red-500 text-xs font-extrabold uppercase tracking-[.2em] mb-3">Legal</p>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">Términos y Condiciones</h1>
                    <p className="text-slate-500 text-sm">Última actualización: marzo 2026</p>
                </div>

                <div className="space-y-10 text-slate-300 text-[15px] leading-relaxed">
                    <section>
                        <h2 className="text-xl font-black text-white mb-3">1. Aceptación de los términos</h2>
                        <p>
                            Al registrarte en ONRADIO y usar nuestros servicios, aceptás estos Términos y Condiciones en su totalidad.
                            Si no estás de acuerdo con alguna parte de estos términos, no podés usar la plataforma.
                        </p>
                        <p className="mt-3">
                            ONRADIO se reserva el derecho de modificar estos términos en cualquier momento. El uso continuado
                            del servicio tras la publicación de cambios implica la aceptación de los mismos.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-3">2. Descripción del servicio</h2>
                        <p>ONRADIO es una plataforma SaaS que provee:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-3 text-slate-400">
                            <li>Servidores de streaming de audio (Icecast/SHOUTcast) con soporte de AutoDJ.</li>
                            <li>Panel de administración web para gestionar la emisora.</li>
                            <li>Portal web público para la emisora (según plan contratado).</li>
                            <li>CMS de noticias, grilla de programación, módulo de publicidad y encuestas.</li>
                            <li>Soporte técnico según lo especificado en el plan.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-3">3. Registro y cuenta</h2>
                        <ul className="list-disc pl-5 space-y-1 mt-3 text-slate-400">
                            <li>Debés ser mayor de 18 años para crear una cuenta.</li>
                            <li>Sos responsable de mantener la confidencialidad de tus credenciales.</li>
                            <li>Toda actividad que ocurra bajo tu cuenta es de tu responsabilidad.</li>
                            <li>Debés notificarnos de inmediato ante cualquier uso no autorizado de tu cuenta.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-3">4. Planes, precios y facturación</h2>
                        <ul className="list-disc pl-5 space-y-1 mt-3 text-slate-400">
                            <li>Los precios están expresados en Pesos Argentinos (ARS) o Dólares Estadounidenses (USD) según lo seleccionado.</li>
                            <li>El pago es mensual o anual, según el ciclo elegido al contratar.</li>
                            <li>Los pagos en ARS se procesan a través de MercadoPago. Los pagos en USD pueden realizarse por transferencia o PayPal.</li>
                            <li>La falta de pago puede resultar en la suspensión del servicio sin previo aviso.</li>
                            <li>Los precios pueden actualizarse con un aviso previo de 30 días corridos.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-3">5. Política de cancelación y reembolsos</h2>
                        <p>
                            Podés cancelar tu suscripción en cualquier momento desde el panel de administración.
                            La cancelación es efectiva al finalizar el período de facturación ya abonado.
                        </p>
                        <p className="mt-3">
                            No realizamos reembolsos proporcionales por cancelaciones anticipadas dentro del período pagado,
                            salvo falla grave atribuible a ONRADIO con tiempo de inactividad superior al 99.9% mensual comprometido.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-3">6. Uso aceptable del servicio</h2>
                        <p>Queda expresamente prohibido:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-3 text-slate-400">
                            <li>Transmitir contenido ilegal, pornográfico, violento o que incite al odio.</li>
                            <li>Usar el servicio para distribuir malware o realizar ataques informáticos.</li>
                            <li>Emitir contenido que viole derechos de autor sin las licencias correspondientes.</li>
                            <li>Revender o sub-arrendar el servicio a terceros sin autorización expresa.</li>
                            <li>Sobrecargar intencionalmente la infraestructura de la plataforma.</li>
                        </ul>
                        <p className="mt-3">
                            La violación de estas normas puede resultar en la suspensión o cancelación inmediata de la cuenta,
                            sin derecho a reembolso.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-3">7. Derechos de autor y propiedad intelectual</h2>
                        <p>
                            El usuario es responsable de contar con todas las licencias necesarias para el contenido que emite
                            (música, programas, imágenes, textos). ONRADIO no asume responsabilidad por infracciones
                            de derechos de autor cometidas por los usuarios de la plataforma.
                        </p>
                        <p className="mt-3">
                            La plataforma ONRADIO, su diseño, código y marca son propiedad exclusiva de ONRADIO y están
                            protegidos por la legislación de propiedad intelectual vigente.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-3">8. Disponibilidad del servicio (SLA)</h2>
                        <p>
                            ONRADIO se compromete a mantener una disponibilidad del servicio de al menos el 99.9% mensual,
                            excluyendo ventanas de mantenimiento programado notificadas con al menos 48 horas de anticipación
                            y eventos de fuerza mayor.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-3">9. Limitación de responsabilidad</h2>
                        <p>
                            ONRADIO no será responsable por daños indirectos, incidentales, especiales o consecuentes
                            derivados del uso o la imposibilidad de uso del servicio. La responsabilidad máxima de ONRADIO
                            en ningún caso superará el importe abonado por el usuario en los 3 meses previos al evento que
                            originó el reclamo.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-3">10. Ley aplicable y jurisdicción</h2>
                        <p>
                            Estos términos se rigen por las leyes de la República Argentina. Ante cualquier controversia,
                            las partes se someten a la jurisdicción de los tribunales ordinarios de la Ciudad Autónoma de
                            Buenos Aires, renunciando a cualquier otro fuero que pudiera corresponder.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-3">11. Contacto</h2>
                        <p>Para consultas legales o contractuales, contactanos en:</p>
                        <div className="mt-3 bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 text-slate-400 text-sm space-y-1">
                            <p><strong className="text-white">ONRADIO</strong></p>
                            <p>Email: <a href="mailto:legal@onradio.com.ar" className="text-red-400 hover:underline">legal@onradio.com.ar</a></p>
                            <p>WhatsApp: Disponible en <a href="https://onradio.com.ar" className="text-red-400 hover:underline">onradio.com.ar</a></p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
