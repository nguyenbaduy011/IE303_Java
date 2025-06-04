import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.scss";
import { Toaster } from "@/components/ui/sonner";
import ThemeProvider from "@/theme/theme-provider";
import { AuthProvider } from "@/contexts/auth-context";

export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Socius | Employee Management Platform",
  description:
    "Socius là nền tảng mạng xã hội nội bộ giúp kết nối các thành viên trong tổ chức, hỗ trợ quản lý nhân sự và các hoạt động nội bộ hiệu quả.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans antialiased" suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
            <Toaster
              toastOptions={{
                unstyled: true,
                classNames: {
                  toast:
                    "rounded-lg p-4 shadow-lg flex items-center gap-2 border border-border bg-card text-card-foreground transition-all duration-300 animate-fade-in",
                  title: "font-semibold text-base",
                  description: "text-sm opacity-90",

                  error:
                    "bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive-foreground border-destructive/50",
                  success:
                    "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-foreground border-primary/50",
                  warning:
                    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200 border-yellow-300/50 dark:border-yellow-700/50",
                  info: "bg-accent/10 text-accent dark:bg-accent/20 dark:text-accent-foreground border-accent/50",

                  actionButton:
                    "text-primary dark:text-primary-foreground text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-ring",
                  cancelButton:
                    "text-muted-foreground dark:text-muted-foreground text-sm font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-ring",
                },
              }}
            />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
