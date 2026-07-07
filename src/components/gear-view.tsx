"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { Backpack, Plus, Star, Trash2, Eye, EyeOff, ShoppingCart, X, Pencil } from "lucide-react";
import { saveGear, deleteGear, toggleGearFlag, type GearFormResult } from "@/lib/actions/gear-actions";
import { GEAR_CATEGORIES } from "@/lib/constants";
import { Button, Card, Input, Label, Select, Textarea, FieldError, Badge, EmptyState } from "@/components/ui";
import { ImageInput } from "@/components/image-input";
import type { GearItem } from "@/db/schema";

export function GearView({ items }: { items: GearItem[] }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<GearItem | null>(null);
  const [state, action, pending] = useActionState<GearFormResult, FormData>(saveGear, undefined);
  const [, start] = useTransition();
  const formRef = useRef<HTMLDivElement>(null);

  // when the save succeeds, drop out of edit mode and close the form
  useEffect(() => {
    if (state?.ok) {
      setEditing(null);
      setShowForm(false);
    }
  }, [state?.ok]);

  function openEdit(item: GearItem) {
    setEditing(item);
    setShowForm(true);
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  }

  function openAdd() {
    setEditing(null);
    setShowForm((v) => !v);
  }

  const owned = items.filter((i) => !i.wishlist);
  const wishlist = items.filter((i) => i.wishlist);
  const categories = [...new Set(owned.map((i) => i.category))];

  return (
    <div>
      <div className="flex justify-end mb-5 -mt-2">
        <Button onClick={openAdd}>
          {showForm && !editing ? <X className="size-4" /> : <Plus className="size-4" />}
          {showForm && !editing ? "Close" : "Add gear"}
        </Button>
      </div>

      {showForm && (
        <Card ref={formRef} className="p-5 sm:p-6 mb-6 animate-fade-up scroll-mt-20">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-bold text-ink-900">
              {editing ? `Edit: ${editing.name}` : "Add gear"}
            </h2>
            <button
              onClick={() => {
                setShowForm(false);
                setEditing(null);
              }}
              className="text-ink-300 hover:text-ink-700"
              aria-label="Close form"
            >
              <X className="size-5" />
            </button>
          </div>
          {/* key forces the form to remount (and re-read defaultValues) when the target changes */}
          <form key={editing?.id ?? "new"} action={action} className="grid sm:grid-cols-2 gap-4">
            {editing && <input type="hidden" name="id" value={editing.id} />}
            <div>
              <Label htmlFor="g-name">Name *</Label>
              <Input id="g-name" name="name" required defaultValue={editing?.name ?? ""} placeholder='7&apos; Medium spinning rod' />
            </div>
            <div>
              <Label htmlFor="g-category">Category</Label>
              <Select id="g-category" name="category" defaultValue={editing?.category ?? "rod"}>
                {GEAR_CATEGORIES.map((c) => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="g-brand">Brand</Label>
              <Input id="g-brand" name="brand" defaultValue={editing?.brand ?? ""} placeholder="St. Croix" />
            </div>
            <div>
              <Label htmlFor="g-model">Model</Label>
              <Input id="g-model" name="model" defaultValue={editing?.model ?? ""} placeholder="Triumph TSR70MF" />
            </div>
            <div>
              <Label htmlFor="g-condition">Condition</Label>
              <Select id="g-condition" name="condition" defaultValue={editing?.condition ?? "good"}>
                <option value="new">New</option>
                <option value="good">Good</option>
                <option value="worn">Worn</option>
                <option value="needs repair">Needs repair</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="g-purchase">Purchase date (optional)</Label>
              <Input id="g-purchase" name="purchaseDate" type="date" defaultValue={editing?.purchaseDate ?? ""} />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="g-notes">Notes</Label>
              <Textarea id="g-notes" name="notes" className="min-h-16" defaultValue={editing?.notes ?? ""} placeholder="Line on it, what it's rigged for…" />
            </div>
            <div>
              <Label htmlFor="g-photo">Photo{editing?.photoUrl ? " (upload to replace)" : ""}</Label>
              <ImageInput id="g-photo" name="photo" className="text-sm" />
              {editing?.photoUrl && (
                <div className="relative size-14 rounded-lg overflow-hidden bg-sand-100 mt-1.5">
                  <Image src={editing.photoUrl} alt="" fill sizes="56px" className="object-cover" unoptimized={editing.photoUrl.startsWith("/api/")} />
                </div>
              )}
            </div>
            <div className="flex items-end flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-ink-700">
              <label className="flex items-center gap-2"><input type="checkbox" name="favorite" defaultChecked={editing?.favorite ?? false} className="size-4 accent-bait-500" /> Favorite</label>
              <label className="flex items-center gap-2"><input type="checkbox" name="wishlist" defaultChecked={editing?.wishlist ?? false} className="size-4 accent-tide-500" /> Wishlist</label>
              <label className="flex items-center gap-2"><input type="checkbox" name="isPublic" defaultChecked={editing?.isPublic ?? false} className="size-4 accent-moss-500" /> Public</label>
            </div>
            <div className="sm:col-span-2">
              <FieldError>{state?.error}</FieldError>
              <Button disabled={pending} className="w-full">
                {pending ? "Saving…" : editing ? "Save changes" : "Save gear"}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {items.length === 0 && !showForm && (
        <EmptyState
          icon={<Backpack />}
          title="Your gear locker is empty"
          body="Add rods, reels, tackle, and boats — or save recommended setups straight from any fish's catch guide."
          action={<Button onClick={openAdd}><Plus className="size-4" /> Add your first item</Button>}
        />
      )}

      {categories.map((cat) => (
        <section key={cat} className="mb-7">
          <h2 className="font-display text-lg font-bold text-ink-900 mb-3 capitalize">
            {cat}s <span className="text-ink-300 font-normal text-sm">({owned.filter((i) => i.category === cat).length})</span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {owned.filter((i) => i.category === cat).map((item) => (
              <GearCard key={item.id} item={item} onAction={start} onEdit={openEdit} />
            ))}
          </div>
        </section>
      ))}

      {wishlist.length > 0 && (
        <section className="mb-7">
          <h2 className="font-display text-lg font-bold text-ink-900 mb-3 flex items-center gap-2">
            <ShoppingCart className="size-5 text-bait-500" /> Wishlist
            <span className="text-ink-300 font-normal text-sm">({wishlist.length})</span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {wishlist.map((item) => (
              <GearCard key={item.id} item={item} onAction={start} onEdit={openEdit} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function GearCard({
  item,
  onAction,
  onEdit,
}: {
  item: GearItem;
  onAction: (fn: () => void) => void;
  onEdit: (item: GearItem) => void;
}) {
  return (
    <Card className="p-4 flex gap-3">
      {item.photoUrl && (
        <div className="relative size-16 rounded-xl overflow-hidden bg-sand-100 shrink-0">
          <Image src={item.photoUrl} alt={item.name} fill sizes="64px" className="object-cover" unoptimized={item.photoUrl.startsWith("/api/")} />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-sm text-ink-900 leading-tight">{item.name}</h3>
          <button
            onClick={() => onAction(() => { toggleGearFlag(item.id, "favorite"); })}
            aria-label="Toggle favorite"
            className="shrink-0"
          >
            <Star className={`size-4 ${item.favorite ? "fill-bait-400 text-bait-400" : "text-sand-300 hover:text-bait-400"}`} />
          </button>
        </div>
        <div className="text-xs text-ink-500 mt-0.5">
          {[item.brand, item.model].filter(Boolean).join(" · ") || <span className="capitalize">{item.category}</span>}
        </div>
        <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
          {item.condition && <Badge variant="outline" className="capitalize">{item.condition}</Badge>}
          {item.wishlist && <Badge variant="orange">Wishlist</Badge>}
        </div>
        {item.notes && <p className="mt-1.5 text-xs text-ink-500 line-clamp-3 whitespace-pre-line">{item.notes}</p>}
        <div className="mt-2 flex items-center gap-3 text-xs text-ink-300">
          <button
            onClick={() => onAction(() => { toggleGearFlag(item.id, "isPublic"); })}
            className="inline-flex items-center gap-1 hover:text-ink-700"
          >
            {item.isPublic ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
            {item.isPublic ? "Public" : "Private"}
          </button>
          <button
            onClick={() => onEdit(item)}
            className="inline-flex items-center gap-1 hover:text-tide-700"
          >
            <Pencil className="size-3.5" /> Edit
          </button>
          <button
            onClick={() => onAction(() => { deleteGear(item.id); })}
            className="inline-flex items-center gap-1 hover:text-red-600 ml-auto"
          >
            <Trash2 className="size-3.5" /> Remove
          </button>
        </div>
      </div>
    </Card>
  );
}
