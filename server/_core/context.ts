import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { sdk } from "./sdk";
import { getDemoUser, isDemoMode } from "../demoData";
import { getPublicAccessEnabled } from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  if (!user && isDemoMode()) {
    user = getDemoUser();
  }
  // A guia historicamente permite leitura sem login em produção. Usuários
  // autenticados continuam usando sua própria sessão e seus dados pessoais.
  if (!user && (process.env.NODE_ENV === 'production' || await getPublicAccessEnabled())) {
    user = { ...getDemoUser(), openId: 'public-guest', name: 'Visitante' };
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
