import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import {
    criarUser, acharUserPorMatricula, acharUserPorEmail,
    salvarResetToken, acharUserPorResetToken, atualizarSenha,
    listarUsers, atualizarRole, removerUser,
    registrarAcesso, registrarVisita, totalAcessos, paginaMaisAcessada,
    atualizarNome, emailsAdmins,
    listarPendentes, aprovarUser, recusarUser,
    contarUsers,
} from "../models/userModel";
import type { AuthRequest } from "../middlewares/authMiddleware";
import { enfileirar } from "../models/mailQueueModel";
import { contarNewsletters } from "../models/newsletterModel";
import { contarSubscribers } from "../models/subscriberModel";
import { contarNoticiasPorStatus } from "../models/newsModel";
import { contarForumPorStatus } from "../models/forumModel";

export async function login(req: Request, res: Response) {
    const { matricula, password } = req.body;

    try {
        const user = await acharUserPorMatricula(matricula);

        if (!user) {
            return res.status(401).json({ message: "Matrícula ou senha inválidos" });
        }

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(401).json({ message: "Matrícula ou senha inválidos" });
        }

        if (user.status === 'pending') {
            return res.status(403).json({ message: "Seu cadastro ainda não foi aprovado. Aguarde a confirmação do administrador." });
        }
        if (user.status === 'rejected') {
            return res.status(403).json({ message: "Seu cadastro foi recusado. Entre em contato com o administrador." });
        }

        const token = jwt.sign(
            { id: user.id, matricula: user.matricula, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: '8h' }
        );

        registrarAcesso(user.id!).catch(e => console.error('[access_logs] registrarAcesso:', e));
        res.json({ token, user: { id: user.id, name: user.name, matricula: user.matricula, role: user.role } });
    } catch (error) {
        console.error("Erro ao fazer login:", error);
        res.status(500).json({ message: "Erro ao fazer login" });
    }
}

export async function logVisit(req: Request, res: Response) {
    const path = typeof req.body?.path === 'string' ? req.body.path.slice(0, 255) : '/';
    try {
        await registrarVisita(path);
        res.json({ ok: true });
    } catch (e) {
        console.error('[access_logs] logVisit:', e);
        res.status(500).json({ message: 'Erro ao registrar visita' });
    }
}

export async function getStats(_req: Request, res: Response) {
    try {
        const [
            { logins, visitas },
            topPage,
            users,
            newsletters,
            subscribers,
            news,
            forum,
        ] = await Promise.all([
            totalAcessos(),
            paginaMaisAcessada(),
            contarUsers(),
            contarNewsletters(),
            contarSubscribers(),
            contarNoticiasPorStatus(),
            contarForumPorStatus(),
        ]);
        res.json({
            logins,
            visitas,
            total: logins + visitas,
            topPage,
            users,
            newsletters,
            subscribers,
            news,
            forum,
        });
    } catch {
        res.status(500).json({ message: 'Erro ao buscar estatísticas' });
    }
}

export async function register(req: Request, res: Response) {
    const { name, matricula, email, password } = req.body;

    try {
        const matriculaExistente = await acharUserPorMatricula(matricula);
        if (matriculaExistente) {
            return res.status(400).json({ message: "Matrícula já cadastrada" });
        }

        const emailExistente = await acharUserPorEmail(email);
        if (emailExistente) {
            return res.status(400).json({ message: "E-mail já cadastrado" });
        }

        await criarUser({ name, matricula, email, password, role: 'user' });

        // Notifica todos os admins sobre o novo cadastro pendente
        const admins = await emailsAdmins();
        const dashboardUrl = `${process.env.FRONTEND_URL}/dashboard/aprovacoes`;
        await Promise.all(admins.map(adminEmail =>
            enfileirar(
                adminEmail,
                'Novo cadastro aguardando aprovação — Portal Core Engineering',
                `<div style="font-family:sans-serif;max-width:480px;margin:auto;">
                    <h2 style="color:#1e293b;">Novo usuário aguardando aprovação</h2>
                    <p>Um novo usuário se cadastrou no <strong>Portal Core Engineering</strong> e aguarda sua aprovação.</p>
                    <table style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
                        <tr><td style="padding:6px 0;color:#64748b;">Nome</td><td style="padding:6px 0;font-weight:600;color:#1e293b;">${name}</td></tr>
                        <tr><td style="padding:6px 0;color:#64748b;">Matrícula</td><td style="padding:6px 0;font-weight:600;color:#1e293b;">${matricula.toUpperCase()}</td></tr>
                        <tr><td style="padding:6px 0;color:#64748b;">E-mail</td><td style="padding:6px 0;font-weight:600;color:#1e293b;">${email}</td></tr>
                    </table>
                    <a href="${dashboardUrl}"
                       style="display:inline-block;margin:16px 0;padding:12px 24px;background:#1e293b;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">
                        Revisar no Dashboard
                    </a>
                    <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
                    <p style="color:#94a3b8;font-size:12px;">Portal Core Network Engineering — TIM Brasil</p>
                </div>`
            ).catch(() => {})
        ));

        res.status(201).json({ message: "Cadastro realizado! Aguarde a aprovação do administrador." });
    } catch (error) {
        res.status(500).json({ message: "Erro ao criar conta" });
    }
}

