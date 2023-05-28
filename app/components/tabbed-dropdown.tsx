import { useRef, useState } from "react"
import { cx } from "class-variance-authority"
import Dropdown from "./dropdown"

const MAX_FEATURED_ITEMS = 3

type Item = {
  active: boolean
  featured: boolean
  value: string
}

type TabbedDropdownProps = {
  autoDetect?: string
  items: Item[]
  onSelect: (value: string) => void
}

// header: a list of 3ish clickable tabs & a caret trigger btn
//   - 1 click selects the tab
//   - 2 clicks opens the dropdown
//   - caret btn opens the dropdown
//   - if autoDetect, the first tab is "auto"
//     - auto is selected if none of the item's active is true
//     - keep a ref which indicates a lang was set by autoDetect so we can select and display: English: Detected
//   - keep a ref of the last selected langs and use these on the header over featured
//     - only update when selecting from the dropdown so nothing moves when selecting header items
//   - tab count is based on container width, could just show the caret if there's not enough room
// dropdown: a list of items
//   - add columns based on the count
//   - absolutely positioned and fills width, assumes there's a relative parent somewhere to contain it

export default function TabbedDropdown({
  autoDetect,
  items,
  onSelect,
}: TabbedDropdownProps) {
  const active = getActive(items)
  const [featured, setFeatured] = useState(getFeatured(items))
  const canAutoDetect = typeof autoDetect !== "undefined"

  const handleSelect = (item: Item) => {
    const prev = featured.map((i) => ({ ...i, active: false }))
    setFeatured([
      { ...item, active: true },
      ...prev.slice(0, MAX_FEATURED_ITEMS - 1),
    ])
    onSelect(item.value)
  }

  const handleFeaturedClick = (item: Item) => {
    if (item === active) {
      // TODO: open dropdown
    } else {
      const newFeatured = featured.map((f) => {
        if (f === item) {
          return { ...f, active: true }
        } else {
          return { ...f, active: false }
        }
      })
      setFeatured(newFeatured)
      onSelect(item.value)
    }
  }

  const handleAutoDetectClick = () => {
    // TODO: left off here but it's getting messy:
    // - might help to model the state of being in auto detect vs not better
  }

  return (
    <Dropdown fluid>
      <div className="flex gap-3">
        {canAutoDetect ? (
          <button
            type="button"
            onClick={() => handleAutoDetectClick()}
            className={cx("text-sm", {
              "border-b-2": canAutoDetect && !active,
            })}
          >
            Autodetect
          </button>
        ) : null}
        {featured.map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => handleFeaturedClick(item)}
            className={cx("text-sm", { "border-b-2": item.active })}
          >
            {item.value}
          </button>
        ))}
        <Dropdown.Trigger />
      </div>
      <Dropdown.Items>
        {items.map((item) => (
          <Dropdown.Item
            key={item.value}
            selected={item.active}
            onClick={() => handleSelect(item)}
          >
            {item.value}
          </Dropdown.Item>
        ))}
      </Dropdown.Items>
    </Dropdown>
  )
}

function getActive(items: Item[]) {
  return items.find((item) => item.active)
}

function getFeatured(items: Item[], count = MAX_FEATURED_ITEMS) {
  return items.filter((item) => item.featured).slice(0, count)
}
