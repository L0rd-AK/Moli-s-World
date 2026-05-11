import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { clientPromise } from '@/lib/mongodb';
import { IBackupLog } from '@/models/BackupLog';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const publicKey = process.env.ATLAS_PUBLIC_KEY;
    const privateKey = process.env.ATLAS_PRIVATE_KEY;
    const groupId = process.env.ATLAS_GROUP_ID;
    const clusterName = process.env.ATLAS_CLUSTER_NAME;

    if (!publicKey || !privateKey || !groupId || !clusterName) {
      return NextResponse.json(
        { error: 'Atlas backup not configured', fallback: '/api/admin/backup/export' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    const log: IBackupLog = {
      triggeredBy: {
        userId: session.user.id || '',
        userName: session.user.name || 'Admin',
        email: session.user.email || '',
      },
      triggeredAt: new Date(),
      status: 'pending',
    };

    const logResult = await db.collection<IBackupLog>('backupLogs').insertOne(log);

    const authHeader = Buffer.from(`${publicKey}:${privateKey}`).toString('base64');
    const endpoint = `https://cloud.mongodb.com/api/atlas/v1.0/groups/${groupId}/clusters/${clusterName}/backup/snapshots`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${authHeader}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ retentionInDays: 7 }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      await db.collection<IBackupLog>('backupLogs').updateOne(
        { _id: logResult.insertedId },
        { $set: { status: 'failed', errorMessage: errorText, updatedAt: new Date() } }
      );
      return NextResponse.json({ error: 'Backup trigger failed' }, { status: 500 });
    }

    const snapshot = (await response.json()) as { id?: string };
    const snapshotId = snapshot.id;

    if (!snapshotId) {
      await db.collection<IBackupLog>('backupLogs').updateOne(
        { _id: logResult.insertedId },
        { $set: { status: 'failed', errorMessage: 'Missing snapshot id' } }
      );
      return NextResponse.json({ error: 'Backup failed' }, { status: 500 });
    }

    await db.collection<IBackupLog>('backupLogs').updateOne(
      { _id: logResult.insertedId },
      { $set: { snapshotId } }
    );

    // Poll for completion (short window)
    let status: 'pending' | 'completed' | 'failed' = 'pending';
    for (let attempt = 0; attempt < 5; attempt += 1) {
      await wait(2000);
      const statusResponse = await fetch(`${endpoint}/${snapshotId}`, {
        headers: { Authorization: `Basic ${authHeader}` },
      });
      if (!statusResponse.ok) {
        continue;
      }
      const statusPayload = (await statusResponse.json()) as { status?: string };
      if (statusPayload.status === 'completed') {
        status = 'completed';
        break;
      }
      if (statusPayload.status === 'failed') {
        status = 'failed';
        break;
      }
    }

    await db.collection<IBackupLog>('backupLogs').updateOne(
      { _id: logResult.insertedId },
      {
        $set: {
          status,
          verifiedAt: status === 'completed' ? new Date() : undefined,
        },
      }
    );

    return NextResponse.json({ message: 'Backup triggered', snapshotId, status });
  } catch (error) {
    console.error('Error triggering backup:', error);
    return NextResponse.json({ error: 'Failed to trigger backup' }, { status: 500 });
  }
}
