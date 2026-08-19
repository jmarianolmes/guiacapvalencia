import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { sdk } from "./_core/sdk";
import { z } from "zod";
import * as authService from "./auth";
import * as db from "./db";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => {
      const user = opts.ctx.user;
      if (!user) return null;
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        isBlocked: user.isBlocked,
        isMaster: user.isMaster,
        mustChangePassword: user.mustChangePassword,
      };
    }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    register: publicProcedure
      .input(z.object({
        email: z.string().email("Email inválido"),
        password: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
        name: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        try {
          await authService.registerUser(input.email, input.password, input.name);
          return { 
            success: true, 
            message: "Usuário registrado com sucesso. Aguardando aprovação do administrador." 
          };
        } catch (error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error instanceof Error ? error.message : "Falha no registro",
          });
        }
      }),
    login: publicProcedure
      .input(z.object({
        email: z.string().email("Email inválido"),
        password: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        try {
          const user = await authService.authenticateUser(input.email, input.password);
          
          // Create session token using the same mechanism as OAuth
          const sessionToken = await sdk.createSessionToken(user.openId!, {
            name: (user.name || user.email) ?? "",
            expiresInMs: ONE_YEAR_MS,
          });

          // Set session cookie
          const cookieOptions = getSessionCookieOptions(ctx.req);
          ctx.res.cookie(COOKIE_NAME, sessionToken, { 
            ...cookieOptions, 
            maxAge: ONE_YEAR_MS 
          });

          return { 
            success: true, 
            user: {
              id: user.id,
              email: user.email || "",
              name: user.name || "",
              role: user.role,
              mustChangePassword: user.mustChangePassword,
            },
          };
        } catch (error) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: error instanceof Error ? error.message : "Falha no login",
          });
        }
      }),
    requestPasswordReset: publicProcedure
      .input(z.object({ email: z.string().email("Email inválido") }))
      .mutation(async ({ input }) => {
        try {
          const user = await authService.getUserByEmail(input.email);
          if (!user) {
            // Don't reveal if email exists
            return { 
              success: true, 
              message: "Se o email existe, um link de redefinição será enviado." 
            };
          }
          if (process.env.NODE_ENV !== "production") {
            const token = await authService.generatePasswordResetToken(user.id);
            console.log(`[Password reset - development] ${user.email}: ${token}`);
          }
          return {
            success: true,
            message: "Se o email existir, as instruções de redefinição foram preparadas."
          };
        } catch (error) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Falha ao processar solicitação de redefinição de senha",
          });
        }
      }),
    resetPassword: publicProcedure
      .input(z.object({
        token: z.string(),
        newPassword: z.string().min(6, "Senha deve ter no mínimo 6 caracteres"),
      }))
      .mutation(async ({ input }) => {
        try {
          await authService.resetPasswordWithToken(input.token, input.newPassword);
          return { 
            success: true, 
            message: "Senha redefinida com sucesso." 
          };
        } catch (error) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: error instanceof Error ? error.message : "Falha na redefinição de senha",
          });
        }
      }),
    changePassword: protectedProcedure
      .input(z.object({
        newPassword: z.string().min(8, "Senha deve ter no mínimo 8 caracteres"),
        currentPassword: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) {
          throw new TRPCError({ code: 'UNAUTHORIZED' });
        }
        try {
          await authService.changePasswordForUser(ctx.user.id, input.newPassword, input.currentPassword);
          return { success: true, message: 'Senha alterada com sucesso.' };
        } catch (error) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error instanceof Error ? error.message : 'Falha ao alterar a senha',
          });
        }
      }),
  }),

  guide: router({
    getSimulatorModels: publicProcedure.query(async () => {
      return await db.getAllSimulatorModels();
    }),

    getOfficialExamDates: publicProcedure.query(async () => {
      return await db.getOfficialExamDates();
    }),

    getOfficialExamAnalysis: protectedProcedure.query(async () => {
      return await db.getOfficialExamAnalysis();
    }),
    
    getSimulatorQuestions: protectedProcedure
      .input(z.object({ model: z.string() }))
      .query(async ({ input }) => {
        return await db.getSimulatorQuestionsByModel(input.model);
      }),

    getSimulatorChapters: protectedProcedure.query(async () => {
      return await db.getSimulatorChapters();
    }),

    getSimulatorQuestionsByChapter: protectedProcedure
      .input(z.object({ chapterId: z.string(), attemptNumber: z.number().int().min(1).default(1) }))
      .query(async ({ input }) => {
        return await db.getSimulatorQuestionsByChapter(input.chapterId, input.attemptNumber);
      }),
    
    getRepeatedQuestions: protectedProcedure.query(async () => {
      return await db.getRepeatedQuestions();
    }),
    
    getTricks: protectedProcedure.query(async () => {
      return await db.getTricks();
    }),
    
    getSiglas: protectedProcedure.query(async () => {
      return await db.getSiglas();
    }),
    
    getStats: publicProcedure.query(async () => {
      return await db.getSimulatorStats();
    }),
    
    saveSimulatorResult: protectedProcedure
      .input(z.object({
        model: z.string(),
        mode: z.enum(['statistical', 'official', 'chapter']),
        chapterId: z.string().optional(),
        attemptNumber: z.number().int().min(1).optional(),
        questionCount: z.number().int().min(1),
        correct: z.number(),
        wrong: z.number(),
        blank: z.number(),
        timeTaken: z.number(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) {
          throw new TRPCError({ code: "UNAUTHORIZED" });
        }
        return await db.saveSimulatorResult(ctx.user.id, input);
      }),
    
    getUserResults: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }
      return await db.getUserSimulatorResults(ctx.user.id);
    }),

    getStudyPlan: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
      return await db.getUserStudyPlan(ctx.user.id);
    }),
  }),

  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
      return await db.getUserStudyProfile(ctx.user.id);
    }),
    save: protectedProcedure
      .input(z.object({
        track: z.enum(['goods', 'passengers']),
        targetExamDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida').nullable(),
        dailyStudyMinutes: z.union([z.literal(40), z.literal(60), z.literal(90)]),
        planEnabled: z.boolean(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (!ctx.user?.id) throw new TRPCError({ code: "UNAUTHORIZED" });
        return await db.saveUserStudyProfile(ctx.user.id, input);
      }),
  }),

  admin: router({
    getStats: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      return await db.getAdminStats();
    }),
    
    getAllUsers: protectedProcedure.query(async ({ ctx }) => {
      if (ctx.user?.role !== 'admin') {
        throw new TRPCError({ code: 'FORBIDDEN' });
      }
      const users = await db.getAllUsers();
      return users.map(user => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isApproved: user.isApproved,
        isBlocked: user.isBlocked,
        isMaster: user.isMaster,
        mustChangePassword: user.mustChangePassword,
        createdAt: user.createdAt,
        lastSignedIn: user.lastSignedIn,
      }));
    }),

    createUser: protectedProcedure
      .input(z.object({
        email: z.string().trim().email('Email inválido'),
        temporaryPassword: z.string().min(8, 'A senha temporária deve ter no mínimo 8 caracteres'),
        name: z.string().trim().min(1, 'Nome inválido').max(120).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        try {
          const user = await authService.createUserByAdmin(input.email, input.temporaryPassword, input.name);
          return { success: true, user };
        } catch (error) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error instanceof Error ? error.message : 'Falha ao criar a conta',
          });
        }
      }),
    
    approveUser: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        return await db.approveUser(input.userId);
      }),
    
    blockUser: protectedProcedure
      .input(z.object({ userId: z.number(), blocked: z.boolean() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        try {
          return await db.blockUser(input.userId, input.blocked);
        } catch (error) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error instanceof Error ? error.message : 'Falha ao atualizar o bloqueio',
          });
        }
      }),

    resetUserPassword: protectedProcedure
      .input(z.object({
        userId: z.number(),
        temporaryPassword: z.string().min(8, 'A senha temporária deve ter no mínimo 8 caracteres'),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        try {
          return await authService.resetPasswordByAdmin(input.userId, input.temporaryPassword);
        } catch (error) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error instanceof Error ? error.message : 'Falha ao redefinir a senha',
          });
        }
      }),

    deleteUser: protectedProcedure
      .input(z.object({ userId: z.number() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== 'admin') {
          throw new TRPCError({ code: 'FORBIDDEN' });
        }
        if (ctx.user.id === input.userId) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'A própria conta administrativa não pode ser excluída nesta sessão' });
        }
        try {
          return await db.deleteUser(input.userId);
        } catch (error) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error instanceof Error ? error.message : 'Falha ao excluir a conta',
          });
        }
      }),
  }),

  // TODO: add feature routers here
});

export type AppRouter = typeof appRouter;
