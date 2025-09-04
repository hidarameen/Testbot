"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSession = startSession;
exports.getSession = getSession;
exports.sendMessage = sendMessage;
const baileys_1 = __importStar(require("@whiskeysockets/baileys"));
const qrcode_terminal_1 = __importDefault(require("qrcode-terminal"));
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const pino_1 = __importDefault(require("pino"));
const socket_1 = require("../lib/socket");
const logger = (0, pino_1.default)({ level: 'info' });
const sessions = new Map();
async function startSession(sessionId) {
    const authDir = path_1.default.join(process.cwd(), 'sessions', sessionId);
    await promises_1.default.mkdir(authDir, { recursive: true });
    const { state, saveCreds } = await (0, baileys_1.useMultiFileAuthState)(authDir);
    sessions.set(sessionId, { id: sessionId, socket: null, status: 'connecting' });
    (0, socket_1.getIO)().emit('wa:status', { sessionId, status: 'connecting' });
    const sock = (0, baileys_1.default)({
        auth: state,
        logger,
        printQRInTerminal: false,
        browser: baileys_1.Browsers.ubuntu('Chrome'),
        syncFullHistory: false,
    });
    sessions.get(sessionId).socket = sock;
    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        if (qr) {
            sessions.get(sessionId).status = 'qr';
            (0, socket_1.getIO)().emit('wa:qr', { sessionId, qr });
            qrcode_terminal_1.default.generate(qr, { small: true });
        }
        if (connection === 'open') {
            sessions.get(sessionId).status = 'connected';
            (0, socket_1.getIO)().emit('wa:status', { sessionId, status: 'connected' });
        }
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            const shouldReconnect = statusCode !== baileys_1.DisconnectReason.loggedOut;
            sessions.get(sessionId).status = 'disconnected';
            (0, socket_1.getIO)().emit('wa:status', { sessionId, status: 'disconnected' });
            if (shouldReconnect) {
                startSession(sessionId).catch(() => { });
            }
        }
    });
}
function getSession(sessionId) {
    return sessions.get(sessionId) ?? null;
}
async function sendMessage(sessionId, jid, text) {
    const s = sessions.get(sessionId);
    if (!s?.socket)
        throw new Error('Session not connected');
    await s.socket.sendMessage(jid, { text });
}
//# sourceMappingURL=sessionManager.js.map