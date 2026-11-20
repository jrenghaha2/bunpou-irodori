import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, FolderInput, Info, Merge, RefreshCw } from 'lucide-react';
import type { PendingRestoreState } from '../types/bunpou';
import { Modal } from './Modal';

interface RestoreModalProps {
  pending: PendingRestoreState | null;
  currentMasteredCount: number;
  currentHardCount: number;
  mergedMasteredCount: number;
  mergedHardCount: number;
  cleanBackupHardCount: number;
  onConfirm: (mode: 'merge' | 'replace') => void;
  onClose: () => void;
}

export function RestoreModal({
  pending,
  currentMasteredCount,
  currentHardCount,
  mergedMasteredCount,
  mergedHardCount,
  cleanBackupHardCount,
  onConfirm,
  onClose,
}: RestoreModalProps) {
  const mergeBtnRef = useRef<HTMLButtonElement>(null);
  const [confirmEmptyReplace, setConfirmEmptyReplace] = useState(false);

  useEffect(() => {
    setConfirmEmptyReplace(false);
  }, [pending]);

  if (!pending) return null;

  const { parsed, fileName } = pending;
  const { impMastered, rejectedIds, exportedAt, formatType, isEmptyBackup } = parsed;
  const hasCurrentProgress = currentMasteredCount > 0 || currentHardCount > 0;

  const dateLabel =
    exportedAt.length >= 10
      ? `Backup ${exportedAt.slice(0, 10)}`
      : formatType !== 'v1'
        ? 'Format backup versi lama'
        : fileName;

  const handleReplaceClick = () => {
    if (isEmptyBackup && hasCurrentProgress && !confirmEmptyReplace) {
      setConfirmEmptyReplace(true);
      return;
    }
    onConfirm('replace');
  };

  return (
    <Modal
      open={Boolean(pending)}
      onClose={onClose}
      id="restoreModal"
      ariaLabelledBy="restoreModalTitle"
      ariaDescribedBy="restoreModalDesc"
      initialFocusRef={mergeBtnRef}
      panelClassName="p-6 text-slate-900 dark:text-slate-100"
    >
        <div className="flex items-center gap-2.5">
          <FolderInput
            className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0"
            aria-hidden="true"
          />
          <h2
            id="restoreModalTitle"
            className="text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50"
          >
            Pulihkan Data Progres
          </h2>
        </div>
        <p
          id="restoreModalDesc"
          className="mt-1.5 text-sm text-slate-600 dark:text-slate-300 leading-relaxed"
        >
          Pilih cara memulihkan data dari file backup agar progres belajar bunpou yang sudah ada
          tidak hilang tanpa sengaja.
        </p>

        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 p-3">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Progres Saat Ini
            </div>
            <div className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-50 font-mono-num">
              {currentMasteredCount} hafal · {currentHardCount} sulit
            </div>
            <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Tersimpan di browser
            </div>
          </div>

          <div className="rounded-xl bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/80 p-3">
            <div className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              File Backup
            </div>
            <div className="mt-1 text-sm font-bold text-slate-900 dark:text-slate-50 font-mono-num">
              {impMastered.length} hafal · {cleanBackupHardCount} sulit
            </div>
            <div
              className="mt-0.5 text-xs text-indigo-700/80 dark:text-indigo-300/90 truncate"
              title={dateLabel}
            >
              {dateLabel}
            </div>
          </div>
        </div>

        {isEmptyBackup ? (
          <div
            id="rcEmptyWarn"
            role="alert"
            className={`mt-3 rounded-xl border p-3 text-xs leading-relaxed font-medium flex items-start gap-2 ${
              hasCurrentProgress
                ? 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800/80 text-rose-900 dark:text-rose-200'
                : 'bg-sky-50 dark:bg-sky-950/50 border-sky-200 dark:border-sky-800/80 text-sky-900 dark:text-sky-200'
            }`}
          >
            {hasCurrentProgress ? (
              <AlertTriangle
                className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400"
                aria-hidden="true"
              />
            ) : (
              <Info
                className="w-4 h-4 shrink-0 mt-0.5 text-sky-600 dark:text-sky-400"
                aria-hidden="true"
              />
            )}
            <span>
              {hasCurrentProgress
                ? `Peringatan Backup Kosong: File ini berisi 0 pola hafal dan 0 pola sulit. Jika memilih "Timpa Semua", seluruh progres saat ini (${currentMasteredCount} hafal, ${currentHardCount} sulit) akan terhapus menjadi 0.`
                : 'File backup ini kosong (0 pola hafal dan 0 pola sulit). Tidak ada data progres baru yang akan ditambahkan.'}
            </span>
          </div>
        ) : null}

        {rejectedIds.length > 0 ? (
          <div
            id="rcRejectedWarn"
            role="status"
            className="mt-2.5 rounded-xl border border-amber-200 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/50 p-3 text-xs leading-relaxed font-medium text-amber-900 dark:text-amber-200 flex items-start gap-2"
          >
            <AlertTriangle
              className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400"
              aria-hidden="true"
            />
            <span>
              {rejectedIds.length} ID data tidak cocok dengan buku aktif dan akan diabaikan:{' '}
              {rejectedIds.slice(0, 4).join(', ')}
              {rejectedIds.length > 4 ? ` (+${rejectedIds.length - 4} lainnya)` : ''}.
            </span>
          </div>
        ) : null}

        {confirmEmptyReplace ? (
          <div
            role="alert"
            className="mt-3 rounded-xl border border-rose-300 dark:border-rose-700 bg-rose-50 dark:bg-rose-950/60 p-3 text-xs text-rose-950 dark:text-rose-100"
          >
            <p className="font-bold">Konfirmasi Timpa Progres</p>
            <p className="mt-1 leading-relaxed">
              Anda yakin ingin menimpa {currentMasteredCount} hafal &amp; {currentHardCount} sulit
              dengan backup kosong (menjadi 0)? Klik tombol &ldquo;Konfirmasi Hapus &amp; Timpa&rdquo;
              di bawah untuk melanjutkan.
            </p>
          </div>
        ) : null}

        <div className="flex flex-col gap-2.5 mt-5">
          <button
            ref={mergeBtnRef}
            type="button"
            id="btnRestoreMerge"
            onClick={() => onConfirm('merge')}
            className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 cursor-pointer"
          >
            <div className="flex items-center justify-between gap-2 text-sm font-bold">
              <span className="inline-flex items-center gap-1.5">
                <Merge className="w-4 h-4 shrink-0" aria-hidden="true" />
                Gabungkan (Merge)
              </span>
              <span className="text-xs font-medium text-emerald-100 font-mono-num whitespace-nowrap">
                → {mergedMasteredCount} hafal · {mergedHardCount} sulit
              </span>
            </div>
            <p className="mt-1 text-xs text-emerald-50/90 leading-snug">
              Simpan progres saat ini dan tambahkan data dari file backup (aman).
            </p>
          </button>

          <button
            type="button"
            id="btnRestoreReplace"
            onClick={handleReplaceClick}
            className={`w-full rounded-xl border px-4 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 cursor-pointer ${
              confirmEmptyReplace
                ? 'bg-rose-600 border-rose-700 text-white hover:bg-rose-700'
                : 'bg-white dark:bg-slate-800 border-rose-200 dark:border-rose-800/80 text-slate-900 dark:text-slate-100 hover:bg-rose-50 dark:hover:bg-rose-950/50 hover:border-rose-300 dark:hover:border-rose-700'
            }`}
          >
            <div className="flex items-center justify-between gap-2 text-sm font-bold">
              <span className="inline-flex items-center gap-1.5">
                <RefreshCw className="w-4 h-4 shrink-0" aria-hidden="true" />
                {confirmEmptyReplace ? 'Konfirmasi Hapus & Timpa Semua' : 'Timpa Semua (Replace)'}
              </span>
              <span
                className={`text-xs font-semibold font-mono-num whitespace-nowrap ${
                  confirmEmptyReplace ? 'text-rose-100' : 'text-rose-700 dark:text-rose-400'
                }`}
              >
                → {impMastered.length} hafal · {cleanBackupHardCount} sulit
              </span>
            </div>
            <p
              className={`mt-1 text-xs leading-snug ${
                confirmEmptyReplace ? 'text-rose-50' : 'text-slate-600 dark:text-slate-300'
              }`}
            >
              Hapus progres saat ini dan ganti seluruhnya dengan isi file backup.
            </p>
          </button>

          <button
            type="button"
            id="btnRestoreCancel"
            onClick={onClose}
            className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-50 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 cursor-pointer"
          >
            Batal
          </button>
        </div>
    </Modal>
  );
}
