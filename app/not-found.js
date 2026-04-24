"use client";

import { useRouter } from "next/navigation";
import classes from "./not-found.module.css";

function NotFound() {
  const router = useRouter();

  return (
    <div className={classes.wrapper}>
      <p className={classes.text}>
        We couldn't find that page.
        <button onClick={() => router.back()} className={classes.backBtn}>
          Go back to previous page
        </button>
        .
      </p>
    </div>
  );
}

export default NotFound;
