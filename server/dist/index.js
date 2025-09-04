"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = exports.io = void 0;
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const wa_1 = __importDefault(require("./routes/wa"));
const socket_1 = require("./lib/socket");
const pino_1 = __importDefault(require("pino"));
const pino_pretty_1 = __importDefault(require("pino-pretty"));
const stream = (0, pino_pretty_1.default)({ translateTime: true, colorize: true });
const logger = (0, pino_1.default)({}, stream);
exports.logger = logger;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json({ limit: '2mb' }));
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, { cors: { origin: '*' } });
exports.io = io;
(0, socket_1.setIO)(io);
io.on('connection', (socket) => {
    logger.info({ id: socket.id }, 'Socket connected');
    socket.on('disconnect', () => logger.info({ id: socket.id }, 'Socket disconnected'));
});
app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/api/wa', wa_1.default);
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
server.listen(PORT, () => logger.info(`Server listening on :${PORT}`));
//# sourceMappingURL=index.js.map