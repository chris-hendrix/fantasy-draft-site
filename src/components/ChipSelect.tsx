import React from 'react'
import { useCombobox, useMultipleSelection } from 'downshift'

interface ChipSelectOption {
  value: string | number;
  label: string | number;
}
// https://www.downshift-js.com/use-multiple-selection

interface Props {
  items: ChipSelectOption[];
  onSelection: (selection: {
    selectedItems?: ChipSelectOption[],
    selectedItem?: ChipSelectOption | null,
    selectedValues?: (string | number)[]
  }) => void;
  label?: string
  initialSelectedItems?: ChipSelectOption[];
}

const getFilteredOptions = (
  items: ChipSelectOption[],
  selectedItems: ChipSelectOption[],
  inputValue: string
) => {
  const lowerCasedInputValue = inputValue.toLowerCase()

  return items.filter((item) => (
    !selectedItems.includes(item) &&
    (String(item.label).toLowerCase().includes(lowerCasedInputValue))
  ))
}

const ChipSelect: React.FC<Props> = ({
  items,
  onSelection,
  label,
  initialSelectedItems = [],
}) => {
  const [inputValue, setInputValue] = React.useState('')
  const [selectedItems, setSelectedItems] = React.useState<ChipSelectOption[]>(
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

  React.useEffect(() => {
    onSelection({
      selectedItems,
      selectedItem,
      selectedValues: selectedItems.map((item) => item.value)
    })
  }, [selectedItems, selectedItem])

  return (
    <div className="w-full h-full p-1">
      <div className="flex flex-col gap-1">
        <label className="text-xs w-fit p-0.5" {...getLabelProps()}>
          {label}
        </label>
        <div className="inline-flex gap-1 items-center flex-wrap p-1">
          {selectedItems.map((
            selectedItemForRender,
            index
          ) => (
            <span
              className="badge badge-primary badge-sm text-xs cursor-pointer"
              key={`selected-item-${index}`}
              {...getSelectedItemProps({
                selectedItem: selectedItemForRender,
                index,
              })}
            >
              <span
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  removeSelectedItem(selectedItemForRender)
                }}
              >
                {selectedItemForRender.label}
              </span>
            </span>
          ))}
          <div className="text-xs flex gap-0.5 grow p-0.5">
            <input
              placeholder={`${label}...`}
              className="w-full input input-xs"
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
      <div {...getMenuProps()}>
        {isOpen && <ul
          className="absolute menu menu-sm dropdown-content mt-1 z-[1] p-1 shadow bg-white rounded-box w-full"
        >
          {filteredItems.map((item, index) => (
            <li key={`${item.value}${index}`} {...getItemProps({ item, index })} >
              <span className="text-xs">{item.label}</span>
            </li>
          ))}
        </ul>}
      </div>
    </div>
  )
}

export default ChipSelect
