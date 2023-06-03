import {
  ComponentPropsWithRef,
  ElementType,
  PropsWithChildren,
  Ref,
  forwardRef,
} from "react"
import { cva, type VariantProps } from "class-variance-authority"

const buttonCVA = cva(
  ["flex justify-center items-center whitespace-nowrap", "disabled:bg-gray-50"],
  {
    variants: {
      intent: {
        primary: "bg-white border-2",
      },
      round: {
        true: "aspect-square rounded-full",
      },
      size: {
        sm: "px-4 py-1 text-sm lg:px-6 lg:py-2 lg:text-base",
      },
    },
    defaultVariants: {
      intent: "primary",
      size: "sm",
    },
  }
)

type ButtonProps<T extends ElementType = "a" | "button"> = {
  as?: T
} & VariantProps<typeof buttonCVA> &
  ComponentPropsWithRef<T>

export default forwardRef(function Button<T extends ElementType = "button">(
  {
    as,
    children,
    intent,
    round,
    size,
    ...rest
  }: PropsWithChildren<ButtonProps<T>>,
  ref: Ref<ElementType>
) {
  const Component = as || "button"

  return (
    <Component
      ref={ref}
      className={buttonCVA({ intent, round, size })}
      {...rest}
    >
      {children}
    </Component>
  )
})
