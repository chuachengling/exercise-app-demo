import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Exercise App - Your Health Journey Starts Here',
  description: 'Track your fitness goals, monitor progress, and achieve your health objectives with our comprehensive exercise and nutrition tracking app.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}