import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

import "@/app/globals.css";
import classes from "./AuthForm.module.css";

export default function AuthForm() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const { signup, login, loginWithGoogle } = useAuth();

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /(?=.*[0-9])/;

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return false;
    }

    if (!passwordRegex.test(password)) {
      setError("Password must contain at least one number.");
      return false;
    }
    if (!isLogin && password !== confirmPassword) {
      setError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const isValid = validateForm();
    if (!isValid) return;

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }

      router.push("/boards");
    } catch (err) {
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (err.code === "auth/wrong-password") {
        setError("Incorrect password. Please try again.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (err.code === "auth/invalid-credential") {
        setError("Invalid email or password.");
      } else {
        setError("An error occurred. Please try again.");
      }
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      setError("Google authentication failed. Please try again.");
    }
  };

  const handleDemoLogin = async () => {
    setError("");

    try {
      await login("demo@example.com", "password123");
      router.push("/boards");
    } catch (err) {
      setError("Demo mode is currently unavailable.");
    }
  };

  const toggleAuthMode = () => {
    setIsLogin((prev) => !prev);

    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setError("");
  };

  return (
    <div className={classes.formWrapper}>
      <div className={classes.formContainer}>
        <form className={classes.form} onSubmit={handleSubmit}>
          <h1 className={classes.title}>
            {isLogin ? "Log in" : "Create account"}
          </h1>

          <div className={classes.inputGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="e.g. alex@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className={classes.inputGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete={isLogin ? "current-password" : "new-password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {!isLogin && (
            <div className={classes.inputGroup}>
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          )}

          {error && <p className={classes.errorMessage}>{error}</p>}

          <button
            type="submit"
            className={`${classes.btn} ${classes.authBtn} focusRing`}
          >
            {isLogin ? "Log in" : "Create account"}
          </button>
        </form>

        <div className={classes.divider}></div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          className={`${classes.btn} ${classes.googleButton}`}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 18 18"
          >
            <path
              d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
              fill="#4285f4"
            />
            <path
              d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"
              fill="#34a853"
            />
            <path
              d="M3.964 10.707a5.41 5.41 0 0 1 0-3.414V4.961H.957a8.997 8.997 0 0 0 0 8.078l3.007-2.332z"
              fill="#fbbc05"
            />
            <path
              d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.29c.708-2.127 2.692-3.71 5.036-3.71z"
              fill="#ea4335"
            />
          </svg>
          {isLogin ? "Log in" : "Sign up"} with Google
        </button>

        <button
          className={`${classes.btn} ${classes.demoBtn} focusRing`}
          onClick={handleDemoLogin}
        >
          Quick demo
        </button>
      </div>

      <p className={classes.switchAuth}>
        {isLogin ? "Don't have an account?" : "Have an account?"}{" "}
        <button
          type="button"
          onClick={toggleAuthMode}
          className={classes.toggleBtn}
        >
          {" "}
          {isLogin ? "Sign up" : "Log in"}
        </button>
      </p>
    </div>
  );
}
