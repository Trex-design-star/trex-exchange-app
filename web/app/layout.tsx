import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Trex — Trade currencies with people you can trust',
  description: 'Protected global P2P currency marketplace.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: 'Inter, system-ui, sans-serif', background: '#2A0A54' }}>
        {children}
      </body>
    </html>
  );
}
