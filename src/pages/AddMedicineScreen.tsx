/**
 * AddMedicineScreen — Form to add or edit a medicine.
 */

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/AppHeader";
import { getIcon } from "@/components/DynamicIcon";
import { CATEGORIES, MEDICINE_TYPES, FOOD_TIMINGS, FREQUENCIES, CATEGORY_MAP } from "@/lib/constants";
import type { MedicineType, MedicineCategory, FoodTiming, Frequency } from "@/lib/types";
import { Plus, Trash2, Clock, X, Check } from "lucide-react";
import { toast } from "sonner";

export default function AddMedicineScreen() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { addMedicine, updateMedicine, deleteMedicine, medicines } = useStore();
  const isEdit = Boolean(id);
  const existing = isEdit ? medicines.find((m) => m.id === id) : undefined;

  const [name, setName] = useState(existing?.name ?? "");
  const [type, setType] = useState<MedicineType>(existing?.type ?? "tablet");
  const [category, setCategory] = useState<MedicineCategory>(existing?.category ?? "general");
  const [dosage, setDosage] = useState(existing?.dosage ?? "");
  const [foodTiming, setFoodTiming] = useState<FoodTiming>(existing?.foodTiming ?? "after-food");
  const [startDate, setStartDate] = useState(existing?.startDate ?? new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(existing?.endDate ?? "");
  const [frequency, setFrequency] = useState<Frequency>(existing?.frequency ?? "once-daily");
  const [reminderTimes, setReminderTimes] = useState<string[]>(existing?.reminderTimes ?? ["08:00"]);
  const [quantity, setQuantity] = useState(existing?.initialQuantity ?? 30);
  const [notes, setNotes] = useState(existing?.notes ?? "");
  const [showDelete, setShowDelete] = useState(false);

  useEffect(() => {
    if (isEdit && !existing) navigate("/medicines");
  }, [isEdit, existing, navigate]);

  const handleAddTime = () => setReminderTimes([...reminderTimes, "12:00"]);
  const handleRemoveTime = (idx: number) => setReminderTimes(reminderTimes.filter((_, i) => i !== idx));
  const handleTimeChange = (idx: number, val: string) => {
    const updated = [...reminderTimes];
    updated[idx] = val;
    setReminderTimes(updated);
  };

  const handleSubmit = () => {
    if (!name.trim() || !dosage.trim()) {
      toast.error("Please fill in medicine name and dosage");
      return;
    }
    if (reminderTimes.length === 0) {
      toast.error("Add at least one reminder time");
      return;
    }

    const sortedTimes = [...reminderTimes].sort();

    if (isEdit && existing) {
      updateMedicine(existing.id, {
        name, type, category, dosage, foodTiming,
        startDate, endDate: endDate || null,
        frequency, reminderTimes: sortedTimes,
        initialQuantity: quantity,
        remainingQuantity: existing.remainingQuantity,
        notes, isActive: true,
      });
      toast.success("Medicine updated successfully");
    } else {
      addMedicine({
        name, type, category, dosage, foodTiming,
        startDate, endDate: endDate || null,
        frequency, reminderTimes: sortedTimes,
        initialQuantity: quantity,
        remainingQuantity: quantity,
        notes, imageUrl: null, isActive: true,
      });
      toast.success("Medicine added successfully");
    }
    navigate("/medicines");
  };

  const handleDelete = () => {
    if (existing) {
      deleteMedicine(existing.id);
      toast.success("Medicine deleted");
      navigate("/medicines");
    }
  };

  return (
    <div>
      <AppHeader
        title={isEdit ? "Edit Medicine" : "Add Medicine"}
        subtitle={isEdit ? "Update medicine details" : "Add a new medication to your list"}
        onBack={() => navigate("/medicines")}
        right={
          isEdit ? (
            <button onClick={() => setShowDelete(true)} className="flex h-9 w-9 items-center justify-center rounded-xl bg-danger/10">
              <Trash2 className="h-4.5 w-4.5 text-danger" />
            </button>
          ) : undefined
        }
      />

      <div className="px-5 mt-3 pb-32 space-y-5">
        {/* Medicine Name */}
        <FormSection label="Medicine Name">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Paracetamol"
            className="form-input"
          />
        </FormSection>

        {/* Medicine Type */}
        <FormSection label="Medicine Type">
          <div className="grid grid-cols-5 gap-2">
            {MEDICINE_TYPES.map((t) => {
              const Icon = getIcon(t.icon);
              return (
                <button
                  key={t.id}
                  onClick={() => setType(t.id)}
                  className={`flex flex-col items-center gap-1.5 rounded-xl py-3 transition-all active:scale-95 ${
                    type === t.id
                      ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                      : "bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-[9px] font-medium">{t.label}</span>
                </button>
              );
            })}
          </div>
        </FormSection>

        {/* Category */}
        <FormSection label="Category">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = getIcon(cat.icon);
              return (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.id)}
                  className={`flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition-all active:scale-95 ${
                    category === cat.id
                      ? `${cat.bgClass} ${cat.textClass} ring-2`
                      : "bg-white/60 dark:bg-slate-800/60 text-muted-foreground border border-slate-200 dark:border-slate-700"
                  }`}
                  style={category === cat.id ? { boxShadow: `0 0 0 2px ${cat.color}40` } : undefined}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </FormSection>

        {/* Dosage */}
        <FormSection label="Dosage">
          <input
            type="text"
            value={dosage}
            onChange={(e) => setDosage(e.target.value)}
            placeholder="e.g. 500 mg"
            className="form-input"
          />
        </FormSection>

        {/* Food Timing */}
        <FormSection label="Food Timing">
          <div className="grid grid-cols-2 gap-2">
            {FOOD_TIMINGS.map((ft) => {
              const Icon = getIcon(ft.icon);
              return (
                <button
                  key={ft.id}
                  onClick={() => setFoodTiming(ft.id)}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all active:scale-95 ${
                    foodTiming === ft.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-muted-foreground"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {ft.label}
                </button>
              );
            })}
          </div>
        </FormSection>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-3">
          <FormSection label="Start Date">
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="form-input" />
          </FormSection>
          <FormSection label="End Date">
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="form-input" />
          </FormSection>
        </div>

        {/* Frequency */}
        <FormSection label="Frequency">
          <div className="flex flex-wrap gap-2">
            {FREQUENCIES.map((f) => (
              <button
                key={f.id}
                onClick={() => setFrequency(f.id)}
                className={`rounded-full px-3.5 py-2 text-xs font-semibold transition-all active:scale-95 ${
                  frequency === f.id
                    ? "bg-primary text-primary-foreground"
                    : "bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-muted-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </FormSection>

        {/* Reminder Times */}
        <FormSection label="Reminder Times">
          <div className="space-y-2">
            {reminderTimes.map((time, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="flex items-center gap-2 flex-1 rounded-xl bg-white/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-3.5 py-2.5">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => handleTimeChange(i, e.target.value)}
                    className="flex-1 bg-transparent text-sm text-foreground focus:outline-none"
                  />
                </div>
                {reminderTimes.length > 1 && (
                  <button
                    onClick={() => handleRemoveTime(i)}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger/10 active:scale-90 transition-transform"
                  >
                    <X className="h-4 w-4 text-danger" />
                  </button>
                )}
              </div>
            ))}
            <button
              onClick={handleAddTime}
              className="flex items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 w-full py-2.5 text-sm font-medium text-muted-foreground active:scale-[0.98] transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Time
            </button>
          </div>
        </FormSection>

        {/* Quantity */}
        <FormSection label={`Initial Quantity: ${quantity}`}>
          <input
            type="range"
            min="1"
            max="120"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
            <span>1</span>
            <span>120</span>
          </div>
        </FormSection>

        {/* Notes */}
        <FormSection label="Notes (optional)">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Special instructions, side effects, etc."
            rows={3}
            className="form-input resize-none"
          />
        </FormSection>

        {/* Submit */}
        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={handleSubmit}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 sticky bottom-24"
        >
          <Check className="h-5 w-5" />
          {isEdit ? "Save Changes" : "Add Medicine"}
        </motion.button>
      </div>

      {/* Delete confirmation */}
      {showDelete && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowDelete(false)}>
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-strong rounded-3xl p-6 m-5 w-full max-w-sm"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-danger/10 mx-auto mb-4">
              <Trash2 className="h-7 w-7 text-danger" />
            </div>
            <h3 className="text-lg font-bold text-center text-foreground">Delete Medicine?</h3>
            <p className="text-sm text-muted-foreground text-center mt-2">
              This will permanently remove "{existing?.name}" and all its logs.
            </p>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setShowDelete(false)}
                className="flex-1 rounded-xl bg-muted py-3 text-sm font-semibold text-foreground"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-danger py-3 text-sm font-semibold text-white"
              >
                Delete
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <style>{`
        .form-input {
          width: 100%;
          border-radius: 0.75rem;
          background: hsl(var(--muted) / 0.5);
          border: 1px solid hsl(var(--border));
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: hsl(var(--foreground));
          outline: none;
          transition: all 0.2s;
        }
        .form-input:focus {
          border-color: hsl(var(--primary));
          box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2);
        }
      `}</style>
    </div>
  );
}

function FormSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-2">{label}</label>
      {children}
    </div>
  );
}
