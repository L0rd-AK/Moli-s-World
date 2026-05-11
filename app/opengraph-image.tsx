import { ImageResponse } from 'next/server';

export const runtime = 'edge';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#FAF7F0',
          color: '#1A1208',
          fontSize: 64,
          fontWeight: 700,
        }}
      >
        বাংলা সাহিত্য
      </div>
    ),
    size
  );
}
