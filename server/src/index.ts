import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import waRoutes from './routes/wa';
import { setIO } from './lib/socket';
import pino from 'pino';
import pretty from 'pino-pretty';

const stream = pretty({ translateTime: true, colorize: true });
const logger = pino({}, stream);

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });
setIO(io);

io.on('connection', (socket) => {
	logger.info({ id: socket.id }, 'Socket connected');
	socket.on('disconnect', () => logger.info({ id: socket.id }, 'Socket disconnected'));
});

// Root route
app.get('/', (_req, res) => {
	res.json({
		message: 'WhatsApp API Server',
		status: 'running',
		endpoints: {
			health: '/health',
			api: '/api/wa'
		}
	});
});

app.get('/health', (_req, res) => res.json({ ok: true }));

app.use('/api/wa', waRoutes);

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
server.listen(PORT, () => logger.info(`Server listening on :${PORT}`));

export { io, logger };
