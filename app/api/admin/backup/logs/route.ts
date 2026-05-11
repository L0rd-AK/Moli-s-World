import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { clientPromise } from '@/lib/mongodb';
import { IBackupLog } from '@/models/BackupLog';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const logs = await db
      .collection<IBackupLog>('backupLogs')
      .find()
      .sort({ triggeredAt: -1 })
      .limit(10)
      .toArray();

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Error fetching backup logs:', error);
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 });
  }
}
