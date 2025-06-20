// src/components/FormInput.tsx
import React from "react";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function FormInput({ label, error, ...rest }: Props) {
  return (
    <div className="mb-5">
      <label className="block mb-2 text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        className={
          "w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 " +
          (error
            ? "border-red-400 focus:ring-red-400"
            : "border-gray-300 focus:ring-indigo-400")
        }
        {...rest}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
