import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Doctor Tracker – Administrative Portal',
  description: 'Manage doctors, patients, clinical assignments, and healthcare analytics with performance and precision.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AuthProvider>
          <ToastProvider>{children}</ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
