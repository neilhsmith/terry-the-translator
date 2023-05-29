import { Transition } from "@headlessui/react"
import { ComponentPropsWithoutRef, PropsWithChildren } from "react"

type FadeInProps = {
  show: boolean
} & ComponentPropsWithoutRef<"div">

export default function FadeIn({
  children,
  show,
  ...rest
}: PropsWithChildren<FadeInProps>) {
  return (
    <Transition
      as="div"
      show={show}
      enter="transition ease-out duration-100"
      enterFrom="opacity-0 scale-95"
      enterTo="opacity-100 scale-100"
      leave="transition ease-in duration-100"
      leaveFrom="transform opacity-100 scale-100"
      leaveTo="transform opacity-0 scale-95"
      {...rest}
    >
      {children}
    </Transition>
  )
}
