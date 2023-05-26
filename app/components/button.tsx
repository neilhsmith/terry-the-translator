import { ComponentPropsWithoutRef, ElementType, PropsWithChildren } from "react"
import { cva, type VariantProps } from "class-variance-authority"

const buttonCVA = cva(["flex justify-center items-center", "rounded"], {
  variants: {
    intent: {
      primary: "bg-gray-50",
      link: "bg-transparent",
    },
    round: {
      true: "aspect-square rounded-full",
    },
    size: {
      sm: "px-6 py-2",
      md: "px-8 py-3",
      lg: "px-10 py-4",
    },
  },
  defaultVariants: {
    intent: "primary",
    size: "sm",
  },
})

type ButtonProps<T extends ElementType = "a" | "button"> = {
  as?: T
} & VariantProps<typeof buttonCVA> &
  ComponentPropsWithoutRef<T>

export default function Button<T extends ElementType = "button">({
  as,
  children,
  intent,
  round,
  size,
  ...rest
}: PropsWithChildren<ButtonProps<T>>) {
  const Component = as || "button"

  return (
    <Component className={buttonCVA({ intent, round, size })} {...rest}>
      {children}
    </Component>
  )
}
