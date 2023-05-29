"use client"

import {
  Dispatch,
  PropsWithChildren,
  ReactNode,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react"
import { cx } from "class-variance-authority"
import { BsCheck, BsChevronDown } from "react-icons/bs"
import FadeIn from "./fade-in"

/**
 * TODO: LEFT OFF HERE
 *
 * - finish building out this tabbed-dropdown. need to add some styling, aria, and mouse focus & locking
 *   and
 */

const DropdownContext = createContext<{
  id: string
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}>({
  id: "",
  open: false,
  setOpen: () => null,
})

export default function TabbedDropdown({ children }: { children: ReactNode }) {
  const id = useId()
  const [open, setOpen] = useState(false)

  const store = useMemo(
    () => ({
      id,
      open,
      setOpen,
    }),
    [open]
  )

  return (
    <DropdownContext.Provider value={store}>
      {children}
    </DropdownContext.Provider>
  )
}

TabbedDropdown.Tabs = function Tabs({ children }: { children: ReactNode }) {
  return <div className="flex items-stretch gap-3 lg:gap-4">{children}</div>
}

TabbedDropdown.Tab = function Tab({
  children,
  onClick,
  selected,
}: PropsWithChildren<{
  onClick: () => void
  selected: boolean
}>) {
  const { id, open, setOpen } = useContext(DropdownContext)

  const handleClick = () => {
    // selects on single click, opens on double click
    // selects & closes on any tab click when already opened

    if (selected) {
      setOpen(!open)
    } else {
      onClick()

      if (open) {
        setOpen(false)
      }
    }
  }

  return (
    <button
      type="button"
      role="tab"
      aria-controls={id}
      aria-selected={selected}
      aria-label="Select and control the dropdown menu"
      className={cx("text-sm", {
        "border-b-2": selected,
      })}
      onClick={handleClick}
    >
      {children}
    </button>
  )
}

TabbedDropdown.Trigger = function Trigger() {
  const ref = useRef<HTMLButtonElement>(null)
  const { open, setOpen } = useContext(DropdownContext)

  useEffect(() => {
    if (!document || !ref.current) return
    const current = ref.current

    function handleKeydown(e: KeyboardEvent) {
      if (document.activeElement !== current) return

      if (e.key === "Enter" || e.key === " ") {
        setOpen((prev) => !prev)
      }
    }

    current.addEventListener("keydown", handleKeydown)
    return () => current?.removeEventListener("keydown", handleKeydown)
  }, [])

  // TODO: styling & aria & other keybinds like down arrow, esc, etc...
  return (
    <button ref={ref}>
      <BsChevronDown
        onClick={() => setOpen(!open)}
        className={cx("transition-transform", {
          "-rotate-180": open,
          "rotate-0": !open,
        })}
      />
    </button>
  )
}

TabbedDropdown.Items = function Items({ children }: { children: ReactNode }) {
  const { id, open } = useContext(DropdownContext)

  // TODO: spacing, aria, mouse focus & lock
  return (
    <FadeIn
      id={id}
      show={open}
      tabIndex={0}
      role="tabpanel"
      className={cx(
        "absolute inset-x-0 p-2 mt-[8px] top-[51px]",
        "bg-white border-4 columns-2 origin-top-left"
      )}
    >
      {children}
    </FadeIn>
  )
}

TabbedDropdown.Item = function Item({
  children,
  onClick,
  selected,
}: PropsWithChildren<{
  onClick: () => void
  selected: boolean
}>) {
  const { open, setOpen } = useContext(DropdownContext)

  const handleClick = useCallback(() => {
    onClick()
    setOpen(false)
  }, [])

  // TODO: styling & aria
  return (
    <button
      type="button"
      role=""
      tabIndex={0}
      onClick={handleClick}
      className="block px-4 py-2"
    >
      {selected ? <BsCheck className="inline-block mr-2" /> : null}
      {children}
    </button>
  )
}
