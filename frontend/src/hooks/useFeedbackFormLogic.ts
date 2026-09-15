// src/hooks/useFeedbackFormLogic.ts
import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useOutsideClick } from '@/hooks/useOutsideClick';
import { createFeedbackReport } from '@/api/feedbackApi';
import { mediaService } from '@/api/mediaService';
import { getDiagnosticContext, detectPlatformName } from '@/utils/telemetry';
import { APP_VERSION_NAME } from '@/data/changelogData';
import type { FeedbackType, FeedbackSeverity } from '@/types/feedback';

export interface UseFeedbackFormProps {
  isOpen: boolean;
  initialType?: FeedbackType;
  initialTitle?: string;
  initialDescription?: string;
  initialSeverity?: FeedbackSeverity;
  initialErrorContext?: string | Record<string, unknown>;
}

export interface TypeOption {
  type: FeedbackType;
  label: string;
}

export interface SeverityOption {
  severity: FeedbackSeverity;
  label: string;
}

export const TYPE_OPTIONS: TypeOption[] = [
  { type: 'bug', label: 'Bug / Errore' },
  { type: 'visual', label: 'Grafica / Layout' },
  { type: 'feature_request', label: 'Suggerimento / Idea' },
  { type: 'other', label: 'Altro' },
];

export const SEVERITY_OPTIONS: SeverityOption[] = [
  { severity: 'low', label: 'Bassa' },
  { severity: 'medium', label: 'Media' },
  { severity: 'high', label: 'Alta' },
  { severity: 'critical', label: 'Critica' },
];

export function useFeedbackFormLogic({
  isOpen,
  initialType = 'bug',
  initialTitle = '',
  initialDescription = '',
  initialSeverity = 'medium',
  initialErrorContext,
}: UseFeedbackFormProps) {
  const [reportType, setReportType] = useState<FeedbackType>(initialType);
  const [severity, setSeverity] = useState<FeedbackSeverity>(initialSeverity);
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null);

  const [isTypeDropdownOpen, setIsTypeDropdownOpen] = useState(false);
  const [isSeverityDropdownOpen, setIsSeverityDropdownOpen] = useState(false);

  const [includeTelemetry, setIncludeTelemetry] = useState(true);
  const [showTelemetryDetails, setShowTelemetryDetails] = useState(false);

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const typeDropdownRef = useOutsideClick<HTMLDivElement>(() => {
    if (isTypeDropdownOpen) setIsTypeDropdownOpen(false);
  });

  const severityDropdownRef = useOutsideClick<HTMLDivElement>(() => {
    if (isSeverityDropdownOpen) setIsSeverityDropdownOpen(false);
  });

  // Sincronizza i valori iniziali all'apertura del form
  useEffect(() => {
    if (isOpen) {
      setReportType(initialType);
      setSeverity(initialSeverity);
      setTitle(initialTitle);
      setDescription(initialDescription);
      setStepsToReproduce('');
      setScreenshotUrl(null);
      setIsTypeDropdownOpen(false);
      setIsSeverityDropdownOpen(false);
      setSubmitting(false);
      setIsSuccess(false);
      setErrorMessage(null);
      setShowTelemetryDetails(false);
    }
  }, [isOpen, initialType, initialSeverity, initialTitle, initialDescription]);

  const currentRoute = useMemo(() => {
    return typeof window !== 'undefined' ? `${window.location.pathname}${window.location.search}` : '/';
  }, []);

  const platform = useMemo(() => detectPlatformName(), []);

  const diagnosticText = useMemo(() => {
    return getDiagnosticContext(
      initialErrorContext
        ? typeof initialErrorContext === 'string'
          ? { initial_context: initialErrorContext }
          : initialErrorContext
        : undefined
    );
  }, [initialErrorContext]);

  const selectedTypeOption = useMemo(() => {
    return TYPE_OPTIONS.find((t) => t.type === reportType) || TYPE_OPTIONS[0];
  }, [reportType]);

  const selectedSeverityOption = useMemo(() => {
    return SEVERITY_OPTIONS.find((s) => s.severity === severity) || SEVERITY_OPTIONS[1];
  }, [severity]);

  const hasSeverity = reportType === 'bug' || reportType === 'visual';

  const handleFileUpload = useCallback(async (file: File) => {
    if (!file) return;
    setIsUploadingImage(true);
    setErrorMessage(null);
    try {
      const res = await mediaService.uploadImage(file, 'feedback');
      setScreenshotUrl(res.url);
    } catch (err: unknown) {
      const errText = err instanceof Error ? err.message : 'Errore durante il caricamento dello screenshot';
      setErrorMessage(`Caricamento immagine fallito: ${errText}`);
    } finally {
      setIsUploadingImage(false);
    }
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleFileUpload(file);
    }
  }, [handleFileUpload]);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      setErrorMessage('Inserisci un titolo per la segnalazione.');
      return;
    }
    if (!description.trim()) {
      setErrorMessage('Descrivi il problema o la richiesta.');
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      await createFeedbackReport({
        report_type: reportType,
        severity,
        title: title.trim(),
        description: description.trim(),
        steps_to_reproduce: stepsToReproduce.trim() || undefined,
        app_version: APP_VERSION_NAME,
        platform,
        current_route: currentRoute,
        error_context: includeTelemetry ? diagnosticText : undefined,
        screenshot_url: screenshotUrl || undefined,
      });

      setIsSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Impossibile inviare la segnalazione al server.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  }, [
    title,
    description,
    reportType,
    severity,
    stepsToReproduce,
    platform,
    currentRoute,
    includeTelemetry,
    diagnosticText,
    screenshotUrl,
  ]);

  const removeScreenshot = useCallback(() => {
    setScreenshotUrl(null);
  }, []);

  return {
    // Form States
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
    setScreenshotUrl,
    removeScreenshot,

    // Dropdown States & Refs
    isTypeDropdownOpen,
    setIsTypeDropdownOpen,
    isSeverityDropdownOpen,
    setIsSeverityDropdownOpen,
    typeDropdownRef,
    severityDropdownRef,

    // Telemetry & Diagnostic States
    includeTelemetry,
    setIncludeTelemetry,
    showTelemetryDetails,
    setShowTelemetryDetails,
    platform,
    currentRoute,
    diagnosticText,

    // Loading / Submission States
    isUploadingImage,
    submitting,
    isSuccess,
    errorMessage,
    setErrorMessage,

    // Options & Computed Helpers
    selectedTypeOption,
    selectedSeverityOption,
    hasSeverity,

    // Actions & Handlers
    fileInputRef,
    handleFileUpload,
    handleFileChange,
    handleSubmit,
  };
}
