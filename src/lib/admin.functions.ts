import { createServerFn } from "@tanstack/react-start";
import type { SupabaseClient } from "@supabase/supabase-js";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Database } from "@/integrations/supabase/types";

type SbClient = SupabaseClient<Database>;

// ---------- utilities ----------

function generatePassword(len = 14): string {
  const alphabet =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < len; i++) out += alphabet[bytes[i] % alphabet.length];
  return out;
}

async function assertRole(
  supabase: SbClient,
  userId: string,
  role: "super_admin" | "admin_ecole",
) {
  const { data, error } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", role)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Forbidden");
}



// ---------- bootstrap super admin ----------

export const bootstrapSuperAdmin = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { count, error: cErr } = await supabaseAdmin
      .from("user_roles")
      .select("*", { count: "exact", head: true })
      .eq("role", "super_admin");
    if (cErr) throw new Error(cErr.message);
    if ((count ?? 0) > 0) throw new Error("Un super admin existe déjà.");
    const { error } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: context.userId, role: "super_admin" });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ---------- super admin: schools ----------

export const listSchools = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertRole(context.supabase, context.userId, "super_admin");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("schools")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return data ?? [];
  });

export const activateSchool = createServerFn({ method: "POST" })
  .inputValidator((d: { schoolId: string }) => d)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertRole(context.supabase, context.userId, "super_admin");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: school, error: sErr } = await supabaseAdmin
      .from("schools")
      .select("*")
      .eq("id", data.schoolId)
      .maybeSingle();
    if (sErr) throw new Error(sErr.message);
    if (!school) throw new Error("École introuvable");
    if (school.status === "active" && school.admin_user_id)
      throw new Error("École déjà activée");

    const tempPassword = generatePassword(14);

    // Créer (ou récupérer) l'utilisateur admin école
    const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
      email: school.contact_email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        display_name: school.contact_name,
        role: "admin_ecole",
        school_id: school.id,
      },
    });

    let userId = created?.user?.id;
    if (cErr) {
      // Si l'email existe déjà, on tente de le retrouver via listUsers
      const msg = cErr.message.toLowerCase();
      if (!msg.includes("registered") && !msg.includes("exists"))
        throw new Error(cErr.message);
      const { data: list, error: lErr } = await supabaseAdmin.auth.admin.listUsers();
      if (lErr) throw new Error(lErr.message);
      const found = list.users.find(
        (u) => u.email?.toLowerCase() === school.contact_email.toLowerCase(),
      );
      if (!found) throw new Error("Impossible de retrouver l'utilisateur existant");
      userId = found.id;
      // Reset son mot de passe pour qu'on puisse le transmettre
      const { error: upErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: tempPassword,
      });
      if (upErr) throw new Error(upErr.message);
    }
    if (!userId) throw new Error("Création du compte impossible");

    // Rôle admin école (upsert)
    await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", userId);
    const { error: rErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: "admin_ecole" });
    if (rErr) throw new Error(rErr.message);

    // Rattacher le profil à l'école
    await supabaseAdmin
      .from("profiles")
      .upsert({
        id: userId,
        display_name: school.contact_name,
        school_id: school.id,
      });

    // Activer l'école
    const { error: uErr } = await supabaseAdmin
      .from("schools")
      .update({
        status: "active",
        admin_user_id: userId,
        activated_at: new Date().toISOString(),
      })
      .eq("id", school.id);
    if (uErr) throw new Error(uErr.message);

    return {
      ok: true as const,
      email: school.contact_email,
      password: tempPassword,
    };
  });

export const rejectSchool = createServerFn({ method: "POST" })
  .inputValidator((d: { schoolId: string }) => d)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertRole(context.supabase, context.userId, "super_admin");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("schools")
      .update({ status: "rejected" })
      .eq("id", data.schoolId);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

// ---------- admin école ----------

function slug(v: string) {
  return v
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

export const getMySchool = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertRole(context.supabase, context.userId, "admin_ecole");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: school } = await supabaseAdmin
      .from("schools")
      .select("*")
      .eq("admin_user_id", context.userId)
      .maybeSingle();
    if (!school) throw new Error("Aucune école rattachée");

    const { data: members } = await supabaseAdmin
      .from("profiles")
      .select("id, display_name, school_id")
      .eq("school_id", school.id);

    const memberIds = (members ?? []).map((m) => m.id);
    let roles: { user_id: string; role: string }[] = [];
    if (memberIds.length) {
      const { data } = await supabaseAdmin
        .from("user_roles")
        .select("user_id, role")
        .in("user_id", memberIds);
      roles = data ?? [];
    }

    const { data: classes } = await supabaseAdmin
      .from("classes")
      .select("id, name, join_code, owner_id, created_at")
      .eq("school_id", school.id)
      .order("created_at", { ascending: false });

    const classIds = (classes ?? []).map((c) => c.id);
    let membership: { class_id: string; user_id: string }[] = [];
    if (classIds.length) {
      const { data } = await supabaseAdmin
        .from("class_members")
        .select("class_id, user_id")
        .in("class_id", classIds);
      membership = data ?? [];
    }

    const enrichedClasses = (classes ?? []).map((c) => ({
      ...c,
      student_count: membership.filter((m) => m.class_id === c.id).length,
      owner_name:
        (members ?? []).find((m) => m.id === c.owner_id)?.display_name ?? "—",
    }));

    const enrichedMembers = (members ?? []).map((m) => ({
      ...m,
      role: roles.find((r) => r.user_id === m.id)?.role ?? null,
    }));

    return {
      school,
      members: enrichedMembers,
      classes: enrichedClasses,
      totals: {
        formateurs: enrichedMembers.filter((m) => m.role === "formateur").length,
        eleves: enrichedMembers.filter((m) => m.role === "eleve").length,
        classes: enrichedClasses.length,
      },
    };
  });

