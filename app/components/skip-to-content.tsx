import { cx } from "class-variance-authority"

type SkipToContentProps = {
  children?: React.ReactNode
  href?: string
}

export default function SkipToContent({
  children = "Skip to content",
  href = "#main",
}: SkipToContentProps) {
  return (
    <a
      href={href}
      className={cx([
        "sr-only focus:not-sr-only focus:text-base",
        // "focus:absolute focus:top-0 focus:right-0",
        // "focus:py-4 focus:px-8 focus:my-1",
        "focus:text-center",
        "focus:ring-0 focus:outline-none",
        "focus:border-2  focus:bg-white focus:text-black focus:text-lg",
      ])}
    >
      {children}
    </a>
  )
}
