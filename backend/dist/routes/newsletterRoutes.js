"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const multer_1 = __importDefault(require("multer"));
const authMiddleware_1 = require("../middlewares/authMiddleware");
const subscriberController_1 = require("../controllers/subscriberController");
const newsletterController_1 = require("../controllers/newsletterController");
const router = (0, express_1.Router)();
// --- Upload de imagens (Unlayer) ---
const uploadDir = process.env.UPLOAD_DIR
    ? path_1.default.resolve(process.env.UPLOAD_DIR)
    : path_1.default.join(__dirname, '../../uploads/newsletter');
if (!fs_1.default.existsSync(uploadDir))
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => cb(null, uploadDir),
    filename: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname);
        cb(null, `${Date.now()}${ext}`);
    },
});
const upload = (0, multer_1.default)({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
router.post('/upload', authMiddleware_1.authMiddleware, authMiddleware_1.requireAdmin, upload.single('image'), (req, res) => {
    if (!req.file)
        return res.status(400).json({ message: 'Nenhuma imagem recebida' });
    const baseUrl = process.env.UPLOAD_PUBLIC_URL || `${req.protocol}://${req.get('host')}`;
    const url = `${baseUrl}/uploads/newsletter/${req.file.filename}`;
    res.json({ url });
});
// --- Subscribers ---
router.get('/subscribers', authMiddleware_1.authMiddleware, authMiddleware_1.requireAdmin, subscriberController_1.getSubscribers);
router.post('/subscribers', authMiddleware_1.authMiddleware, authMiddleware_1.requireAdmin, subscriberController_1.addSubscriber);
router.patch('/subscribers/:id/status', authMiddleware_1.authMiddleware, authMiddleware_1.requireAdmin, subscriberController_1.patchSubscriberStatus);
router.delete('/subscribers/:id', authMiddleware_1.authMiddleware, authMiddleware_1.requireAdmin, subscriberController_1.removeSubscriber);
// --- Newsletters ---
router.get('/', authMiddleware_1.authMiddleware, authMiddleware_1.requireAdmin, newsletterController_1.getNewsletters);
router.get('/:id', authMiddleware_1.authMiddleware, authMiddleware_1.requireAdmin, newsletterController_1.getNewsletter);
router.post('/', authMiddleware_1.authMiddleware, authMiddleware_1.requireAdmin, newsletterController_1.createNewsletter);
router.put('/:id', authMiddleware_1.authMiddleware, authMiddleware_1.requireAdmin, newsletterController_1.updateNewsletter);
router.post('/:id/send', authMiddleware_1.authMiddleware, authMiddleware_1.requireAdmin, newsletterController_1.sendNewsletter);
router.post('/:id/duplicar', authMiddleware_1.authMiddleware, authMiddleware_1.requireAdmin, newsletterController_1.duplicarNewsletterHandler);
router.delete('/:id', authMiddleware_1.authMiddleware, authMiddleware_1.requireAdmin, newsletterController_1.deleteNewsletter);
exports.default = router;
