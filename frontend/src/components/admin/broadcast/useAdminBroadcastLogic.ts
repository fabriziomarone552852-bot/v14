// src/components/admin/broadcast/useAdminBroadcastLogic.ts
import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchAdminBroadcasts,
  createAdminBroadcast,
  deactivateAdminBroadcast,
  deleteAdminBroadcast,
} from '@/api/broadcastApi';
import type { BroadcastLevel, SystemBroadcastCreate, SystemBroadcastResponse } from '@/types/broadcast';
import { extractErrorMessage } from '@/utils/errorUtils';

export function useAdminBroadcastLogic() {
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [messageText, setMessageText] = useState('');
  const [level, setLevel] = useState<BroadcastLevel>('WARNING');
  const [showPopup, setShowPopup] = useState(true);
  const [sendInbox, setSendInbox] = useState(true);

  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const {
    data: broadcasts = [],
    isLoading,
    refetch,
  } = useQuery<SystemBroadcastResponse[]>({
    queryKey: ['adminBroadcasts'],
    queryFn: fetchAdminBroadcasts,
  });

  const activeBroadcast = broadcasts.find((b) => b.is_active) || null;

  const createMutation = useMutation({
    mutationFn: (payload: SystemBroadcastCreate) => createAdminBroadcast(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBroadcasts'] });
      queryClient.invalidateQueries({ queryKey: ['systemBroadcast', 'active'] });
      queryClient.invalidateQueries({ queryKey: ['interactions'] });
      setStatusMessage({ text: 'Avviso di sistema trasmesso con successo a tutti gli utenti!', type: 'success' });
      setTitle('');
      setMessageText('');
    },
    onError: (err: unknown) => {
      setStatusMessage({
        text: extractErrorMessage(err, 'Errore durante la creazione dell\'avviso broadcast.'),
        type: 'error',
      });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => deactivateAdminBroadcast(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBroadcasts'] });
      queryClient.invalidateQueries({ queryKey: ['systemBroadcast', 'active'] });
      setStatusMessage({ text: 'Avviso broadcast disattivato con successo.', type: 'success' });
    },
    onError: (err: unknown) => {
      setStatusMessage({
        text: extractErrorMessage(err, 'Errore durante la disattivazione dell\'avviso.'),
        type: 'error',
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAdminBroadcast(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminBroadcasts'] });
      setStatusMessage({ text: 'Avviso rimosso dallo storico.', type: 'success' });
    },
    onError: (err: unknown) => {
      setStatusMessage({
        text: extractErrorMessage(err, 'Errore durante l\'eliminazione dell\'avviso.'),
        type: 'error',
      });
    },
  });

  const handleApplyPreset = useCallback((presetType: 'migration' | 'maintenance20' | 'restart5') => {
    if (presetType === 'migration') {
      setTitle('Migrazione su Nuovo Server in Corso');
      setMessageText(
        'È in corso il trasferimento dei servizi sul nuovo server. Il portale rimarrà temporaneamente sospeso per consentire la migrazione in sicurezza dei dati. Grazie per la collaborazione!'
      );
      setLevel('WARNING');
      setShowPopup(true);
      setSendInbox(true);
    } else if (presetType === 'maintenance20') {
      setTitle('Manutenzione Programmata del Server');
      setMessageText(
        'Il servizio sarà temporaneamente sospeso per circa 20 minuti per interventi tecnici di aggiornamento. Si consiglia di salvare le modifiche in corso prima dell\'orario indicato.'
      );
      setLevel('WARNING');
      setShowPopup(true);
      setSendInbox(true);
    } else if (presetType === 'restart5') {
      setTitle('Breve Riavvio di Sistema');
      setMessageText('È programmato un rapido riavvio del server della durata stimata di circa 5 minuti.');
      setLevel('INFO');
      setShowPopup(true);
      setSendInbox(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !messageText.trim()) {
      setStatusMessage({ text: 'Titolo e testo dell\'avviso sono obbligatori.', type: 'error' });
      return;
    }

    createMutation.mutate({
      title: title.trim(),
      message: messageText.trim(),
      level,
      show_popup: showPopup,
      send_inbox: sendInbox,
    });
  };

  return {
    broadcasts,
    activeBroadcast,
    isLoading,
    isSubmitting: createMutation.isPending,
    isDeactivating: deactivateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    statusMessage,
    title,
    setTitle,
    messageText,
    setMessageText,
    level,
    setLevel,
    showPopup,
    setShowPopup,
    sendInbox,
    setSendInbox,
    handleApplyPreset,
    handleSubmit,
    handleDeactivate: (id: number) => deactivateMutation.mutate(id),
    handleDelete: (id: number) => deleteMutation.mutate(id),
    refetch,
  };
}
