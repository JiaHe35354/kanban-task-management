import Image from "next/image";

import classes from "./HeaderLogo.module.css";

export default function HeaderLogo() {
  return (
    <div className={classes.logo}>
      <Image
        width={152}
        height={25}
        src="../../assets/logo-dark.svg"
        alt="Kanban logo"
      />
    </div>
  );
}
