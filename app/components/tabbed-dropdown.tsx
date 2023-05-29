"use client"

import { cx } from "class-variance-authority"
import {
  Dispatch,
  PropsWithChildren,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import Button from "./button"
import { BsChevronDown } from "react-icons/bs"
import FadeIn from "./fade-in"

/**
 * TODO: create a tabbed-dropdown component because headless-ui's menus break w/ multiple Menu.Buttons
 * - compound components
 *    - TabbedDropdown, TabbedDropdown.Tabs, TabbedDropdown.Tab, TabbedDropdown.Trigger, TabbedDropdown.Items, TabbedDropdown.Item
 * - the TabbedDropdown wraps everything in a context to manage the open state and provide open/close functions
 * - props like active & selected are provided to the Tab & Item components
 * - the tabs component should set something in context so that the items can position themselves correctly
 */

const DropdownContext = createContext<{
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
}>({
  open: false,
  setOpen: () => null,
})

export default function TabbedDropdown({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      {children}
    </DropdownContext.Provider>
  )
}

TabbedDropdown.Tabs = function Tabs({ children }: { children: ReactNode }) {
  return <div className="flex items-stretch gap-3">{children}</div>
}

TabbedDropdown.Tab = function Tab({
  children,
  onClick,
  selected,
}: PropsWithChildren<{
  onClick: () => void
  selected: boolean
}>) {
  return <div>{children}</div>
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
  const { open } = useContext(DropdownContext)

  return (
    <FadeIn
      show={open}
      tabIndex={0}
      className={cx(
        "absolute inset-x-0 mt-[8px] top-[51px]",
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
  return <div>{children}</div>
}
