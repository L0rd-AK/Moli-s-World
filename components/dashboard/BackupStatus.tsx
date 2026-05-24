import { IBackupLog } from '@/models/BackupLog';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';

interface BackupStatusProps {
  backups: IBackupLog[];
}

const statusConfig = {
  completed: { icon: CheckCircle2, label: 'সম্পন্ন', color: 'text-green-600' },
  pending: { icon: Clock, label: 'প্রক্রিয়াধীন', color: 'text-yellow-600' },
  failed: { icon: XCircle, label: 'ব্যর্থ', color: 'text-red-600' },
} as const;

export function BackupStatus({ backups }: BackupStatusProps) {
  return (
    <div className="rounded-lg border border-cream-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-ink-200 mb-4">ব্যাকআপ অবস্থা</h3>
      {backups.length === 0 ? (
        <p className="text-sm text-ink-100">কোনও ব্যাকআপ রেকর্ড নেই।</p>
      ) : (
        <ul className="space-y-3">
          {backups.map((backup) => {
            const config = statusConfig[backup.status];
            const Icon = config.icon;
            return (
              <li key={backup._id!.toString()} className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-ink-200">
                    {new Date(backup.triggeredAt).toLocaleString('bn-BD')}
                  </p>
                  <p className="text-xs text-ink-50">{backup.snapshotId || 'Export'}</p>
                </div>
                <span className={`flex items-center gap-1 text-xs ${config.color}`}>
                  <Icon className="h-3.5 w-3.5" />
                  {config.label}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
