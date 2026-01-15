import "@/app/globals.css";

export default function FormField({ id, label, children }) {
  return (
    <div className="formControl">
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}