export const createFormateur = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { email: string; password?: string; displayName: string }) => d,
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    await assertRole(context.supabase, context.userId, "admin_ecole");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: school } = await supabaseAdmin
      .from("schools")
      .select("id, name")
      .eq("admin_user_id", context.userId)
      .maybeSingle();
    if (!school) throw new Error("Aucune école rattachée");

    const password = data.password?.trim() || generatePassword(12);

    const { data: created, error: cErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password,
      email_confirm: true,
      user_metadata: {
        display_name: data.displayName,
        role: "formateur",
        school_id: school.id,
      },
    });
    if (cErr) throw new Error(cErr.message);
    const uid = created?.user?.id;
    if (!uid) throw new Error("Création impossible");

    await supabaseAdmin.from("user_roles").delete().eq("user_id", uid);
    await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: uid, role: "formateur" });
    await supabaseAdmin
      .from("profiles")
      .upsert({ id: uid, display_name: data.displayName, school_id: school.id });

    return { ok: true as const, email: data.email, password };
  });

// ---------- classes & élèves ----------

async function requireMySchool(supabase: SbClient, userId: string) {
  await assertRole(supabase, userId, "admin_ecole");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: school } = await supabaseAdmin
    .from("schools")
    .select("id, name")
    .eq("admin_user_id", userId)
    .maybeSingle();
  if (!school) throw new Error("Aucune école rattachée");
  return { school, supabaseAdmin };
}

export const createSchoolClass = createServerFn({ method: "POST" })
  .inputValidator((d: { name: string }) => d)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { school, supabaseAdmin } = await requireMySchool(
      context.supabase,
      context.userId,
    );
    const name = data.name.trim();
    if (name.length < 1) throw new Error("Nom de classe requis");
    const joinCode = generatePassword(6).toUpperCase();
    const { error } = await supabaseAdmin.from("classes").insert({
      name,
      owner_id: context.userId,
      school_id: school.id,
      join_code: joinCode,
    });
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const deleteSchoolClass = createServerFn({ method: "POST" })
  .inputValidator((d: { classId: string }) => d)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { school, supabaseAdmin } = await requireMySchool(
      context.supabase,
      context.userId,
    );
    const { error } = await supabaseAdmin
      .from("classes")
      .delete()
      .eq("id", data.classId)
      .eq("school_id", school.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

export const createStudents = createServerFn({ method: "POST" })
  .inputValidator(
    (d: { classId: string; count: number; prefix: string }) => d,
  )
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { school, supabaseAdmin } = await requireMySchool(
      context.supabase,
      context.userId,
    );
    const count = Math.max(1, Math.min(60, Math.floor(data.count)));
    const prefix = slug(data.prefix || "eleve");

    const { data: klass, error: kErr } = await supabaseAdmin
      .from("classes")
      .select("id, name, school_id")
      .eq("id", data.classId)
      .eq("school_id", school.id)
      .maybeSingle();
    if (kErr) throw new Error(kErr.message);
    if (!klass) throw new Error("Classe introuvable");

    const schoolSlug = slug(school.name) || school.id.slice(0, 8);
    const stamp = Date.now().toString(36).slice(-4);
    const created: { username: string; email: string; password: string }[] = [];

    for (let i = 1; i <= count; i++) {
      const num = String(i).padStart(2, "0");
      const username = `${prefix}-${num}-${stamp}`;
      const email = `${username}@${schoolSlug}.eleve.local`;
      const password = generatePassword(10);
      const { data: u, error: uErr } = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          display_name: `${prefix} ${num}`,
          role: "eleve",
          school_id: school.id,
          class_id: klass.id,
        },
      });
      if (uErr) throw new Error(`${username}: ${uErr.message}`);
      const uid = u?.user?.id;
      if (!uid) throw new Error("Création impossible");
      await supabaseAdmin.from("user_roles").delete().eq("user_id", uid);
      await supabaseAdmin
        .from("user_roles")
        .insert({ user_id: uid, role: "eleve" });
      await supabaseAdmin.from("profiles").upsert({
        id: uid,
        display_name: `${prefix} ${num}`,
        school_id: school.id,
      });
      await supabaseAdmin
        .from("class_members")
        .insert({ class_id: klass.id, user_id: uid });
      created.push({ username, email, password });
    }
    return { ok: true as const, students: created };
  });

export const requestSchoolUpgrade = createServerFn({ method: "POST" })
  .inputValidator((d: { message: string }) => d)
  .middleware([requireSupabaseAuth])
  .handler(async ({ context, data }) => {
    const { school, supabaseAdmin } = await requireMySchool(
      context.supabase,
      context.userId,
    );
    const { error } = await supabaseAdmin
      .from("schools")
      .update({
        upgrade_requested_at: new Date().toISOString(),
        upgrade_message: data.message.slice(0, 2000),
      })
      .eq("id", school.id);
    if (error) throw new Error(error.message);
    return { ok: true as const };
  });

