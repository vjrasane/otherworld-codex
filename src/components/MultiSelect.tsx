import Select, {
  components,
  type MultiValue,
  type MultiValueProps,
  type StylesConfig,
} from "react-select";

export type Option = { label: string; value: string };
export const MultiSelect: React.FC<{
  label: string;
  placeholder?: string;
  options: Option[];
  value: Option[];
  onChange: (option: MultiValue<Option>) => void;
}> = ({ label, options, value, onChange, placeholder }) => {
  return (
    <div className="flex flex-col gap-1">
      <label className="block text-xs text-text-muted mb-1">{label}</label>
      <Select<Option, true>
        isMulti
        options={options}
        value={value}
        onChange={onChange}
        placeholder={placeholder ?? label}
        styles={selectStyles}
        unstyled
        classNames={{
          control: () => "input-field",
        }}
        components={selectComponents}
        closeMenuOnSelect={false}
        hideSelectedOptions={false}
      />
    </div>
  );
};

const CustomMultiValue: React.FC<MultiValueProps<Option, true>> = (
  props: MultiValueProps<Option, true>,
) => {
  const values = props.selectProps.value as Option[];
  if (values.length <= 1) return <components.MultiValue {...props} />;

  if (values[0].value !== props.data.value) return null;
  return (
    <components.MultiValue
      {...props}
      components={{ ...props.components, Remove: () => null }}
    >
      {values.length} selected
    </components.MultiValue>
  );
};

const selectComponents = { MultiValue: CustomMultiValue };

const selectStyles: StylesConfig<Option, true> = {
  control: (base, { isFocused }) => ({
    ...base,
    background: "var(--color-bg-2)",
    borderColor: isFocused ? "var(--color-accent)" : "var(--color-border)",
    boxShadow: isFocused ? "0 0 0 1px var(--color-accent)" : "none",
    "&:hover": { borderColor: "var(--color-accent)" },
    flexWrap: "nowrap",
    padding: "calc(var(--spacing) * 2) calc(var(--spacing) * 3)",
  }),
  valueContainer: (base) => ({
    ...base,
    flexWrap: "nowrap",
    overflow: "hidden",
  }),
  menu: (base) => ({
    ...base,
    background: "var(--color-bg-1)",
    border: "1px solid var(--color-border)",
    zIndex: 10,
  }),
  option: (base, { isFocused, isSelected }) => ({
    ...base,
    background: isSelected
      ? "var(--color-bg-3)"
      : isFocused
        ? "var(--color-bg-2)"
        : undefined,
    color: "var(--color-text-primary)",
    ":active": { background: "var(--color-bg-3)" },
  }),
  multiValue: (base) => ({
    ...base,
    background: "var(--color-bg-3)",
    minWidth: 0,
    flexShrink: 1,
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "var(--color-text-primary)",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "var(--color-text-muted)",
    ":hover": {
      background: "var(--color-danger)",
      color: "var(--color-text-primary)",
    },
  }),
  input: (base) => ({
    ...base,
    color: "var(--color-text-primary)",
  }),
  placeholder: (base) => ({
    ...base,
    color: "var(--color-text-muted)",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  }),
  indicatorSeparator: (base) => ({
    ...base,
    background: "var(--color-border)",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: "var(--color-text-muted)",
    ":hover": { color: "var(--color-text-primary)" },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: "var(--color-text-muted)",
    ":hover": { color: "var(--color-danger)" },
  }),
  noOptionsMessage: (base) => ({
    ...base,
    color: "var(--color-text-muted)",
  }),
};
