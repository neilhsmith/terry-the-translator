import { useCallback, useState } from "react"

type AsyncState<T> =
  | { status: "idle" | "loading" }
  | { status: "success"; value: T }
  | { status: "error"; error: any }

export default function useAsyncCallback<Args extends unknown[], T>(
  callback: (...args: Args) => Promise<T>
) {
  const [state, setState] = useState<AsyncState<T>>({ status: "idle" })

  const execute = useCallback(
    async (...args: Args) => {
      setState({ status: "loading" })
      try {
        const result = await callback(...args)
        setState({ status: "success", value: result })
      } catch (error) {
        setState({ status: "error", error })
      }
    },
    [callback]
  )

  return [execute, state] as const
}
