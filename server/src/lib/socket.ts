import { Server as SocketIOServer } from 'socket.io';

let ioInstance: SocketIOServer | null = null;

export function setIO(instance: SocketIOServer): void {
	ioInstance = instance;
}

export function getIO(): SocketIOServer {
	if (!ioInstance) {
		throw new Error('Socket.io not initialized');
	}
	return ioInstance;
}
