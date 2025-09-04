import makeWASocket, {
	Browsers,
	DisconnectReason,
	useMultiFileAuthState,
	type WASocket,
} from '@whiskeysockets/baileys';
import { Boom } from '@hapi/boom';
import qrcode from 'qrcode-terminal';
import path from 'path';
import fs from 'fs/promises';
import pino from 'pino';
import { getIO } from '../lib/socket';

export type SessionStatus = 'connecting' | 'qr' | 'connected' | 'disconnected' | 'error';

type Session = {
	id: string;
	socket: WASocket | null;
	status: SessionStatus;
};

const logger = pino({ level: 'info' });

const sessions = new Map<string, Session>();

export async function startSession(sessionId: string): Promise<void> {
	const authDir = path.join(process.cwd(), 'sessions', sessionId);
	await fs.mkdir(authDir, { recursive: true });
	const { state, saveCreds } = await useMultiFileAuthState(authDir);

	sessions.set(sessionId, { id: sessionId, socket: null, status: 'connecting' });
	getIO().emit('wa:status', { sessionId, status: 'connecting' });

	const sock = makeWASocket({
		auth: state,
		logger,
		printQRInTerminal: false,
		browser: Browsers.ubuntu('Chrome'),
		syncFullHistory: false,
	});

	sessions.get(sessionId)!.socket = sock;

	sock.ev.on('creds.update', saveCreds);
	sock.ev.on('connection.update', (update) => {
		const { connection, lastDisconnect, qr } = update;
		if (qr) {
			sessions.get(sessionId)!.status = 'qr';
			getIO().emit('wa:qr', { sessionId, qr });
			qrcode.generate(qr, { small: true });
		}
		if (connection === 'open') {
			sessions.get(sessionId)!.status = 'connected';
			getIO().emit('wa:status', { sessionId, status: 'connected' });
		}
		if (connection === 'close') {
			const statusCode = (lastDisconnect?.error as Boom | undefined)?.output?.statusCode;
			const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
			sessions.get(sessionId)!.status = 'disconnected';
			getIO().emit('wa:status', { sessionId, status: 'disconnected' });
			if (shouldReconnect) {
				startSession(sessionId).catch(() => {});
			}
		}
	});
}

export function getSession(sessionId: string): Session | null {
	return sessions.get(sessionId) ?? null;
}

export async function sendMessage(sessionId: string, jid: string, text: string): Promise<void> {
	const s = sessions.get(sessionId);
	if (!s?.socket) throw new Error('Session not connected');
	await s.socket.sendMessage(jid, { text });
}
