import { NextResponse } from "next/server";
import { db } from "@/lib/supabase/admin";

/**
 * Tarea programada diaria (Vercel Cron, ver vercel.json): hace una consulta mínima a la base de datos
 * para que el plan gratuito de Supabase no pause el proyecto por inactividad.
 * Si existe CRON_SECRET, Vercel la envía como "Authorization: Bearer <CRON_SECRET>".
 */
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  const { error } = await db().from("submissions").select("id", { count: "exact", head: true });
  if (error) {
    console.error("[keepalive] la consulta falló", error.message);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
  return NextResponse.json({ ok: true, at: new Date().toISOString() });
}
