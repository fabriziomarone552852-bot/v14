// src/components/modals/FeedbackModal.tsx
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { useIsMobile } from '@/mobile/hooks/useIsMobile';
import MobileFeedbackModal from '@/mobile/components/modals/MobileFeedbackModal';
import BaseModal from '@/components/shared/dialog/BaseModal';
import {
  useFeedbackFormLogic,
  type UseFeedbackFormProps,
} from '@/hooks/useFeedbackFormLogic';
import FeedbackTypeDropdown from '@/components/shared/feedback/FeedbackTypeDropdown';
import FeedbackSeverityDropdown from '@/components/shared/feedback/FeedbackSeverityDropdown';
import FeedbackScreenshotField from '@/components/shared/feedback/FeedbackScreenshotField';
import FeedbackTelemetryField from '@/components/shared/feedback/FeedbackTelemetryField';
import FeedbackSuccessView from '@/components/shared/feedback/FeedbackSuccessView';

export interface FeedbackModalProps extends UseFeedbackFormProps {
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = (props) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <MobileFeedbackModal {...props} />;
  }

  return <DesktopFeedbackModal {...props} />;
};

const DesktopFeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  initialType = 'bug',
  initialTitle = '',
  initialDescription = '',
  initialSeverity = 'medium',
  initialErrorContext,
}) => {
  const {
    reportType,
    setReportType,
    severity,
    setSeverity,
    title,
    setTitle,
    description,
    setDescription,
    stepsToReproduce,
    setStepsToReproduce,
    screenshotUrl,
    removeScreenshot,
    isTypeDropdownOpen,
    setIsTypeDropdownOpen,
    isSeverityDropdownOpen,
    setIsSeverityDropdownOpen,
    typeDropdownRef,
    severityDropdownRef,
    includeTelemetry,
    setIncludeTelemetry,
    showTelemetryDetails,
    setShowTelemetryDetails,
    diagnosticText,
    isUploadingImage,
    submitting,
    isSuccess,
    errorMessage,
    selectedTypeOption,
    selectedSeverityOption,
    hasSeverity,
    fileInputRef,
    handleFileChange,
    handleSubmit,
  } = useFeedbackFormLogic({
    isOpen,
    initialType,
    initialTitle,
    initialDescription,
    initialSeverity,
    initialErrorContext,
  });

  if (!isOpen) return null;

  if (isSuccess) {
    return (
      <BaseModal
        isOpen={isOpen}
        onClose={onClose}
        title="Segnalazione Inviata"
        maxWidthClass="max-w-lg"
        overflowVisible={true}
        footer={
          <div className="flex justify-end w-full">
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm cursor-pointer"
            >
              Chiudi
            </button>
          </div>
        }
      >
        <FeedbackSuccessView />
      </BaseModal>
    );
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Segnalazione & Feedback"
      maxWidthClass="max-w-xl"
      confirmText="Invia Segnalazione"
      cancelText="Annulla"
      onConfirm={handleSubmit}
      isLoading={submitting}
      overflowVisible={true}
    >
      <div className="space-y-3 select-none">
        {/* Banner Errore */}
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 1. Selezione Tipologia & Gravità */}
        <div className={hasSeverity ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'w-full'}>
          <FeedbackTypeDropdown
            reportType={reportType}
            onSelectType={(type) => {
              setReportType(type);
              setIsTypeDropdownOpen(false);
            }}
            isOpen={isTypeDropdownOpen}
            onToggle={() => {
              setIsTypeDropdownOpen(!isTypeDropdownOpen);
              setIsSeverityDropdownOpen(false);
            }}
            dropdownRef={typeDropdownRef}
            selectedOption={selectedTypeOption}
          />

          {hasSeverity && (
            <FeedbackSeverityDropdown
              severity={severity}
              onSelectSeverity={(sev) => {
                setSeverity(sev);
                setIsSeverityDropdownOpen(false);
              }}
              isOpen={isSeverityDropdownOpen}
              onToggle={() => {
                setIsSeverityDropdownOpen(!isSeverityDropdownOpen);
                setIsTypeDropdownOpen(false);
              }}
              dropdownRef={severityDropdownRef}
              selectedOption={selectedSeverityOption}
            />
          )}
        </div>

        {/* 2. Titolo */}
        <div>
          <label htmlFor="feedback-title" className="block text-xs font-bold text-gray-700 mb-1">
            Titolo
          </label>
          <input
            id="feedback-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Es. Problema nel salvataggio del task..."
            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs"
            required
          />
        </div>

        {/* 3. Descrizione */}
        <div>
          <label htmlFor="feedback-description" className="block text-xs font-bold text-gray-700 mb-1">
            Descrizione
          </label>
          <textarea
            id="feedback-description"
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrivi cosa è accaduto o cosa vorresti proporre..."
            className="w-full px-3.5 py-2 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs resize-y"
            required
          />
        </div>

        {/* 4. Passaggi per riprodurre */}
        {reportType === 'bug' && (
          <div>
            <label htmlFor="feedback-steps" className="block text-xs font-bold text-gray-700 mb-1">
              Passaggi per riprodurre
            </label>
            <textarea
              id="feedback-steps"
              rows={2}
              value={stepsToReproduce}
              onChange={(e) => setStepsToReproduce(e.target.value)}
              placeholder="1. Ho cliccato su... 2. Si è verificato..."
              className="w-full px-3.5 py-1.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white text-xs font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-2xs resize-y"
            />
          </div>
        )}

        {/* 5. Screenshot / Foto */}
        <FeedbackScreenshotField
          screenshotUrl={screenshotUrl}
          onRemoveScreenshot={removeScreenshot}
          fileInputRef={fileInputRef}
          onFileChange={handleFileChange}
          isUploading={isUploadingImage}
        />

        {/* 6. Contesto Diagnostico */}
        <FeedbackTelemetryField
          includeTelemetry={includeTelemetry}
          onToggleInclude={setIncludeTelemetry}
          showDetails={showTelemetryDetails}
          onToggleDetails={() => setShowTelemetryDetails(!showTelemetryDetails)}
          diagnosticText={diagnosticText}
        />
      </div>
    </BaseModal>
  );
};

export default FeedbackModal;
