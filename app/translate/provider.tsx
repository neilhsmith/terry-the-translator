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
import data from "@/app/translate/data.json"
const { personalities } = data

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

const TranslatorContext = createContext<{
  status: AsyncStatus
  resultText?: string | null
  errors?: string[] | null
}>({
  status: "idle",
})
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
  personality: personalities[0],
})
const TranslatorDispatchContext = createContext<Dispatch<TranslatorAction>>(
  () => null
)

const initialState: TranslatorState = {
  status: "idle",
  sourceLang: null,
  sourceText: "",
  targetLang: "en",
  targetPersonality: personalities[0],
}

function reducer(
  state: TranslatorState = initialState,
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
  const [state, dispatch] = useReducer(reducer, initialState)

  const translatorStore = useMemo(
    () => ({
      status: state.status,
      errors: state.errors,
      resultText: state.resultText,
    }),
    [state.status, state.errors, state.resultText]
  )
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

  return (
    <TranslatorContext.Provider value={translatorStore}>
      <TranslatorSourceContext.Provider value={sourceStore}>
        <TranslatorTargetContext.Provider value={targetStore}>
          <TranslatorDispatchContext.Provider value={dispatch}>
            {children}
          </TranslatorDispatchContext.Provider>
        </TranslatorTargetContext.Provider>
      </TranslatorSourceContext.Provider>
    </TranslatorContext.Provider>
  )
}

export const useTranslator = () => useContext(TranslatorContext)
export const useTranslatorSource = () => useContext(TranslatorSourceContext)
export const useTranslatorTarget = () => useContext(TranslatorTargetContext)
export const useTranslatorDispatch = () => useContext(TranslatorDispatchContext)
