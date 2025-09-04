"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setIO = setIO;
exports.getIO = getIO;
let ioInstance = null;
function setIO(instance) {
    ioInstance = instance;
}
function getIO() {
    if (!ioInstance) {
        throw new Error('Socket.io not initialized');
    }
    return ioInstance;
}
//# sourceMappingURL=socket.js.map