import React, { FC, useState, useEffect } from 'react'
import { useCombobox } from 'downshift'
import { inputSizes, textSizes } from '@/utils/cssClasses'

interface Option {
  value: string;
  label: string;
}

interface AutocompleteProps {
  options: Option[];
  onSelection: (selectedOption: Option | null | undefined) => void;
  maxOptions?: number;
  size?: 'xs' | 'sm';
  initialValue?: string;
}

const Autocomplete: FC<AutocompleteProps> = ({ options, onSelection, maxOptions = 100, size = 'sm', initialValue = '' }) => {
  const [inputValue, setInputValue] = useState<string | undefined>(initialValue)

  const {
    isOpen,
    getMenuProps,
    getInputProps,
    getItemProps,
    selectItem,
  } = useCombobox({
    items: options,
    itemToString: (item) => (item ? item.label : ''),
    onInputValueChange: ({ inputValue: newValue }) => setInputValue(newValue),
    onSelectedItemChange: ({ selectedItem: item }) => onSelection(item),
    initialSelectedItem: options.find((option) => option.value === initialValue),
  })

  const filteredOptions = options.filter(
    (option) => !inputValue || option.label.toLowerCase().includes(inputValue.toLowerCase())
  ).slice(0, maxOptions)

  // Update input value when the initialValue prop changes
  useEffect(() => {
    setInputValue(initialValue)
  }, [initialValue])

  return (
    <div className="w-full dropdown">
      <label tabIndex={0} className="relative">
        <div className={`w-full flex flex-col gap-1 input  ${inputSizes[size]}`}>
          <div className="flex bg-transparent gap-0.5">
            <input
              {...getInputProps()}
              className={`input ${inputSizes[size]} w-full`}
              placeholder="Type here"
            />
            <button
              className="px-2"
              type="button"
              onClick={() => { selectItem(null) }}
              tabIndex={-1}
            >
              &#215;
            </button>
          </div>
        </div>
      </label>
      <ul {...getMenuProps()} className="absolute menu menu-sm dropdown-content mt-1 z-[1] p-1 shadow bg-white rounded-box w-full">
        {isOpen && filteredOptions?.length > 0 &&
          filteredOptions.map((item, index) => (
            <li
              key={item.value}
              {...getItemProps({ index, item })}
            >
              <a className={`${textSizes[size]}`}>{item.label}</a>
            </li>
          ))}
      </ul>
    </div>
  )
}

export default Autocomplete
