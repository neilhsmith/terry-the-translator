import {
  ComponentPropsWithoutRef,
  createContext,
  Fragment,
  PropsWithChildren,
  ReactNode,
  useContext,
} from "react"
import { cx } from "class-variance-authority"
import { Menu, Transition } from "@headlessui/react"
import Button from "./button"
import { BsCheck, BsChevronDown, BsChevronUp } from "react-icons/bs"

// TODO:
// - bring in cva to handle props changes

const FluidContext = createContext(false)

type DropdownProps = {
  fluid?: boolean
} & ComponentPropsWithoutRef<"div">

function Dropdown({
  children,
  fluid = false,
  ...rest
}: PropsWithChildren<DropdownProps>) {
  return (
    <FluidContext.Provider value={fluid}>
      <Menu
        as="div"
        className={cx("inline-block text-left", {
          relative: !fluid,
        })}
        {...rest}
      >
        {children}
      </Menu>
    </FluidContext.Provider>
  )
}

function Trigger({ children }: { children?: ReactNode }) {
  return (
    <Menu.Button as={Button}>
      {({ open }) => (
        <>
          {children}
          {open ? (
            <BsChevronUp className={cx({ "ml-2": !!children })} />
          ) : (
            <BsChevronDown className={cx({ "ml-2": !!children })} />
          )}
        </>
      )}
    </Menu.Button>
  )
}

function Items({ children }: PropsWithChildren<{}>) {
  const fluid = useContext(FluidContext)

  return (
    <Transition
      as={Fragment}
      enter="transition ease-out duration-100"
      enterFrom="transform opacity-0 scale-95"
      enterTo="transform opacity-100 scale-100"
      leave="transition ease-in duration-75"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      <Menu.Items
        className={cx(
          "absolute right-0 mt-2 w-56 divide-y divide-gray-50 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50",
          {
            "w-full": fluid,
            "columns-7": fluid,
            "origin-top": fluid,
            "origin-top-right": !fluid,
          }
        )}
      >
        {children}
      </Menu.Items>
    </Transition>
  )
}

function Item({
  children,
  onClick,
  selected = false,
}: PropsWithChildren<{ selected?: boolean; onClick: () => void }>) {
  return (
    <Menu.Item>
      <button
        type="button"
        className="group flex w-full items-center px-2 py-2 hover:bg-gray-50"
        onClick={onClick}
      >
        {selected ? <BsCheck className="mr-2" /> : null}
        {children}
      </button>
    </Menu.Item>
  )
}

Dropdown.Trigger = Trigger
Dropdown.Items = Items
Dropdown.Item = Item

export default Dropdown
