"use client";

import { io, Socket } from "socket.io-client";
import { useEffect, useState } from "react";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";

let socket: Socket | null = null;

export const initSocket = (token?: string): Socket => {
    if (!socket) {
        socket = io(SOCKET_URL, {
            transports: ["websocket"],
            auth: { token }
        });
    } else {
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

export const useSocket = (token?: string) => {
    const [socketInstance, setSocketInstance] = useState<Socket | null>(null);

    useEffect(() => {
        const s = initSocket(token);
        setSocketInstance(s);
    }, [token]);

    return socketInstance;
};
