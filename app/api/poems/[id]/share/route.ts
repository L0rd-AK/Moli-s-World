import { NextResponse } from 'next/server';
import { clientPromise } from '@/lib/mongodb';
import { IPoem } from '@/models/Poem';
import { createCanvas } from '@napi-rs/canvas';
import { stripHtml } from '@/lib/content';
import { ObjectId } from 'mongodb';

interface RouteProps {
  params: { id: string };
}

function wrapText(ctx: { measureText(text: string): { width: number } }, text: string, maxWidth: number) {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';

  words.forEach((word) => {
    const testLine = line ? `${line} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = testLine;
    }
  });

  if (line) lines.push(line);
  return lines;
}

export async function GET(request: Request, { params }: RouteProps) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const poemId = ObjectId.isValid(params.id) ? new ObjectId(params.id) : params.id;
    const poem = await db.collection<IPoem>('poems').findOne({ _id: poemId, status: 'published' });

    if (!poem) {
      return NextResponse.json({ error: 'Poem not found' }, { status: 404 });
    }

    const canvas = createCanvas(1200, 630);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FAF7F0';
    ctx.fillRect(0, 0, 1200, 630);

    ctx.strokeStyle = '#D4851A';
    ctx.lineWidth = 4;
    ctx.strokeRect(40, 40, 1120, 550);

    ctx.fillStyle = '#1A1208';
    ctx.font = 'bold 48px serif';
    const titleLines = wrapText(ctx, poem.title, 1000);
    titleLines.slice(0, 2).forEach((line, index) => {
      ctx.fillText(line, 80, 140 + index * 60);
    });

    ctx.font = '28px serif';
    const excerpt = stripHtml(poem.content).split(' ').slice(0, 30).join(' ');
    const bodyLines = wrapText(ctx, excerpt, 1000);
    bodyLines.slice(0, 5).forEach((line, index) => {
      ctx.fillText(line, 80, 280 + index * 40);
    });

    ctx.fillStyle = '#D4851A';
    ctx.font = '24px serif';
    ctx.fillText('বাংলা সাহিত্য', 80, 560);

    const buffer = canvas.toBuffer('image/png');
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating share image:', error);
    return NextResponse.json({ error: 'Failed to generate image' }, { status: 500 });
  }
}
