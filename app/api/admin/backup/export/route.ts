import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { clientPromise } from '@/lib/mongodb';
import { IBackupLog } from '@/models/BackupLog';
import JSZip from 'jszip';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const client = await clientPromise;
    const db = client.db();

    const zip = new JSZip();
    const collections = await db.collections();

    for (const collection of collections) {
      const docs = await collection.find({}).toArray();
      const json = JSON.stringify(docs, (key, value) => {
        if (value && typeof value === 'object' && value._bsontype === 'ObjectId') {
          return value.toString();
        }
        return value;
      }, 2);
      zip.file(`${collection.collectionName}.json`, json);
    }

    const buffer = await zip.generateAsync({ type: 'nodebuffer' });

    await db.collection<IBackupLog>('backupLogs').insertOne({
      triggeredBy: {
        userId: session.user.id || '',
        userName: session.user.name || 'Admin',
        email: session.user.email || '',
      },
      triggeredAt: new Date(),
      status: 'completed',
      verifiedAt: new Date(),
      downloadUrl: '/api/admin/backup/export',
      size: buffer.length,
    });

    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename=backup-${new Date().toISOString()}.zip`,
      },
    });
  } catch (error) {
    console.error('Error exporting backup:', error);
    return NextResponse.json({ error: 'Failed to export backup' }, { status: 500 });
  }
}