export async function forgotPassword(req: Request, res: Response) {
    const { email } = req.body;

    try {
        const user = await acharUserPorEmail(email);

        // Retorna 200 mesmo se e-mail não existir (segurança — não expõe quais e-mails estão cadastrados)
        if (!user) {
            return res.json({ message: "Se este e-mail estiver cadastrado, você receberá um link em breve." });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

        await salvarResetToken(user.id!, token, expires);

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        await enfileirar(
            user.email,
            'Redefinição de senha — Portal Core Engineering',
            `<div style="font-family:sans-serif;max-width:480px;margin:auto;">
                <h2 style="color:#1e293b;">Redefinição de senha</h2>
                <p>Recebemos uma solicitação para redefinir a senha da sua conta no Portal Core Engineering.</p>
                <p>Clique no botão abaixo para criar uma nova senha. O link expira em <strong>1 hora</strong>.</p>
                <a href="${resetUrl}"
                   style="display:inline-block;margin:16px 0;padding:12px 24px;background:#1e293b;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">
                    Redefinir senha
                </a>
                <p style="color:#64748b;font-size:13px;">Se você não solicitou isso, ignore este e-mail.</p>
                <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
                <p style="color:#94a3b8;font-size:12px;">Portal Core Network Engineering — TIM Brasil</p>
            </div>`
        );

        res.json({ message: "Se este e-mail estiver cadastrado, você receberá um link em breve." });
    } catch (error) {
        console.error("Erro ao solicitar reset:", error);
        res.status(500).json({ message: "Erro ao processar solicitação" });
    }
}

export async function updateProfile(req: AuthRequest, res: Response) {
    const { name } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: 'Nome inválido' });
    try {
        await atualizarNome(req.user!.id, name.trim());
        res.json({ name: name.trim() });
    } catch {
        res.status(500).json({ message: 'Erro ao atualizar perfil' });
    }
}

export async function changePassword(req: AuthRequest, res: Response) {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Campos obrigatórios' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'Nova senha deve ter ao menos 6 caracteres' });
    try {
        const user = await acharUserPorMatricula(req.user!.matricula);
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
        const valid = await bcrypt.compare(currentPassword, user.password);
        if (!valid) return res.status(401).json({ message: 'Senha atual incorreta' });
        await atualizarSenha(user.id!, newPassword);
        res.json({ message: 'Senha alterada com sucesso' });
    } catch {
        res.status(500).json({ message: 'Erro ao alterar senha' });
    }
}

export async function requestRoleChange(req: AuthRequest, res: Response) {
    const { requestedRole, reason } = req.body;
    const valid = ['editor', 'moderador', 'user'];
    if (!valid.includes(requestedRole)) return res.status(400).json({ message: 'Perfil inválido' });
    try {
        const admins = await emailsAdmins();
        if (!admins.length) return res.status(500).json({ message: 'Nenhum administrador cadastrado' });
        const body = `<div style="font-family:sans-serif;max-width:480px;margin:auto;">
            <h2 style="color:#1e293b;">Solicitação de alteração de perfil</h2>
            <p>O usuário <strong>${req.user!.matricula}</strong> solicitou alteração de perfil de acesso.</p>
            <table style="border-collapse:collapse;width:100%;margin:16px 0;">
              <tr><td style="padding:6px 0;color:#64748b;width:140px;">Matrícula</td><td><strong>${req.user!.matricula}</strong></td></tr>
              <tr><td style="padding:6px 0;color:#64748b;">Perfil atual</td><td>${req.user!.role}</td></tr>
              <tr><td style="padding:6px 0;color:#64748b;">Perfil solicitado</td><td><strong>${requestedRole}</strong></td></tr>
              <tr><td style="padding:6px 0;color:#64748b;">Justificativa</td><td>${reason ?? '—'}</td></tr>
            </table>
            <p style="color:#64748b;font-size:13px;">Acesse o painel de administração para aprovar ou ignorar esta solicitação.</p>
            <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
            <p style="color:#94a3b8;font-size:12px;">Portal Core Network Engineering — TIM Brasil</p>
        </div>`;
        await Promise.all(admins.map(email =>
            enfileirar(email, `[Portal CNE] Solicitação de perfil — ${req.user!.matricula}`, body)
        ));
        res.json({ message: 'Solicitação enviada aos administradores' });
    } catch {
        res.status(500).json({ message: 'Erro ao enviar solicitação' });
    }
}

