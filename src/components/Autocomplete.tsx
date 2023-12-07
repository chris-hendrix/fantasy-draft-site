import React, { FC, useState } from 'react'
import { useCombobox } from 'downshift'

interface Option {
  value: string;
  label: string;
}

interface AutocompleteProps {
  options: Option[];
  onSelection: (selectedOption: Option | null | undefined) => void;
  maxOptions?: number
  size?: 'xs' | 'sm' | 'md' | 'lg'
}

const Autocomplete: FC<AutocompleteProps> = ({ options, onSelection, maxOptions = 100, size = 'sm' }) => {
  const [inputValue, setInputValue] = useState<string | undefined>('')

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getItemProps,
  } = useCombobox({
    items: options,
    itemToString: (item) => (item ? item.label : ''),
    onInputValueChange: ({ inputValue: newValue }) => setInputValue(newValue),
    onSelectedItemChange: ({ selectedItem: item }) => onSelection(item),
  })

  const filteredOptions = options.filter(
    (option) => !inputValue || option.label.toLowerCase().includes(inputValue.toLowerCase())
  ).slice(0, maxOptions)

  return (
    <div className="w-full dropdown">
      <label tabIndex={0}>
        <input {...getInputProps()} className={`input input-${size} input-bordered w-full`} placeholder="Type here" />
      </label>
      <ul {...getMenuProps()} className="absolute menu menu-sm dropdown-content mt-1 z-[1] p-1 shadow bg-white rounded-box w-full">
        {isOpen && filteredOptions?.length > 0 &&
          filteredOptions.map((item, index) => (
            <li
              key={item.value}
              {...getItemProps({ index, item })}
            >
              <a className={`text-${size}`}>{item.label}</a>
            </li>
          ))}
      </ul>
    </div>
  )
}

export default Autocomplete
