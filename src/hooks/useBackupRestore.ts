import { useCallback, useMemo, useRef, useState } from 'react';
import type { BookId, PendingRestoreState } from '../types/bunpou';
import { BOOK_STORAGE_KEYS, normalizeDisjointSets } from '../utils/bunpouSync';
import { buildBackupPayload, validateAndParseBackup } from '../utils/storage';
import type { ShowToastFn } from './useToast';

interface UseBackupRestoreOptions {
  bookId: BookId;
  activeMastered: Set<string>;
  activeHardSet: Set<string>;
  activeValidIds: Set<string>;
  applyProgressChange: (nextMastered: Set<string>, nextHard: Set<string>) => boolean;
  onRestoreCommitted: (nextMastered: Set<string>, nextHard: Set<string>) => void;
  showToast: ShowToastFn;
  dismissToast: () => void;
}

export function useBackupRestore({
  bookId,
  activeMastered,
  activeHardSet,
  activeValidIds,
  applyProgressChange,
  onRestoreCommitted,
  showToast,
  dismissToast,
}: UseBackupRestoreOptions) {
  const [pendingRestore, setPendingRestore] = useState<PendingRestoreState | null>(null);
  const restoreBtnRef = useRef<HTMLButtonElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const clearPendingRestore = useCallback(() => {
    setPendingRestore(null);
  }, []);

  const handleExport = useCallback(() => {
    try {
      const payload = buildBackupPayload(bookId, activeMastered, activeHardSet);
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const today = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `irodori-bunpou-${bookId}-backup-${today}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      showToast(
        'success',
        'Backup Berhasil Diunduh',
        `${BOOK_STORAGE_KEYS[bookId].label}: ${activeMastered.size} hafal · ${activeHardSet.size} sulit.`
      );
    } catch {
      showToast('error', 'Gagal Mengunduh Backup', 'Browser membatasi pembuatan file unduhan.');
    }
  }, [bookId, activeMastered, activeHardSet, showToast]);

  const handleTriggerImport = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  }, []);

  const handleFileSelected = useCallback(
    (file: File) => {
      if (file.size > 2 * 1024 * 1024) {
        showToast('error', 'File Terlalu Besar', 'Ukuran file backup maksimal 2 MB.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const text = typeof reader.result === 'string' ? reader.result : '';
          const parsed = validateAndParseBackup(text, activeValidIds, bookId);
          dismissToast();
          setPendingRestore({ parsed, fileName: file.name });
        } catch (err) {
          showToast(
            'error',
            'File Backup Tidak Valid',
            err instanceof Error ? err.message : 'Gagal membaca file backup.'
          );
        }
      };
      reader.onerror = () => {
        showToast('error', 'Gagal Membaca File', 'File tidak dapat dibaca oleh browser.');
      };
      reader.readAsText(file);
    },
    [activeValidIds, bookId, dismissToast, showToast]
  );

  const handleCloseRestoreModal = useCallback(() => {
    setPendingRestore(null);
    requestAnimationFrame(() => restoreBtnRef.current?.focus());
  }, []);

  const restorePreviews = useMemo(() => {
    if (!pendingRestore) {
      return { mergedMastered: 0, mergedHard: 0, cleanImpHard: 0 };
    }
    const cleanBackup = normalizeDisjointSets(
      pendingRestore.parsed.impMastered,
      pendingRestore.parsed.impHard,
      activeValidIds
    );
    const merged = normalizeDisjointSets(
      [...activeMastered, ...cleanBackup.mastered],
      [...activeHardSet, ...cleanBackup.hard],
      activeValidIds
    );
    return {
      mergedMastered: merged.mastered.size,
      mergedHard: merged.hard.size,
      cleanImpHard: cleanBackup.hard.size,
    };
  }, [pendingRestore, activeMastered, activeHardSet, activeValidIds]);

  const handleConfirmRestore = useCallback(
    (mode: 'merge' | 'replace') => {
      if (!pendingRestore) return;
      const cleanBackup = normalizeDisjointSets(
        pendingRestore.parsed.impMastered,
        pendingRestore.parsed.impHard,
        activeValidIds
      );
      const next =
        mode === 'merge'
          ? normalizeDisjointSets(
              [...activeMastered, ...cleanBackup.mastered],
              [...activeHardSet, ...cleanBackup.hard],
              activeValidIds
            )
          : cleanBackup;

      if (!applyProgressChange(next.mastered, next.hard)) return;

      onRestoreCommitted(next.mastered, next.hard);
      setPendingRestore(null);
      requestAnimationFrame(() => restoreBtnRef.current?.focus());
      showToast(
        'success',
        mode === 'merge' ? 'Progres Berhasil Digabungkan' : 'Progres Berhasil Ditimpa',
        `Sekarang tersimpan ${next.mastered.size} hafal · ${next.hard.size} sulit.`
      );
    },
    [
      pendingRestore,
      activeValidIds,
      activeMastered,
      activeHardSet,
      applyProgressChange,
      onRestoreCommitted,
      showToast,
    ]
  );

  return {
    pendingRestore,
    clearPendingRestore,
    restoreBtnRef,
    fileInputRef,
    restorePreviews,
    handleExport,
    handleTriggerImport,
    handleFileSelected,
    handleCloseRestoreModal,
    handleConfirmRestore,
  };
}
