import React from 'react'
import { useCombobox, useMultipleSelection } from 'downshift'

interface MultiselectOption {
  value: string | number;
  label: string | number;
}
// https://www.downshift-js.com/use-multiple-selection

interface Props {
  items: MultiselectOption[];
  onSelection: (
    selectedItems: MultiselectOption[],
    selectedItem?: MultiselectOption | null
  ) => void;
  label?: string
  initialSelectedItems?: MultiselectOption[];
}

const getFilteredOptions = (
  items: MultiselectOption[],
  selectedItems: MultiselectOption[],
  inputValue: string
) => {
  const lowerCasedInputValue = inputValue.toLowerCase()

  return items.filter((item) => (
    !selectedItems.includes(item) &&
    (String(item.label).toLowerCase().includes(lowerCasedInputValue))
  ))
}

export const Multiselect: React.FC<Props> = ({
  items,
  onSelection,
  label,
  initialSelectedItems,
}) => {
  const [inputValue, setInputValue] = React.useState('')
  const [selectedItems, setSelectedItems] = React.useState<MultiselectOption[]>(
    initialSelectedItems || []
  )

  const filteredItems = React.useMemo(
    () => getFilteredOptions(items, selectedItems, inputValue),
    [selectedItems, inputValue]
  )

  const {
    getSelectedItemProps,
    getDropdownProps,
    removeSelectedItem,
  } = useMultipleSelection({
    selectedItems,
    onStateChange({ selectedItems: newSelectedItems, type }) {
      switch (type) {
        case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownBackspace:
        case useMultipleSelection.stateChangeTypes.SelectedItemKeyDownDelete:
        case useMultipleSelection.stateChangeTypes.DropdownKeyDownBackspace:
        case useMultipleSelection.stateChangeTypes.FunctionRemoveSelectedItem:
          setSelectedItems(newSelectedItems || [])
          break
        default:
          break
      }
    },
  })

  const {
    isOpen,
    getToggleButtonProps,
    getLabelProps,
    getMenuProps,
    getInputProps,
    highlightedIndex,
    getItemProps,
    selectedItem,
  } = useCombobox({
    items: filteredItems,
    itemToString: (item) => String(item?.label || ''),
    defaultHighlightedIndex: 0,
    selectedItem: null,
    inputValue,
    stateReducer(state, actionAndChanges) {
      const { changes, type } = actionAndChanges

      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
          return {
            ...changes,
            isOpen: true,
            highlightedIndex: 0,
          }
        default:
          return changes
      }
    },
    onStateChange({
      inputValue: newInputValue,
      type,
      selectedItem: newSelectedItem,
    }) {
      switch (type) {
        case useCombobox.stateChangeTypes.InputKeyDownEnter:
        case useCombobox.stateChangeTypes.ItemClick:
        case useCombobox.stateChangeTypes.InputBlur:
          if (newSelectedItem) {
            setSelectedItems([...selectedItems, newSelectedItem])
            setInputValue('')
          }
          break

        case useCombobox.stateChangeTypes.InputChange:
          setInputValue(String(newInputValue))
          break
        default:
          break
      }
    },
  })

  React.useEffect(() => { onSelection(selectedItems, selectedItem) }, [selectedItems, selectedItem])

  return (
    <div className="w-[592px]">
      <div className="flex flex-col gap-1">
        <label className="w-fit" {...getLabelProps()}>
          {label}
        </label>
        <div className="shadow-sm bg-white inline-flex gap-2 items-center flex-wrap p-1.5">
          {selectedItems.map((
            selectedItemForRender,
            index
          ) => (
            <span
              className="bg-gray-100 rounded-md px-1 focus:bg-red-400"
              key={`selected-item-${index}`}
              {...getSelectedItemProps({
                selectedItem: selectedItemForRender,
                index,
              })}
            >
              {selectedItemForRender.label}
              <span
                className="px-1 cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  removeSelectedItem(selectedItemForRender)
                }}
              >
                &#10005;
              </span>
            </span>
          ))}
          <div className="flex gap-0.5 grow">
            <input
              placeholder={label}
              className="w-full"
              {...getInputProps(getDropdownProps({ preventKeyAction: isOpen }))}
            />
            <button
              aria-label="toggle menu"
              className="px-2"
              type="button"
              {...getToggleButtonProps()}
            >
              &#8595;
            </button>
          </div>
        </div>
      </div>
      <ul
        className={`absolute w-inherit bg-white mt-1 shadow-md max-h-80 overflow-scroll p-0 z-10 ${!(isOpen && filteredItems.length) && 'hidden'}`}
        {...getMenuProps()}
      >
        {isOpen &&
          filteredItems.map((item, index) => (
            <li
              className={`${highlightedIndex === index ? 'bg-blue-300' : ''} ${selectedItem === item ? 'font-bold' : ''} py-2 px-3 shadow-sm flex flex-col`}
              key={`${item.value}${index}`}
              {...getItemProps({ item, index })}
            >
              <span>{item.label}</span>
            </li>
          ))}
      </ul>
    </div>
  )
}

export default Multiselect
