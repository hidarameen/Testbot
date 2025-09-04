import { Router } from 'express';
import { startSession, getSession, sendMessage } from '../wa/sessionManager';

const router = Router();

router.post('/sessions/:id/start', async (req, res) => {
	const { id } = req.params;
	try {
		await startSession(id);
		res.json({ ok: true });
	} catch (e: any) {
		res.status(500).json({ ok: false, error: e.message });
	}
});

router.get('/sessions/:id', (req, res) => {
	const s = getSession(req.params.id);
	res.json({ ok: true, session: s ? { id: s.id, status: s.status } : null });
});

router.post('/sessions/:id/message', async (req, res) => {
	const { id } = req.params;
	const { jid, text } = req.body as { jid: string; text: string };
	try {
		await sendMessage(id, jid, text);
		res.json({ ok: true });
	} catch (e: any) {
		res.status(400).json({ ok: false, error: e.message });
	}
});

export default router;
