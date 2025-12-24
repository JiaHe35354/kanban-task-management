import Image from "next/image";

import classes from "./header-logo.module.css";

export default function HeaderLogo() {
  return (
    <header className={classes.logo}>
      <Image
        width={152}
        height={25}
        src="/assets/logo-dark.svg"
        alt="Kanban logo"
      />
    </header>
  );
}