export async function getUsers(_req: Request, res: Response) {
    try {
        const users = await listarUsers();
        res.json(users);
    } catch {
        res.status(500).json({ message: 'Erro ao buscar usuários' });
    }
}

export async function updateUserRole(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const { role } = req.body;
    const valid = ['admin', 'user', 'editor', 'moderador'];
    if (!valid.includes(role)) return res.status(400).json({ message: 'Role inválido' });
    try {
        await atualizarRole(Number(id), role);
        res.json({ message: 'Role atualizado' });
    } catch {
        res.status(500).json({ message: 'Erro ao atualizar role' });
    }
}

export async function deleteUser(req: AuthRequest, res: Response) {
    const { id } = req.params;
    if (req.user?.id === Number(id)) return res.status(400).json({ message: 'Não é possível remover a própria conta' });
    try {
        await removerUser(Number(id));
        res.json({ message: 'Usuário removido' });
    } catch {
        res.status(500).json({ message: 'Erro ao remover usuário' });
    }
}

export async function resetPassword(req: Request, res: Response) {
    const { token, password } = req.body;

    try {
        const user = await acharUserPorResetToken(token);

        if (!user) {
            return res.status(400).json({ message: "Link inválido ou expirado" });
        }

        await atualizarSenha(user.id!, password);

        res.json({ message: "Senha redefinida com sucesso" });
    } catch (error) {
        res.status(500).json({ message: "Erro ao redefinir senha" });
    }
}

export async function getPendingUsers(_req: Request, res: Response) {
    try {
        const users = await listarPendentes();
        res.json(users);
    } catch {
        res.status(500).json({ message: 'Erro ao buscar pendentes' });
    }
}

export async function approveUser(req: AuthRequest, res: Response) {
    const id = Number(req.params.id);
    try {
        const [rows]: any = await import('../config/database').then(m =>
            m.default.query('SELECT name, email, matricula FROM users WHERE id = ?', [id])
        );
        const user = rows[0];
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

        await aprovarUser(id);

        // Email de boas-vindas ao usuário aprovado
        await enfileirar(
            user.email,
            'Cadastro aprovado — Portal Core Engineering!',
            `<div style="font-family:sans-serif;max-width:480px;margin:auto;">
                <h2 style="color:#1e293b;">Olá, ${user.name}!</h2>
                <p>Seu cadastro no <strong>Portal Core Engineering</strong> foi <strong style="color:#16a34a;">aprovado</strong>.</p>
                <p>Acesse o portal com sua matrícula <strong>${user.matricula}</strong> e a senha cadastrada.</p>
                <a href="${process.env.FRONTEND_URL}/login"
                   style="display:inline-block;margin:16px 0;padding:12px 24px;background:#1e293b;color:#fff;border-radius:6px;text-decoration:none;font-weight:600;">
                    Acessar o Portal
                </a>
                <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
                <p style="color:#94a3b8;font-size:12px;">Portal Core Network Engineering — TIM Brasil</p>
            </div>`
        ).catch(() => {});

        res.json({ message: 'Usuário aprovado' });
    } catch {
        res.status(500).json({ message: 'Erro ao aprovar usuário' });
    }
}

export async function rejectUser(req: AuthRequest, res: Response) {
    const id = Number(req.params.id);
    try {
        const [rows]: any = await import('../config/database').then(m =>
            m.default.query('SELECT name, email FROM users WHERE id = ?', [id])
        );
        const user = rows[0];
        if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

        await recusarUser(id);

        // Email de notificação de recusa
        await enfileirar(
            user.email,
            'Cadastro não aprovado — Portal Core Engineering',
            `<div style="font-family:sans-serif;max-width:480px;margin:auto;">
                <h2 style="color:#1e293b;">Olá, ${user.name}</h2>
                <p>Infelizmente seu cadastro no <strong>Portal Core Engineering</strong> não foi aprovado.</p>
                <p>Para mais informações, entre em contato com o administrador do portal.</p>
                <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0;">
                <p style="color:#94a3b8;font-size:12px;">Portal Core Network Engineering — TIM Brasil</p>
            </div>`
        ).catch(() => {});

        res.json({ message: 'Usuário recusado' });
    } catch {
        res.status(500).json({ message: 'Erro ao recusar usuário' });
    }
}
