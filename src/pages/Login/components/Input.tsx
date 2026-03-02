interface InputProps {
  onChange: (e: any) => void;
  value: string | number;
  type: React.HTMLInputTypeAttribute | undefined;
  placeholder: string | undefined;
  label: string | undefined;
  required: boolean;
}

export const Input = ({
  value,
  label,
  onChange,
  type,
  placeholder,
  required = false,
}: InputProps) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
        required={required}
      />
    </div>
  );
};
