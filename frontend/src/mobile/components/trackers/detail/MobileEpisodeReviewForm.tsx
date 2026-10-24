import React, { useState } from "react";
import { ArrowLeft, Calendar, Check, Monitor, X } from "lucide-react";
import { StarRating } from "@/components/trackers/SeriesDetailModal/StarRating";
import { DatePicker } from "@/components/shared/utils/DatePicker/DatePicker";
import { ReviewVisibilityIcon } from "@/components/trackers/SeriesDetailModal/shared/ReviewVisibilityBadge";
import { SelectModalDialog } from "@/components/shared/form/SelectModalDialog";

export interface MobileEpisodeReviewFormProps {
  editingLogId: number | null;
  onBack: () => void;
  reviewDate: string;
  setReviewDate: (d: string) => void;
  visibility: string;
  setVisibility: (v: string) => void;
  review: string;
  setReview: (r: string) => void;
  rating: number;
  setRating: (n: number) => void;
  platform: string;
  setPlatform: (p: string) => void;
  allPlatforms: string[];
  onSave: () => void;
}

export const MobileEpisodeReviewForm: React.FC<MobileEpisodeReviewFormProps> = ({
  editingLogId, onBack, reviewDate, setReviewDate, visibility, setVisibility,
  review, setReview, rating, setRating, platform, setPlatform, allPlatforms, onSave,
}) => {
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState(false);
  const [isPlatformModalOpen, setIsPlatformModalOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState(platform);
  const [isAddingPlatform, setIsAddingPlatform] = useState(false);
  const [newPlatformName, setNewPlatformName] = useState("");

  const handleOpenPlatformModal = () => {
    setSelectedPlatform(platform);
    setIsAddingPlatform(false);
    setNewPlatformName("");
    setIsPlatformModalOpen(true);
  };

  const handleConfirmPlatform = () => {
    if (isAddingPlatform) {
      const trimmed = newPlatformName.trim();
      if (trimmed) setPlatform(trimmed);
    } else {
      setPlatform(selectedPlatform);
    }
    setIsPlatformModalOpen(false);
    setIsAddingPlatform(false);
    setNewPlatformName("");
  };

  return (
    <div className="h-full w-full flex flex-col justify-between overflow-hidden">
      {/* INTESTAZIONE */}
      <div className="flex flex-col shrink-0">
        <div className="flex items-center gap-2 border-b border-gray-200/80 pb-2 pt-0.5 mb-1">
          <button type="button" onClick={onBack} className="p-1 -ml-1 text-gray-500 hover:text-gray-800 active:scale-90 transition-all cursor-pointer rounded-lg hover:bg-gray-100">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-sm font-extrabold text-gray-900">
            {editingLogId ? "Modifica Recensione" : "Nuova Recensione"}
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center py-1 border-b border-gray-100">
          <StarRating value={rating} onChange={setRating} hideNumber iconClassName="w-6 h-6" />
        </div>
      </div>

      {/* TEXTAREA */}
      <div className="flex-1 flex flex-col overflow-hidden py-2">
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Cosa ne pensi di questo episodio?"
          className="w-full flex-1 min-h-[40px] p-3 bg-white border border-gray-200/90 rounded-2xl outline-none resize-none text-xs sm:text-sm text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all leading-relaxed shadow-2xs overflow-y-auto custom-scrollbar"
        />
      </div>

      {/* BARRA INFERIORE */}
      <div className="shrink-0 -mx-4 px-4 pt-2 pb-2 bg-gray-50/95 backdrop-blur-xs border-t border-gray-200/80 z-10 space-y-2">
        <div className="grid grid-cols-2 gap-2 w-full">
          <div className="col-span-1">
            <div className="flex items-center gap-1 w-full">
              <div className="flex-1 min-w-0">
                <DatePicker
                  value={reviewDate}
                  onChange={setReviewDate}
                  isOpen={isDatePickerOpen}
                  onClose={() => setIsDatePickerOpen(false)}
                  onToggle={() => setIsDatePickerOpen(!isDatePickerOpen)}
                  overlay={true}
                  align="center"
                  customTrigger={
                    <button
                      type="button"
                      className="w-full h-10 px-1 border border-gray-200 bg-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 hover:border-gray-300 active:scale-95 transition-all shadow-2xs cursor-pointer select-none"
                    >
                      <Calendar className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                      <span className={`truncate ${reviewDate ? 'text-gray-700' : 'text-gray-400 italic'}`}>
                        {reviewDate
                          ? new Date(`${reviewDate}T00:00:00`).toLocaleDateString("it-IT", { day: "numeric", month: "short" })
                          : "Senza data"}
                      </span>
                    </button>
                  }
                />
              </div>
              {Boolean(reviewDate) && (
                <button
                  type="button"
                  onClick={() => setReviewDate('')}
                  className="h-10 w-8 flex items-center justify-center text-gray-400 hover:text-red-500 active:scale-90 bg-white border border-gray-200 rounded-xl transition-colors cursor-pointer shrink-0 shadow-2xs"
                  title="Rimuovi data"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
          <div className="col-span-1">
            <button type="button" onClick={() => setIsPrivacyModalOpen(true)} className="w-full h-10 px-1 border border-gray-200 bg-white rounded-xl text-xs text-gray-700 font-semibold flex items-center justify-center gap-1.5 hover:border-gray-300 active:scale-95 transition-all shadow-2xs cursor-pointer select-none">
              <ReviewVisibilityIcon visibility={visibility} className="w-3.5 h-3.5 text-gray-500 shrink-0" />
              <span className="truncate">
                {visibility === "private" && "Solo io"}
                {visibility === "friends_only" && "Amici"}
                {visibility === "public" && "Pubblico"}
              </span>
            </button>
          </div>
        </div>

        <button type="button" onClick={handleOpenPlatformModal} className="w-full h-10 px-3 border border-gray-200 bg-white rounded-xl text-xs text-gray-700 font-semibold flex items-center gap-2 hover:border-gray-300 active:scale-95 transition-all shadow-2xs cursor-pointer select-none">
          <Monitor className="w-3.5 h-3.5 text-gray-500 shrink-0" />
          <span className={`truncate flex-1 text-left ${platform ? "text-gray-800" : "text-gray-400"}`}>{platform || "Dove l'hai guardato?"}</span>
          {platform && (
            <button type="button" onClick={(e) => { e.stopPropagation(); setPlatform(""); }} className="text-gray-400 hover:text-red-500 transition-colors">&#x2715;</button>
          )}
        </button>

        <button type="button" onClick={onSave} className="w-full h-10 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center">
          Salva
        </button>
      </div>

      {/* Modale Privacy */}
      <SelectModalDialog isOpen={isPrivacyModalOpen} onClose={() => setIsPrivacyModalOpen(false)} title="Visibilita Recensione" maxWidthClass="max-w-xs" zIndex={10060}>
        <div className="space-y-1.5 py-1">
          {[{value:"private",label:"Solo io",desc:"Visibile solo a te"},{value:"friends_only",label:"Amici",desc:"Visibile solo ai tuoi amici"},{value:"public",label:"Pubblico",desc:"Visibile a tutta la community"}].map((opt) => {
            const isSel = visibility === opt.value;
            return (
              <button key={opt.value} type="button" onClick={() => { setVisibility(opt.value); setIsPrivacyModalOpen(false); }} className={`w-full p-3 rounded-2xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${isSel ? "bg-blue-600 text-white shadow-xs" : "bg-gray-50 hover:bg-gray-100 text-gray-700 active:scale-[0.99]"}`}>
                <div className="flex items-center gap-2.5">
                  <ReviewVisibilityIcon visibility={opt.value} className={`w-4 h-4 ${isSel ? "text-white" : "text-gray-500"}`} />
                  <div className="flex flex-col text-left"><span>{opt.label}</span><span className={`text-[10px] font-normal ${isSel ? "text-blue-100" : "text-gray-400"}`}>{opt.desc}</span></div>
                </div>
                {isSel && <Check className="w-4 h-4 text-white shrink-0" />}
              </button>
            );
          })}
        </div>
      </SelectModalDialog>

      {/* Modale Piattaforma */}
      <SelectModalDialog isOpen={isPlatformModalOpen} onClose={() => { setIsPlatformModalOpen(false); setIsAddingPlatform(false); setNewPlatformName(""); }} title="Dove l'hai guardato?" maxWidthClass="max-w-xs" zIndex={10060}>
        <div className="space-y-2 py-1">
          {isAddingPlatform ? (
            <div className="space-y-2">
              <div className="w-full p-2 bg-white border-2 border-blue-500 rounded-xl shadow-xs">
                <input autoFocus type="text" value={newPlatformName} onChange={(e) => setNewPlatformName(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleConfirmPlatform(); } }} placeholder="Scrivi nome nuova piattaforma..." className="w-full bg-transparent text-xs font-bold text-gray-800 outline-none" />
              </div>
              {/* Suggerimenti piattaforme simili per evitare duplicati */}
              {newPlatformName.trim().length > 0 && (() => {
                const q = newPlatformName.trim().toLowerCase();
                const matches = allPlatforms.filter(p => p.toLowerCase().includes(q));
                const exactMatch = allPlatforms.some(p => p.toLowerCase() === q);
                if (matches.length === 0) return null;
                return (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 space-y-1">
                    <p className="text-[10px] font-bold text-amber-700 px-1">
                      {exactMatch ? '⚠️ Piattaforma già presente!' : '🔍 Piattaforme simili già salvate:'}
                    </p>
                    {matches.map(m => (
                      <button key={m} type="button" onClick={() => { setSelectedPlatform(m); setIsAddingPlatform(false); setNewPlatformName(""); }} className="w-full text-left text-xs font-bold text-amber-800 bg-amber-100 hover:bg-amber-200 rounded-lg px-2 py-1.5 transition-colors cursor-pointer">
                        {m}
                      </button>
                    ))}
                  </div>
                );
              })()}
            </div>
          ) : (
            <button type="button" onClick={() => { setIsAddingPlatform(true); setSelectedPlatform(""); }} className="w-full py-2.5 px-3 border-2 border-dashed border-gray-300 hover:border-blue-500 text-gray-600 hover:text-blue-600 hover:bg-blue-50/50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer">
              <span className="text-base leading-none font-bold">+</span>
              <span>Aggiungi piattaforma</span>
            </button>
          )}
          <div className="space-y-1.5 max-h-[40vh] overflow-y-auto pt-1">
            <button type="button" onClick={() => { setSelectedPlatform(""); setIsAddingPlatform(false); }} className={`w-full p-3 rounded-2xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${!isAddingPlatform && selectedPlatform === "" ? "bg-blue-600 text-white shadow-xs" : "bg-gray-50 hover:bg-gray-100 text-gray-700 active:scale-[0.99]"}`}>
              <span>Nessuna / Non specificata</span>
              {!isAddingPlatform && selectedPlatform === "" && <Check className="w-4 h-4 text-white shrink-0 stroke-[3]" />}
            </button>
            {allPlatforms.map((plat) => {
              const isSel = !isAddingPlatform && selectedPlatform === plat;
              return (
                <button key={plat} type="button" onClick={() => { setSelectedPlatform(plat); setIsAddingPlatform(false); }} className={`w-full p-3 rounded-2xl flex items-center justify-between text-xs font-bold transition-all cursor-pointer ${isSel ? "bg-blue-600 text-white shadow-xs" : "bg-gray-50 hover:bg-gray-100 text-gray-700 active:scale-[0.99]"}`}>
                  <div className="flex items-center gap-2.5"><Monitor className={`w-4 h-4 ${isSel ? "text-white" : "text-gray-400"}`} /><span className="truncate">{plat}</span></div>
                  {isSel && <Check className="w-4 h-4 text-white shrink-0 stroke-[3]" />}
                </button>
              );
            })}
          </div>
          <div className="pt-2 border-t border-gray-100">
            <button type="button" onClick={handleConfirmPlatform} className="w-full h-10 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center justify-center">Aggiungi</button>
          </div>
        </div>
      </SelectModalDialog>
    </div>
  );
};

export default MobileEpisodeReviewForm;
