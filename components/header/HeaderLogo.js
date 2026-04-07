import Image from "next/image";
import { useContext } from "react";
import { ThemeContext } from "@/context/ThemeContext";

import classes from "./HeaderLogo.module.css";

export default function HeaderLogo() {
  const { theme } = useContext(ThemeContext);

  const desktopLogo =
    theme === "light" ? "/assets/logo-dark.svg" : "/assets/logo-light.svg";

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
          src={desktopLogo}
          alt="Kanban logo"
          width={152}
          height={25}
          priority
        />
      </picture>
    </div>
  );
}
