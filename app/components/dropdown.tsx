import {
  ComponentPropsWithoutRef,
  createContext,
  Fragment,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useContext,
} from "react"
import { cx } from "class-variance-authority"
import { Menu, Transition } from "@headlessui/react"
import { BsCheck, BsChevronDown } from "react-icons/bs"
import Button from "@/app/components/button"

// TODO:
// - bring in cva to handle props changes

const DropdownContext = createContext<{
  fluid: boolean
  open: boolean
  close: () => void
}>({
  fluid: false,
  open: false,
  close: () => null,
})

type DropdownProps = {
  fluid?: boolean
} & ComponentPropsWithoutRef<"div">

function Dropdown({
  children,
  fluid = false,
  ...rest
}: PropsWithChildren<DropdownProps>) {
  return (
    <Menu
      as="div"
      className={cx("inline-block text-left", {
        relative: !fluid,
      })}
      {...rest}
    >
      {({ close, open }) => (
        <DropdownContext.Provider
          value={{
            fluid,
            open,
            close,
          }}
        >
          {children}
        </DropdownContext.Provider>
      )}
    </Menu>
  )
}

function Trigger({
  children,
  icon = true,
}: {
  children?: ReactNode
  icon?: boolean
}) {
  return (
    <Menu.Button as={Button}>
      {children}
      {icon ? (
        <BsChevronDown
          className={cx("transition ui-open:-rotate-180", {
            "ml-2": !!children,
          })}
        />
      ) : null}
    </Menu.Button>
  )
}

function Items({ children }: PropsWithChildren<{}>) {
  const { fluid } = useContext(DropdownContext)

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
          "absolute right-0 mt-2 bg-white border-4 focus:outline-none z-50",
          "drop-shadow-[-.35rem_.65rem_1px_rgba(0,0,0,.4)]",
          {
            "w-full": fluid,
            "w-56": !fluid,
            "columns-2": fluid,
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
        className="flex w-full items-center px-2 py-2 whitespace-nowrap hover:bg-gray-50 ui-active:bg-gray-50"
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
