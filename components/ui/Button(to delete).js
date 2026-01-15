import classes from "./Button.module.css";

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export default function Button({
  children,
  bg = "purple",
  text = "white",
  font = "small",
  opacity = "high",
  ...props
}) {
  const className = [
    classes.btn,
    classes[`bg${capitalize(bg)}`],
    classes[`text${capitalize(text)}`],
    classes[`font${capitalize(font)}`],
    classes[`opacity${capitalize(opacity)}`],
  ].join(" ");

  return (
    <button className={className} {...props}>
      {children}
    </button>
  );
}
