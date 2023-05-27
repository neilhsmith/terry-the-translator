"use client"

import {
  createContext,
  Dispatch,
  ReactNode,
  useContext,
  useMemo,
  useReducer,
} from "react"
import { TranslateResponsePayload } from "@/app/translate/types"
import personalityDefaults from "@/app/translate/personalities.json"

// TODO: move to app's types
type AsyncStatus = "idle" | "loading" | "success" | "error"

type TranslatorState = {
  status: AsyncStatus

  // null when auto detecting
  sourceLang: string | null
  sourceText: string
  targetLang: string
  targetPersonality: string

  // undefined before POSTing, null if error
  resultText?: string | null
  errors?: string[] | null
}

type TranslatorAction =
  | { type: "setSourceText"; payload: string }
  | { type: "setSourceLang"; payload: string | null }
  | { type: "setTargetLang"; payload: string }
  | { type: "setTargetPersonality"; payload: string }
  | { type: "translate" }
  | { type: "translateSuccess"; payload: TranslateResponsePayload }
  | { type: "translateFailure"; payload: unknown } // TODO: payload type

const TranslatorStatusContext = createContext<AsyncStatus>("idle")
const TranslatorSourceContext = createContext<{
  text: string
  language: string | null
}>({
  text: "",
  language: null,
})
const TranslatorTargetContext = createContext<{
  language: string
  personality: string
}>({
  language: "en",
  personality: personalityDefaults.personalities[0],
})
const TranslatorResultContext = createContext<
  | {
      hasErrors: false
      text: string
    }
  | {
      hasErrors: true
      errors: string[]
    }
  | null
>(null)
const TranslatorDispatchContext = createContext<Dispatch<TranslatorAction>>(
  () => null
)

function reducer(
  state: TranslatorState,
  action: TranslatorAction
): TranslatorState {
  switch (action.type) {
    case "setSourceText":
      return {
        ...state,
        sourceText: action.payload,
      }
    case "setSourceLang":
      return {
        ...state,
        sourceLang: action.payload,
      }
    case "setTargetLang":
      return {
        ...state,
        targetLang: action.payload,
      }
    case "setTargetPersonality":
      return {
        ...state,
        targetPersonality: action.payload,
      }
    case "translate":
      return {
        ...state,
        status: "loading",
      }
    case "translateSuccess":
      // TODO: the response includes the translation & personification metadatas, should i do anything w them?
      return {
        ...state,
        status: "success",
        resultText: action.payload.resultText,
      }
    case "translateFailure":
      return {
        ...state,
        status: "error",
        resultText: null,
        errors: ["...TODO..."], // TODO: type the payload, set error's here
      }
    default:
      throw new Error("invalid action type")
  }
}

export default function TranslatorProvider({
  children,
}: {
  children: ReactNode
}) {
  const [state, dispatch] = useReducer(reducer, {
    status: "idle",
    sourceLang: null,
    sourceText: "",
    targetLang: "en",
    targetPersonality: personalityDefaults.personalities[0],
  })

  const sourceStore = useMemo(
    () => ({ text: state.sourceText, language: state.sourceLang }),
    [state.sourceText, state.sourceLang]
  )
  const targetStore = useMemo(
    () => ({
      language: state.targetLang,
      personality: state.targetPersonality,
    }),
    [state.targetLang, state.targetPersonality]
  )
  const resultStore = useMemo(() => {
    if (state.errors?.length) {
      return {
        hasErrors: true,
        errors: state.errors,
      } as { hasErrors: true; errors: string[] }
    }
    return {
      hasErrors: false,
      text: state.resultText,
    } as { hasErrors: false; text: string }
  }, [state.errors, state.resultText])

  return (
    <TranslatorStatusContext.Provider value={state.status}>
      <TranslatorSourceContext.Provider value={sourceStore}>
        <TranslatorTargetContext.Provider value={targetStore}>
          <TranslatorResultContext.Provider value={resultStore}>
            <TranslatorDispatchContext.Provider value={dispatch}>
              {children}
            </TranslatorDispatchContext.Provider>
          </TranslatorResultContext.Provider>
        </TranslatorTargetContext.Provider>
      </TranslatorSourceContext.Provider>
    </TranslatorStatusContext.Provider>
  )
}

export const useTranslatorStatus = () => useContext(TranslatorStatusContext)
export const useTranslatorSource = () => useContext(TranslatorSourceContext)
export const useTranslatorTarget = () => useContext(TranslatorTargetContext)
export const useTranslatorResult = () => useContext(TranslatorResultContext)
export const useTranslatorDispatch = () => useContext(TranslatorDispatchContext)
