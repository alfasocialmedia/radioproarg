import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Política de Privacidad — ONRADIO',
    description: 'Conocé cómo ONRADIO recopila, utiliza y protege tu información personal.',
};

export default function PrivacidadPage() {
    return (
        <div className="bg-[#04080f] text-slate-50 min-h-screen">
            <div className="max-w-3xl mx-auto px-5 pt-32 pb-24">
                {/* Header */}
                <div className="mb-12">
                    <p className="text-red-500 text-xs font-extrabold uppercase tracking-[.2em] mb-3">Legal</p>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">Política de Privacidad</h1>
                    <p className="text-slate-500 text-sm">Última actualización: marzo 2026</p>
                </div>

                <div className="prose prose-invert prose-slate max-w-none space-y-10 text-slate-300 text-[15px] leading-relaxed">
                    <section>
                        <h2 className="text-xl font-black text-white mb-3">1. Información que recopilamos</h2>
                        <p>Cuando te registrás en ONRADIO o contratás cualquiera de nuestros planes, podemos recopilar los siguientes datos personales:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-3 text-slate-400">
                            <li>Nombre completo y dirección de correo electrónico.</li>
                            <li>Datos de facturación: CUIT/CUIL, domicilio fiscal (en caso de requerirse un comprobante).</li>
                            <li>Información de pago (procesada a través de MercadoPago o PayPal — no almacenamos datos de tarjetas).</li>
                            <li>Dirección IP, tipo de navegador y datos de uso del servicio.</li>
                            <li>Contenidos subidos por el usuario: audios, imágenes, noticias, programaciones.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-3">2. Uso de la información</h2>
                        <p>La información recopilada se utiliza para:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-3 text-slate-400">
                            <li>Proveer y mantener los servicios contratados.</li>
                            <li>Gestionar tu cuenta y procesar pagos.</li>
                            <li>Enviarte notificaciones relacionadas con el servicio (no publicidad de terceros).</li>
                            <li>Mejorar la plataforma mediante análisis de uso agregado y anónimo.</li>
                            <li>Cumplir con obligaciones legales en caso de ser requerido por autoridades competentes.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-3">3. Compartir información con terceros</h2>
                        <p>
                            ONRADIO no vende, alquila ni comparte tus datos personales con terceros con fines comerciales.
                            Solo compartimos información cuando es necesario para la prestación del servicio:
                        </p>
                        <ul className="list-disc pl-5 space-y-1 mt-3 text-slate-400">
                            <li><strong className="text-white">MercadoPago / PayPal:</strong> Para procesar pagos de forma segura.</li>
                            <li><strong className="text-white">Proveedores de streaming:</strong> Para la creación y administración de tu servidor de radio.</li>
                            <li><strong className="text-white">Servicios de hosting:</strong> Para guardar los archivos del portal web de tu emisora.</li>
                        </ul>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-3">4. Almacenamiento y seguridad</h2>
                        <p>
                            Tus datos son almacenados en servidores seguros con cifrado en tránsito (HTTPS/TLS) y en reposo.
                            Implementamos medidas técnicas y organizativas para proteger tus datos contra acceso no autorizado,
                            divulgación o destrucción.
                        </p>
                        <p className="mt-3">
                            Tus contraseñas se almacenan utilizando algoritmos de hash robustos (bcrypt) y nunca son accesibles
                            en texto plano, ni siquiera por el equipo de ONRADIO.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-3">5. Cookies</h2>
                        <p>
                            Utilizamos cookies de sesión estrictamente necesarias para el funcionamiento del panel de control.
                            No utilizamos cookies de seguimiento de terceros ni publicidad comportamental.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-3">6. Tus derechos</h2>
                        <p>Tenés derecho a:</p>
                        <ul className="list-disc pl-5 space-y-1 mt-3 text-slate-400">
                            <li>Acceder a los datos personales que tenemos sobre vos.</li>
                            <li>Solicitar la rectificación de datos incorrectos.</li>
                            <li>Solicitar la eliminación de tu cuenta y datos asociados.</li>
                            <li>Revocar tu consentimiento en cualquier momento.</li>
                        </ul>
                        <p className="mt-3">
                            Para ejercer cualquiera de estos derechos, escribinos a{' '}
                            <a href="mailto:privacidad@onradio.com.ar" className="text-red-400 hover:underline">privacidad@onradio.com.ar</a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-3">7. Retención de datos</h2>
                        <p>
                            Conservamos tus datos mientras tu cuenta esté activa o sea necesario para prestar el servicio.
                            Ante la baja del servicio, eliminamos los datos personales dentro de los 30 días hábiles, salvo
                            que la ley exija un período mayor de retención.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-3">8. Cambios a esta política</h2>
                        <p>
                            Nos reservamos el derecho de actualizar esta política en cualquier momento. Te notificaremos
                            mediante correo electrónico o un aviso en el panel de control ante cambios significativos.
                            El uso continuado del servicio tras la notificación implica la aceptación de los cambios.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-black text-white mb-3">9. Contacto</h2>
                        <p>
                            Si tenés preguntas sobre esta política, podés contactarnos en:
                        </p>
                        <div className="mt-3 bg-white/[0.03] border border-white/[0.06] rounded-xl p-5 text-slate-400 text-sm space-y-1">
                            <p><strong className="text-white">ONRADIO</strong></p>
                            <p>Email: <a href="mailto:privacidad@onradio.com.ar" className="text-red-400 hover:underline">privacidad@onradio.com.ar</a></p>
                            <p>WhatsApp: Disponible en <a href="https://onradio.com.ar" className="text-red-400 hover:underline">onradio.com.ar</a></p>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}
