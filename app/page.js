"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/context/AuthContext";
import AuthForm from "@/components/auth/AuthForm";

export default function HomePage() {
  const { user } = useAuth();
  const router = useRouter();

  // If the user is already logged in, send them to their boards automatically
  useEffect(() => {
    if (user) router.push("/boards");
  }, [user, router]);

  return (
    <main>
      <AuthForm />
    </main>
  );
}
