"use client";

import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

import MainContent from "@/components/main-content/MainContent";
import { BoardProvider } from "@/context/board/BoardProvider";
import { ThemeProvider } from "@/context/ThemeContext";

import classes from "./layout.module.css";

export default function DashBoardLayout({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/");
    }
  }, [user, loading, router]);

  if (loading || !user)
    return (
      <div className={classes.loadingWrapper}>
        <p className={classes.loadingText}>Loading...</p>
      </div>
    );

  return (
    <BoardProvider>
      <ThemeProvider>
        <MainContent>{children}</MainContent>
      </ThemeProvider>
    </BoardProvider>
  );
}
