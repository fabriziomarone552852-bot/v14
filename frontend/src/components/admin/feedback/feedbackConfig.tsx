// src/components/admin/feedback/feedbackConfig.tsx
import React from 'react';
import {
  Bug,
  Layout,
  Lightbulb,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Clock,
  Archive,
} from 'lucide-react';
import type {
  FeedbackStatus,
  FeedbackSeverity,
  FeedbackType,
} from '@/types/feedback';

export interface StatusConfigItem {
  label: string;
  badgeClass: string;
  icon: React.ReactNode;
}

export interface SeverityConfigItem {
  label: string;
  badgeClass: string;
}

export const STATUS_CONFIG: Record<FeedbackStatus, StatusConfigItem> = {
  new: {
    label: 'Nuovo',
    badgeClass: 'bg-blue-50 text-blue-700 border-blue-200 ring-1 ring-blue-400/20',
    icon: <AlertCircle className="w-3 h-3 text-blue-600" />,
  },
  in_progress: {
    label: 'In Lavorazione',
    badgeClass: 'bg-amber-50 text-amber-700 border-amber-200 ring-1 ring-amber-400/20',
    icon: <Clock className="w-3 h-3 text-amber-600" />,
  },
  resolved: {
    label: 'Risolto',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200 ring-1 ring-emerald-400/20',
    icon: <CheckCircle2 className="w-3 h-3 text-emerald-600" />,
  },
  dismissed: {
    label: 'Archiviato',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
    icon: <Archive className="w-3 h-3 text-slate-500" />,
  },
};

export const SEVERITY_CONFIG: Record<FeedbackSeverity, SeverityConfigItem> = {
  low: { label: 'Bassa', badgeClass: 'bg-slate-100 text-slate-600 border-slate-200' },
  medium: { label: 'Media', badgeClass: 'bg-amber-50 text-amber-700 border-amber-200' },
  high: { label: 'Alta', badgeClass: 'bg-orange-50 text-orange-700 border-orange-200' },
  critical: { label: 'Critica', badgeClass: 'bg-rose-50 text-rose-700 border-rose-200 font-black' },
};

export const TYPE_ICONS: Record<FeedbackType, React.ReactNode> = {
  bug: <Bug className="w-3.5 h-3.5 text-rose-600" />,
  visual: <Layout className="w-3.5 h-3.5 text-purple-600" />,
  feature_request: <Lightbulb className="w-3.5 h-3.5 text-amber-600" />,
  other: <MessageSquare className="w-3.5 h-3.5 text-blue-600" />,
};
