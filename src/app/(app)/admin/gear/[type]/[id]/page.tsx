/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { getDb } from "@/db";
import { requireAdmin } from "@/lib/auth-helpers";
import { PageHeader, Card, Button, Label, Input, Textarea, Select, FieldError } from "@/components/ui";
import { TYPE_CFG, tableFor, isGearType, STATUS_OPTIONS, type FieldKind } from "@/lib/admin/gear-admin";
import { saveGearRow, deleteGearRow } from "@/lib/actions/admin-gear-actions";

export default async function AdminGearEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ type: string; id: string }>;
  searchParams: Promise<{ err?: string }>;
}) {
  await requireAdmin();
  const { type, id } = await params;
  const { err } = await searchParams;
  if (!isGearType(type)) notFound();
  const cfg = TYPE_CFG[type];
  const db = await getDb();
  const { table, idCol } = tableFor(type);
  const isNew = id === "new";
  const row = isNew ? null : ((await db.select().from(table as any).where(eq(idCol as any, id)))[0] as any);
  if (!isNew && !row) notFound();

  const dv = (name: string, kind: FieldKind) => {
    if (!row) return "";
    const v = row[name];
    if (kind === "json") return JSON.stringify(v ?? (name === "flags" || name === "body" ? {} : []), null, 2);
    return v == null ? "" : String(v);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <Link href={`/admin/gear/${type}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-tide-700 mb-2">
        <ArrowLeft className="size-4" /> {cfg.label}
      </Link>
      <PageHeader title={isNew ? `New ${cfg.label}` : String(row[cfg.titleField])} subtitle={cfg.label} />

      {err && <div className="mb-4"><FieldError>{err}</FieldError></div>}

      <Card className="p-5 sm:p-6">
        <form action={saveGearRow} className="space-y-4">
          <input type="hidden" name="__type" value={type} />
          <input type="hidden" name="__id" value={isNew ? "new" : String(row[cfg.idField])} />
          {cfg.fields.map((f) => (
            <div key={f.name}>
              <Label htmlFor={f.name}>{f.label}</Label>
              {f.kind === "textarea" ? (
                <Textarea id={f.name} name={f.name} defaultValue={dv(f.name, f.kind)} />
              ) : f.kind === "json" ? (
                <Textarea id={f.name} name={f.name} defaultValue={dv(f.name, f.kind)} className="font-mono text-xs min-h-28" />
              ) : f.kind === "number" ? (
                <Input id={f.name} name={f.name} type="number" step="any" defaultValue={dv(f.name, f.kind)} />
              ) : f.kind === "select" ? (
                <Select id={f.name} name={f.name} defaultValue={dv(f.name, f.kind)}>
                  {(f.options ?? []).map((o) => <option key={o} value={o}>{o}</option>)}
                </Select>
              ) : f.kind === "status" ? (
                <Select id={f.name} name={f.name} defaultValue={dv(f.name, f.kind) || "published"}>
                  {STATUS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </Select>
              ) : (
                <Input id={f.name} name={f.name} defaultValue={dv(f.name, f.kind)} required={f.required} />
              )}
            </div>
          ))}
          <div className="pt-2">
            <Button type="submit">{isNew ? "Create" : "Save changes"}</Button>
          </div>
        </form>

        {!isNew && (
          <form action={deleteGearRow} className="mt-5 pt-5 border-t border-sand-100">
            <input type="hidden" name="__type" value={type} />
            <input type="hidden" name="__id" value={String(row[cfg.idField])} />
            <Button type="submit" variant="danger" size="sm">Delete this item</Button>
          </form>
        )}
      </Card>
    </div>
  );
}
