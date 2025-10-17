import jwt from 'jsonwebtoken';
import type { Socket } from 'socket.io';

export interface AuthSocket extends Socket {
    userId?: string;
}

export const socketAuth = (socket: AuthSocket, next: (err?: Error) => void) =>{
    const token = socket.handshake.auth.token;
    if(!token){
        return next(new Error("Authentication required"));
    }

    try{
        const payload = jwt.verify(token, process.env.JWT_SECRET as string) as {id: string};
        socket.userId = payload.id;
        next();
    }catch{
        next(new Error("Invalid token"));
    }
}