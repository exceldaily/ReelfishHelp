"use client";

import { useActionState, useState, useTransition } from "react";
import Image from "next/image";
import { Backpack, Plus, Star, Trash2, Eye, EyeOff, ShoppingCart, X } from "lucide-react";
import { createGear, deleteGear, toggleGearFlag, type GearFormResult } from "@/lib/actions/gear-actions";
import { GEAR_CATEGORIES } from "@/lib/constants";
import { Button, Card, Input, Label, Select, Textarea, FieldError, Badge, EmptyState } from "@/components/ui";
import type { GearItem } from "@/db/schema";

export function GearView({ items }: { items: GearItem[] }) {
  const [showForm, setShowForm] = useState(false);
  const [state, action, pending] = useActionState<GearFormResult, FormData>(createGear, undefined);
  const [, start] = useTransition();

  const owned = items.filter((i) => !i.wishlist);
  const wishlist = items.filter((i) => i.wishlist);
  const categories = [...new Set(owned.map((i) => i.category))];

  return (
    <div>
      <div className="flex justify-end mb-5 -mt-2">
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? <X className="size-4" /> : <Plus className="size-4" />}
          {showForm ? "Close" : "Add gear"}
        </Button>
      </div>

      {showForm && (
        <Card className="p-5 sm:p-6 mb-6 animate-fade-up">
          <form
            action={(fd) => {
              action(fd);
              setShowForm(true);
            }}
            className="grid sm:grid-cols-2 gap-4"
          >
            <div>
              <Label htmlFor="g-name">Name *</Label>
              <Input id="g-name" name="name" required placeholder='7&apos; Medium spinning rod' />
            </div>
            <div>
              <Label htmlFor="g-category">Category</Label>
              <Select id="g-category" name="category" defaultValue="rod">
                {GEAR_CATEGORIES.map((c) => (
                  <option key={c} value={c} className="capitalize">{c}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="g-brand">Brand</Label>
              <Input id="g-brand" name="brand" placeholder="St. Croix" />
            </div>
            <div>
              <Label htmlFor="g-model">Model</Label>
              <Input id="g-model" name="model" placeholder="Triumph TSR70MF" />
            </div>
            <div>
              <Label htmlFor="g-condition">Condition</Label>
              <Select id="g-condition" name="condition" defaultValue="good">
                <option value="new">New</option>
                <option value="good">Good</option>
                <option value="worn">Worn</option>
                <option value="needs repair">Needs repair</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="g-purchase">Purchase date (optional)</Label>
              <Input id="g-purchase" name="purchaseDate" type="date" />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="g-notes">Notes</Label>
              <Textarea id="g-notes" name="notes" className="min-h-16" placeholder="Line on it, what it's rigged for…" />
            </div>
            <div>
              <Label htmlFor="g-photo">Photo</Label>
              <input id="g-photo" name="photo" type="file" accept="image/*" className="text-sm" />
            </div>
            <div className="flex items-end flex-wrap gap-x-5 gap-y-2 text-sm font-semibold text-ink-700">
              <label className="flex items-center gap-2"><input type="checkbox" name="favorite" className="size-4 accent-bait-500" /> Favorite</label>
              <label className="flex items-center gap-2"><input type="checkbox" name="wishlist" className="size-4 accent-tide-500" /> Wishlist</label>
              <label className="flex items-center gap-2"><input type="checkbox" name="isPublic" className="size-4 accent-moss-500" /> Public</label>
            </div>
            <div className="sm:col-span-2">
              <FieldError>{state?.error}</FieldError>
              {state?.ok && <p className="text-sm font-semibold text-moss-600 mb-2">Added ✓</p>}
              <Button disabled={pending} className="w-full">{pending ? "Saving…" : "Save gear"}</Button>
            </div>
          </form>
        </Card>
      )}

      {items.length === 0 && !showForm && (
        <EmptyState
          icon={<Backpack />}
          title="Your gear locker is empty"
          body="Add rods, reels, tackle, and boats — or save recommended setups straight from any fish's catch guide."
          action={<Button onClick={() => setShowForm(true)}><Plus className="size-4" /> Add your first item</Button>}
        />
      )}

      {categories.map((cat) => (
        <section key={cat} className="mb-7">
          <h2 className="font-display text-lg font-bold text-ink-900 mb-3 capitalize">
            {cat}s <span className="text-ink-300 font-normal text-sm">({owned.filter((i) => i.category === cat).length})</span>
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {owned.filter((i) => i.category === cat).map((item) => (
              <GearCard key={item.id} item={item} onAction={start} />
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
              <GearCard key={item.id} item={item} onAction={start} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function GearCard({ item, onAction }: { item: GearItem; onAction: (fn: () => void) => void }) {
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
