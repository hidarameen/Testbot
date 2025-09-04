"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sessionManager_1 = require("../wa/sessionManager");
const router = (0, express_1.Router)();
router.post('/sessions/:id/start', async (req, res) => {
    const { id } = req.params;
    try {
        await (0, sessionManager_1.startSession)(id);
        res.json({ ok: true });
    }
    catch (e) {
        res.status(500).json({ ok: false, error: e.message });
    }
});
router.get('/sessions/:id', (req, res) => {
    const s = (0, sessionManager_1.getSession)(req.params.id);
    res.json({ ok: true, session: s ? { id: s.id, status: s.status } : null });
});
router.post('/sessions/:id/message', async (req, res) => {
    const { id } = req.params;
    const { jid, text } = req.body;
    try {
        await (0, sessionManager_1.sendMessage)(id, jid, text);
        res.json({ ok: true });
    }
    catch (e) {
        res.status(400).json({ ok: false, error: e.message });
    }
});
exports.default = router;
//# sourceMappingURL=wa.js.map