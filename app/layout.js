import { Plus_Jakarta_Sans } from "next/font/google";
import MainContent from "@/components/main-content/MainContent";
import { AuthProvider } from "@/context/AuthContext";
import { BoardProvider } from "@/context/board/BoardProvider";
import { ThemeProvider } from "@/context/ThemeContext";

import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plus-jakarta",
});

export const metadata = {
  title: "Kanban Task Management",
  description: "A task management web app designed to help you every day!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={plusJakartaSans.className}>
      <body className="light">
        <div id="modal-root"></div>

        <AuthProvider>
          <BoardProvider>
            <ThemeProvider>
              <MainContent>{children}</MainContent>
            </ThemeProvider>
          </BoardProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
