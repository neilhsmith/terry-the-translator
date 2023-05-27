import { Transition } from "@headlessui/react"
import { Fragment, ReactNode } from "react"

export default function FadeIn({
  children,
  show,
}: {
  children: ReactNode
  show: boolean
}) {
  return (
    <Transition
      show={show}
      enter="transition ease-out duration-100"
      enterFrom="opacity-0 scale-95"
      enterTo="opacity-100 scale-100"
      leave="transition ease-in duration-100"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
    >
      {children}
    </Transition>
  )
}
