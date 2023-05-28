"use client"

import { ReactNode, useCallback, useMemo, useRef } from "react"
import { cx } from "class-variance-authority"
import { IoClose } from "react-icons/io5"
import FadeIn from "@/app/components/fade-in"
import Button from "@/app/components/button"
import Dropdown from "@/app/components/dropdown"
import TabbedDropdown from "@/app/components/tabbed-dropdown"
import {
  useTranslatorDispatch,
  useTranslatorSource,
  useTranslatorTarget,
} from "@/app/translate/provider"

import data from "@/app/translate/data.json"
const { languages, personalities } = data

const MAX_SOURCE_TEXT_LENGTH = 5000

// FIXME: fix this, the server Body and this ClickableBody could share a child which sets its own classes
export const bodyClasses =
  "border-4 p-2 pr-0 md:p-3 md:pr-0 lg:p-4 lg:pr-0 flex items-start flex-1"

export function ClickableBody({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  const focusChildTextarea = useCallback(() => {
    ref.current?.querySelector("textarea")?.focus()
  }, [])

  return (
    <div
      ref={ref}
      className={cx(bodyClasses, "cursor-text")}
      onClick={focusChildTextarea}
    >
      {children}
    </div>
  )
}

export function Textarea() {
  const ref = useRef<HTMLTextAreaElement>(null)

  const { text } = useTranslatorSource()
  const dispatch = useTranslatorDispatch()

  const handleChange = useCallback(
    (val: string) => dispatch({ type: "setSourceText", payload: val }),
    [dispatch]
  )

  return (
    <textarea
      ref={ref}
      value={text}
      maxLength={MAX_SOURCE_TEXT_LENGTH}
      onChange={(e) => handleChange(e.target.value)}
      className="w-full bg-transparent resize-none overflow-y-hidden min-h-[4rem] focus:outline-none"
      style={{
        height: ref.current?.scrollHeight,
      }}
    />
  )
}

export function ClearInputTextButton() {
  const { text } = useTranslatorSource()
  const dispatch = useTranslatorDispatch()

  return (
    <FadeIn show={!!text.length}>
      <button
        type="reset"
        className="rounded-full p-2 hover:bg-gray-50"
        onClick={() => dispatch({ type: "setSourceText", payload: "" })}
      >
        <IoClose />
      </button>
    </FadeIn>
  )
}

export function SourceLengthLabel() {
  const { text } = useTranslatorSource()

  return (
    <span className="text-sm">
      {text.length} / {MAX_SOURCE_TEXT_LENGTH}
    </span>
  )
}

export function SubmitButton() {
  const { text } = useTranslatorSource()
  const dispatch = useTranslatorDispatch()

  return (
    <Button type="button" disabled={!text.length} onClick={console.log}>
      Translate
    </Button>
  )
}

export function PersonalitiesDropdown() {
  const { personality } = useTranslatorTarget()
  const dispatch = useTranslatorDispatch()

  const handleSelect = useCallback(
    (personality: string) =>
      dispatch({ type: "setTargetPersonality", payload: personality }),
    [dispatch]
  )

  // TODO: use a headless-ui listbox instead
  // TODO: could probably pass a simple object like the TabbedDropdown in instead of composing here
  return (
    <Dropdown>
      <Dropdown.Trigger>{personality}</Dropdown.Trigger>
      <Dropdown.Items>
        {personalities.map((item) => (
          <Dropdown.Item
            key={item}
            selected={item === personality}
            onClick={() => handleSelect(item)}
          >
            {item}
          </Dropdown.Item>
        ))}
      </Dropdown.Items>
    </Dropdown>
  )
}

export function SourceLanguageSelector() {
  const { language } = useTranslatorSource()
  const dispatch = useTranslatorDispatch()

  const featuredCodes = useMemo(() => ["de", "en", "es"], [])

  const handleSelect = useCallback(
    (languageName: string) =>
      dispatch({
        type: "setSourceLang",
        // TODO: transform the lang state to be Record<code, name> instead so this find isn't necessary
        payload: languages.find((l) => l.name === languageName)!.code, // safe to assume it exists since we're passing all langs to the dropdown
      }),
    [dispatch]
  )

  return (
    <TabbedDropdown
      autoDetect={language ?? ""}
      onSelect={handleSelect}
      items={languages.map((l) => ({
        value: l.name,
        active: l.code === language,
        featured: featuredCodes.includes(l.code),
      }))}
    />
  )
}

export function TargetLanguageSelector() {
  const { language } = useTranslatorTarget()
  const dispatch = useTranslatorDispatch()

  const featuredCodes = useMemo(() => ["de", "en", "es"], [])

  const handleSelect = useCallback(
    (languageName: string) =>
      dispatch({
        type: "setTargetLang",
        payload: languages.find((l) => l.name === languageName)!.code, // safe to assume it exists since we're passing all langs to the dropdown
      }),
    [dispatch]
  )

  return (
    <TabbedDropdown
      onSelect={handleSelect}
      items={languages.map((l) => ({
        value: l.name,
        active: l.code === language,
        featured: featuredCodes.includes(l.code),
      }))}
    />
  )
}
