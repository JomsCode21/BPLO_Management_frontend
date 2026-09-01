import type { InputHTMLAttributes, ReactNode } from "react";

interface CustomInputI extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "prefix" | "suffix"
> {
  label: string | ReactNode;
  type?: string;
  parentClass?: string;
  inputClass?: string;
  labelClass?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
}

export default function CustomInput({
  parentClass = "",
  label,
  type = "text",
  inputClass = "",
  labelClass = "",
  prefix,
  suffix,
  ...props
}: CustomInputI) {
  return (
    <div className={`flex flex-col gap-1 w-full ${parentClass}`}>
      <label className={labelClass || "text-sm font-medium text-slate-300"}>
        {label}
      </label>

      <div className="relative">
        {prefix && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            {prefix}
          </div>
        )}
        <input
          type={type}
          className={
            inputClass ||
            `
            w-full
            px-4 py-3
            rounded-xl
            bg-white/10
            border border-white/20
            text-black
            placeholder-slate-400
            outline-none
            transition-all duration-200
            focus:ring-2 focus:ring-indigo-500
            focus:border-indigo-500
          `
          }
          {...props}
        />
        {suffix && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {suffix}
          </div>
        )}
      </div>
    </div>
  );
}
