import { Children, ReactNode } from "react"
import { cx } from "class-variance-authority"

export default function LayoutGrid({ children }: { children: ReactNode }) {
  const childrenArray = Children.toArray(children)

  return (
    <div className="grid gap-x-4 md:gap-y-4 grid-cols-1 md:grid-cols-2">
      {childrenArray.map((child, idx) => (
        <div
          key={idx}
          className={cx({
            "mb-4 last:mb-0 md:mb-0": idx !== 0 && (idx - 1) % 2 === 0,
          })}
        >
          {child}
        </div>
      ))}
    </div>
  )
}
