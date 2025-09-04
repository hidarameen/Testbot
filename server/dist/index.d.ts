import 'dotenv/config';
import { Server as SocketIOServer } from 'socket.io';
import pino from 'pino';
declare const logger: pino.Logger<never, boolean>;
declare const io: SocketIOServer<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export { io, logger };
//# sourceMappingURL=index.d.ts.map