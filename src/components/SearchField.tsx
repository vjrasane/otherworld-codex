import { X } from "lucide-react";

export const SearchField: React.FC<{
  label: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
}> = ({ label, value, placeholder, onChange }) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="block text-xs text-text-muted">{label}</label>
      <div className="relative">
        <input
          type="text"
          placeholder={placeholder ?? label}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="input-field"
        />
        {value && (
          <button
            onClick={() => onChange("")}
            className="bg-none border-none text-text-muted hover:text-text-primary p-0 flex absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer"
          >
            <X size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
