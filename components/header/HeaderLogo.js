import Image from "next/image";

import classes from "./HeaderLogo.module.css";

export default function HeaderLogo() {
  return (
    <div className={classes.logo}>
      <picture>
        <source
          width={24}
          height={25}
          srcSet="/assets/logo-mobile.svg"
          media="(max-width: 46.25em)"
        />
        <Image
          src="/assets/logo-dark.svg"
          alt="Kanban logo"
          width={152}
          height={25}
        />
      </picture>
    </div>
  );
}
