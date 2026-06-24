import { ThemeProvider } from "@/components/providers/ThemeProvider";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        {children}
      </div>
    </ThemeProvider>
  );
}
