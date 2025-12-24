import { Plus_Jakarta_Sans } from "next/font/google";

import HeaderLogo from "@/components/sidebar/HeaderLogo";
import Sidebar from "@/components/sidebar/Sidebar";
import Header from "@/components/header/Header";

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
        <div className="appLayout">
          <aside className="sidebarColumn">
            <HeaderLogo />
            <Sidebar />
          </aside>

          <Header />

          <main className="main-content">{children}</main>
        </div>
      </body>
    </html>
  );
}
