import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, apiPut } from "@/lib/api";
import { useLang } from "@/lib/i18n";
import { queryClient } from "@/lib/queryClient";
import type { Application, InterviewInput, InterviewMode } from "@/lib/types";

const MAX_SLOTS = 5;

function localInput(d: Date): string {
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function InterviewDialog({
  application,
  onClose,
}: {
  application: Application;
  onClose: () => void;
}) {
  const { t } = useLang();
  const [mode, setMode] = useState<InterviewMode>(application.interview?.mode ?? "online");
  const [location, setLocation] = useState(application.interview?.location ?? "");
  const [note, setNote] = useState(application.interview?.note ?? "");
  const [slots, setSlots] = useState<string[]>([""]);
  const min = localInput(new Date());

  const filled = slots.filter((s) => s && !Number.isNaN(new Date(s).getTime()));
  const valid = location.trim().length >= 2 && filled.length > 0;

  const send = useMutation({
    mutationFn: () => {
      const body: InterviewInput = {
        mode,
        location: location.trim(),
        note: note.trim(),
        slots: filled.map((s) => new Date(s).toISOString()),
      };
      return apiPut<Application>(`/employer/applications/${application.id}/interview`, body);
    },
    onSuccess: () => {
      toast.success(t("iv.sent"));
      queryClient.invalidateQueries({ queryKey: ["employer-applications"] });
      onClose();
    },
    onError: (err) => {
      const detail = err instanceof ApiError ? (err.body as { detail?: unknown })?.detail : null;
      toast.error(typeof detail === "string" ? detail : t("iv.failed"));
    },
  });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent data-testid="interview-dialog">
        <DialogHeader>
          <DialogTitle>
            {t("iv.title")} — {application.student_name}
          </DialogTitle>
          <DialogDescription>{t("iv.desc")}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="iv-mode">{t("iv.mode")}</Label>
            <select
              id="iv-mode"
              value={mode}
              onChange={(e) => setMode(e.target.value as InterviewMode)}
              data-testid="interview-mode-select"
              className="mt-1.5 h-9 w-full rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="online">{t("iv.online")}</option>
              <option value="on_location">{t("iv.onLocation")}</option>
            </select>
          </div>

          <div>
            <Label htmlFor="iv-location">{mode === "online" ? t("iv.locationOnline") : t("iv.locationOn")}</Label>
            <Input
              id="iv-location"
              value={location}
              maxLength={300}
              onChange={(e) => setLocation(e.target.value)}
              data-testid="interview-location-input"
              className="mt-1.5"
            />
          </div>

          <div>
            <Label>{t("iv.slots")}</Label>
            <div className="mt-1.5 space-y-2">
              {slots.map((value, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    type="datetime-local"
                    min={min}
                    value={value}
                    onChange={(e) => setSlots((all) => all.map((s, j) => (j === i ? e.target.value : s)))}
                    data-testid={`interview-slot-input-${i}`}
                  />
                  {slots.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label={t("iv.removeSlot")}
                      onClick={() => setSlots((all) => all.filter((_, j) => j !== i))}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {slots.length < MAX_SLOTS && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-2 gap-1.5"
                onClick={() => setSlots((all) => [...all, ""])}
                data-testid="interview-add-slot-button"
              >
                <Plus className="h-4 w-4" /> {t("iv.addSlot")}
              </Button>
            )}
          </div>

          <div>
            <Label htmlFor="iv-note">{t("iv.note")}</Label>
            <Textarea
              id="iv-note"
              rows={3}
              value={note}
              maxLength={1000}
              onChange={(e) => setNote(e.target.value)}
              data-testid="interview-note-input"
              className="mt-1.5"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="interview-cancel-button">
            {t("common.cancel")}
          </Button>
          <Button
            onClick={() => send.mutate()}
            disabled={!valid || send.isPending}
            data-testid="interview-submit-button"
          >
            {send.isPending ? t("iv.sending") : t("iv.send")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
