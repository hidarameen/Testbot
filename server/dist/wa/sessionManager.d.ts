import { type WASocket } from '@whiskeysockets/baileys';
export type SessionStatus = 'connecting' | 'qr' | 'connected' | 'disconnected' | 'error';
type Session = {
    id: string;
    socket: WASocket | null;
    status: SessionStatus;
};
export declare function startSession(sessionId: string): Promise<void>;
export declare function getSession(sessionId: string): Session | null;
export declare function sendMessage(sessionId: string, jid: string, text: string): Promise<void>;
export {};
//# sourceMappingURL=sessionManager.d.ts.map