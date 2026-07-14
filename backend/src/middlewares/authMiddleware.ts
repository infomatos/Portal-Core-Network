import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export interface AuthRequest extends Request {
    user?: {
        id: number;
        matricula: string;
        role: string;
    };
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ message: 'Acesso restrito a administradores' });
    }
    next();
}

export function requireAdminOrModerador(req: AuthRequest, res: Response, next: NextFunction) {
    if (req.user?.role !== 'admin' && req.user?.role !== 'moderador') {
        return res.status(403).json({ message: 'Acesso restrito a administradores e moderadores' });
    }
    next();
}

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Acesso não autorizado (Token necessário)" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;

        req.user = decoded;
        next();

    } catch (error) {
        return res.status(401).json({ message: "Token inválido ou expirado" });
    }
}