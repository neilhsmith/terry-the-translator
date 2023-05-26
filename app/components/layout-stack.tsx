import {
  Children,
  ComponentPropsWithoutRef,
  ElementType,
  PropsWithChildren,
} from "react"

type LayoutStackProps<T extends ElementType> = {
  as?: T
} & ComponentPropsWithoutRef<T>

/**
 * A layout component that stacks its children vertically on mobile and horizontally on desktop
 * and wraps each child with a flex-1 div.
 */
export default function LayoutStack<T extends ElementType = "div">({
  as,
  children,
  ...rest
}: PropsWithChildren<LayoutStackProps<T>>) {
  const Component = as || "div"
  const childrenArray = Children.toArray(children)

  return (
    <Component className="relative flex flex-col gap-4 md:flex-row" {...rest}>
      {childrenArray.map((child, index) => (
        <div key={index} className="flex-1">
          {child}
        </div>
      ))}
    </Component>
  )
}
