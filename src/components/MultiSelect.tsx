import Select, {
  components,
  type MultiValue,
  type MultiValueProps,
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
        unstyled
        classNames={{
          control: () => "input-field flex items-center flex-nowrap",
          valueContainer: () =>
            "flex !flex-nowrap overflow-hidden flex-1 items-center gap-1",
          menu: () =>
            "mt-1 bg-bg-1 border border-border rounded-md z-10 overflow-hidden",
          menuList: () => "max-h-60 overflow-y-auto",
          option: ({ isFocused, isSelected }) =>
            `px-3 py-2 text-sm text-text-primary cursor-pointer ${
              isSelected ? "bg-bg-3" : isFocused ? "bg-bg-2" : ""
            }`,
          multiValue: () =>
            "bg-bg-3 rounded text-sm flex items-center min-w-0 shrink",
          multiValueLabel: () =>
            "text-text-primary px-1.5 overflow-hidden text-ellipsis whitespace-nowrap",
          multiValueRemove: () =>
            "text-text-muted hover:text-text-primary hover:bg-danger px-0.5 rounded-r",
          input: () => "text-text-primary",
          placeholder: () =>
            "text-text-muted overflow-hidden text-ellipsis whitespace-nowrap",
          indicatorSeparator: () => "bg-border self-stretch w-px my-2",
          dropdownIndicator: () =>
            "text-text-muted hover:text-text-primary px-2",
          clearIndicator: () =>
            "text-text-muted hover:text-danger px-2 cursor-pointer",
          noOptionsMessage: () => "text-text-muted text-sm px-3 py-2",
        }}
        components={{ MultiValue: CustomMultiValue }}
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
