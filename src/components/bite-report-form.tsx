"use client";

import { useActionState } from "react";
import { Camera } from "lucide-react";
import { createBiteReport, type BiteReportFormResult } from "@/lib/actions/bite-report-actions";
import { CATCH_METHODS } from "@/lib/constants";
import { Button, Card, FieldError, Input, Label, Select, Textarea } from "@/components/ui";
import { ImageInput } from "@/components/image-input";

export function BiteReportForm({
  boards,
  species,
  selectedBoardId,
}: {
  boards: { id: string; name: string; regionLabel: string }[];
  species: { id: string; name: string }[];
  selectedBoardId: string | null;
}) {
  const [state, action, pending] = useActionState<BiteReportFormResult, FormData>(createBiteReport, undefined);

  return (
    <Card className="p-5 sm:p-7">
      <form action={action} className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="boardId">Board / area</Label>
            <Select id="boardId" name="boardId" defaultValue={selectedBoardId ?? ""}>
              <option value="">No board yet</option>
              {boards.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} - {b.regionLabel}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="outcome">Outcome</Label>
            <Select id="outcome" name="outcome" defaultValue="caught">
              <option value="caught">Caught</option>
              <option value="missed">Missed</option>
              <option value="hooked">Hooked up</option>
              <option value="observed">Observed activity</option>
            </Select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="speciesId">Species</Label>
            <Select id="speciesId" name="speciesId" defaultValue="">
              <option value="">Choose species...</option>
              {species.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="customSpecies">Or type what you saw</Label>
            <Input id="customSpecies" name="customSpecies" placeholder="e.g. bait shower / unknown tuna" />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="bait">Bait or lure</Label>
            <Input id="bait" name="bait" placeholder="Shrimp, paddletail, jig..." />
          </div>
          <div>
            <Label htmlFor="method">Method</Label>
            <Select id="method" name="method" defaultValue="">
              <option value="">-</option>
              {CATCH_METHODS.map((m) => (
                <option key={m} value={m} className="capitalize">
                  {m}
                </option>
              ))}
              <option value="inshore">Inshore</option>
              <option value="offshore">Offshore</option>
              <option value="river">River</option>
              <option value="lake">Lake</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="timeOfDay">Time</Label>
            <Input id="timeOfDay" name="timeOfDay" placeholder="Dawn, incoming tide, 6 PM" />
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="broadAreaLabel">Broad area label</Label>
            <Input id="broadAreaLabel" name="broadAreaLabel" placeholder="Tampa Bay, north shore" />
          </div>
          <div>
            <Label htmlFor="tideSummary">Tide / water</Label>
            <Input id="tideSummary" name="tideSummary" placeholder="Incoming, stained, 2 ft vis" />
          </div>
          <div>
            <Label htmlFor="moonSummary">Moon / sky</Label>
            <Input id="moonSummary" name="moonSummary" placeholder="New moon, overcast" />
          </div>
        </div>

        <div>
          <Label htmlFor="notes">Short notes</Label>
          <Textarea id="notes" name="notes" placeholder="What was working? Keep spots broad; no exact dock, pin, or waypoint." />
        </div>

        <div>
          <Label htmlFor="photo">Optional photo</Label>
          <label className="flex items-center gap-3 rounded-xl border-2 border-dashed border-sand-300 hover:border-tide-400 px-4 py-4 cursor-pointer transition-colors">
            <Camera className="size-5 text-tide-600" />
            <span className="text-sm font-semibold text-ink-700">Add a photo</span>
            <ImageInput id="photo" name="photo" className="text-sm" />
          </label>
          <p className="mt-1 text-xs text-ink-300">Photos go through ReelFishHelp storage and EXIF/GPS stripping.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Label htmlFor="visibility" className="mb-0">Visibility</Label>
          <Select id="visibility" name="visibility" defaultValue="public_area" className="w-full sm:w-56">
            <option value="private">Private</option>
            <option value="followers">Followers only</option>
            <option value="public_area">Public - broad area</option>
            <option value="public_no_area">Public - no area</option>
          </Select>
          <p className="text-xs text-ink-500 sm:max-w-md">
            Public reports never show exact coordinates. Use broad regions like "south end" or "FL Gulf Coast."
          </p>
        </div>

        <FieldError>{state?.error}</FieldError>
        <Button size="lg" className="w-full" disabled={pending}>
          {pending ? "Posting report..." : "Report a bite"}
        </Button>
      </form>
    </Card>
  );
}
