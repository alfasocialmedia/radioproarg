"use client";

import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";

// URL base de nuestro servidor backend
const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

let socket: Socket | null = null;

/**
 * Inicializa el socket. 
 * Si se provee un token, se envía en el handshake para autenticación (Admin).
 */
export const initSocket = (token?: string): Socket => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            transports: ["websocket"],
            auth: { token }
        });
    } else {
        // Si ya existe pero el token cambió (login/logout), actualizamos
        if (token && (socket as any).auth?.token !== token) {
            (socket as any).auth = { token };
            socket.disconnect().connect();
        }
    }
    return socket;
};

export const getSocket = (): Socket | null => {
    return socket;
};

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};

/**
 * Hook para usar el socket en componentes de React.
 * Permite pasar un token opcional para elevar privilegios (Admin).
 */
export const useSocket = (token?: string) => {
    const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

    useEffect(() => {
        const s = initSocket(token);
        setSocketInstance(s);
        
        // No desconectamos en el cleanup para mantener el singleton si se navega entre páginas
        // El socket se maneja de forma global.
    }, [token]);

    return socketInstance;
};
