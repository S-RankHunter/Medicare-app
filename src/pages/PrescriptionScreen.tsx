/**
 * PrescriptionScreen — Upload, view and manage prescriptions.
 */

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/lib/store";
import { AppHeader } from "@/components/AppHeader";
import { Plus, FileText, Trash2, X, Upload, Calendar, User, Hospital, Eye } from "lucide-react";
import type { Prescription } from "@/lib/types";

export default function PrescriptionScreen() {
  const { prescriptions, addPrescription, deletePrescription } = useStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [viewPrescription, setViewPrescription] = useState<Prescription | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    doctorName: "",
    hospitalName: "",
    date: new Date().toISOString().split("T")[0],
    expiryDate: "",
    notes: "",
    medicineName: "",
    fileUrl: "",
    fileType: "image" as "image" | "pdf",
    fileName: "",
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setForm((f) => ({
        ...f,
        fileUrl: result,
        fileName: file.name,
        fileType: file.type === "application/pdf" ? "pdf" : "image",
      }));
      setPreviewUrl(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!form.title || !form.fileUrl) return;
    addPrescription({
      title: form.title,
      doctorName: form.doctorName,
      hospitalName: form.hospitalName,
      date: form.date,
      expiryDate: form.expiryDate || null,
      notes: form.notes,
      medicineName: form.medicineName,
      fileUrl: form.fileUrl,
      fileType: form.fileType,
      fileName: form.fileName,
    });
    setShowAddModal(false);
    setPreviewUrl(null);
    setForm({
      title: "",
      doctorName: "",
      hospitalName: "",
      date: new Date().toISOString().split("T")[0],
      expiryDate: "",
      notes: "",
      medicineName: "",
      fileUrl: "",
      fileType: "image",
      fileName: "",
    });
  };

  const isExpired = (expiryDate: string | null) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  return (
    <div>
      <AppHeader
        title="Prescriptions"
        right={
          <button
            onClick={() => setShowAddModal(true)}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary active:scale-90 transition-transform"
          >
            <Plus className="h-5 w-5 text-white" />
          </button>
        }
      />

      <div className="px-4 mt-3 pb-36">
        {prescriptions.length === 0 && (
          <div className="flex flex-col items-center justify-center bg-white rounded-2xl border border-border p-10 mt-4 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 mb-4">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-base font-bold text-foreground mb-1">No Prescriptions Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Upload your prescriptions to keep them safe</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white"
            >
              Upload Prescription
            </button>
          </div>
        )}

        <div className="space-y-3 mt-2">
          {prescriptions.map((rx, i) => (
            <motion.div
              key={rx.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl border border-border shadow-sm p-4"
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-xl overflow-hidden bg-primary/10 cursor-pointer"
                  onClick={() => setViewPrescription(rx)}
                >
                  {rx.fileType === "image" ? (
                    <img src={rx.fileUrl} alt={rx.title} className="h-full w-full object-cover" />
                  ) : (
                    <FileText className="h-7 w-7 text-primary" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="text-sm font-bold text-foreground truncate">{rx.title}</p>
                    {isExpired(rx.expiryDate) && (
                      <span className="rounded-full bg-danger/10 px-2 py-0.5 text-[10px] font-bold text-danger">
                        Expired
                      </span>
                    )}
                  </div>
                  {rx.doctorName && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <User className="h-3 w-3" /> {rx.doctorName}
                    </p>
                  )}
                  {rx.hospitalName && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Hospital className="h-3 w-3" /> {rx.hospitalName}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                    <Calendar className="h-3 w-3" /> {new Date(rx.date).toLocaleDateString()}
                    {rx.expiryDate && ` · Expires ${new Date(rx.expiryDate).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => setViewPrescription(rx)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10"
                  >
                    <Eye className="h-4 w-4 text-primary" />
                  </button>
                  <button
                    onClick={() => deletePrescription(rx.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-xl bg-danger/10"
                  >
                    <Trash2 className="h-4 w-4 text-danger" />
                  </button>
                </div>
              </div>
              {rx.notes && (
                <p className="mt-2 text-xs text-muted-foreground border-t border-border pt-2">{rx.notes}</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl p-5 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-foreground">Upload Prescription</h2>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted"
                >
                  <X className="h-4 w-4 text-foreground" />
                </button>
              </div>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center justify-center border-2 border-dashed border-primary/30 rounded-2xl p-6 mb-4 cursor-pointer bg-primary/5"
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="h-32 w-full object-contain rounded-xl mb-2" />
                ) : (
                  <>
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 mb-2">
                      <Upload className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-sm font-semibold text-foreground">Tap to upload</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Image or PDF supported</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Title *</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g. Blood Pressure Prescription"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Doctor Name</label>
                  <input
                    value={form.doctorName}
                    onChange={(e) => setForm((f) => ({ ...f, doctorName: e.target.value }))}
                    placeholder="e.g. Dr. James Wilson"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Hospital / Clinic</label>
                  <input
                    value={form.hospitalName}
                    onChange={(e) => setForm((f) => ({ ...f, hospitalName: e.target.value }))}
                    placeholder="e.g. City Medical Center"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Medicine Name</label>
                  <input
                    value={form.medicineName}
                    onChange={(e) => setForm((f) => ({ ...f, medicineName: e.target.value }))}
                    placeholder="e.g. Lisinopril"
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Date</label>
                    <input
                      type="date"
                      value={form.date}
                      onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1 block">Expiry Date</label>
                    <input
                      type="date"
                      value={form.expiryDate}
                      onChange={(e) => setForm((f) => ({ ...f, expiryDate: e.target.value }))}
                      className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1 block">Notes</label>
                  <textarea
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Any additional notes..."
                    rows={3}
                    className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                </div>
              </div>
              <button
                onClick={handleSubmit}
                disabled={!form.title || !form.fileUrl}
                className="mt-5 w-full rounded-2xl bg-primary py-4 text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Prescription
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {viewPrescription && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 z-40"
              onClick={() => setViewPrescription(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-4 z-50 bg-white rounded-3xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="text-base font-bold text-foreground truncate">{viewPrescription.title}</h3>
                <button
                  onClick={() => setViewPrescription(null)}
                  className="flex h-8 w-8 items-center justify-center rounded-xl bg-muted"
                >
                  <X className="h-4 w-4 text-foreground" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {viewPrescription.fileType === "image" ? (
                  <img
                    src={viewPrescription.fileUrl}
                    alt={viewPrescription.title}
                    className="w-full rounded-2xl object-contain"
                  />
                ) : (
                  <div className="w-full rounded-2xl overflow-hidden" style={{ height: "60vh" }}>
                    <iframe
                      src={viewPrescription.fileUrl}
                      className="w-full h-full border-0"
                      title={viewPrescription.title}
                    />
                  </div>
                )}
                <div className="mt-4 space-y-2">
                  {viewPrescription.doctorName && (
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{viewPrescription.doctorName}</span>
                    </div>
                  )}
                  {viewPrescription.hospitalName && (
                    <div className="flex items-center gap-2">
                      <Hospital className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-foreground">{viewPrescription.hospitalName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground">
                      {new Date(viewPrescription.date).toLocaleDateString()}
                      {viewPrescription.expiryDate && ` · Expires ${new Date(viewPrescription.expiryDate).toLocaleDateString()}`}
                    </span>
                  </div>
                  {viewPrescription.notes && (
                    <p className="text-sm text-muted-foreground border-t border-border pt-2 mt-2">
                      {viewPrescription.notes}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}