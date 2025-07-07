import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import { TaskProvider } from '@/context/TaskContext';
import { TestExecutionProvider } from '@/context/TestExecutionContext';
import { TagProvider } from '@/context/TagContext';
import AuthWrapper from '@/components/AuthWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'QA Monitor Tool',
  description: 'Quality Assurance Task Management Tool',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <TagProvider>
            <TaskProvider>
              <TestExecutionProvider>
                <AuthWrapper>
                  {children}
                </AuthWrapper>
              </TestExecutionProvider>
            </TaskProvider>
          </TagProvider>
        </AuthProvider>
      </body>
    </html>
  );
}