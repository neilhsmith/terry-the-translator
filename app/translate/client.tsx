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
const MAX_SOURCE_TABS_COUNT = 3

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
        // FIXME: doesn't decrease properly
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
  const { personality: targetPersonality } = useTranslatorTarget()
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
      <Dropdown.Trigger>{targetPersonality}</Dropdown.Trigger>
      <Dropdown.Items>
        {personalities.map((personality) => (
          <Dropdown.Item
            key={personality}
            selected={personality === targetPersonality}
            onClick={() => handleSelect(personality)}
          >
            {personality}
          </Dropdown.Item>
        ))}
      </Dropdown.Items>
    </Dropdown>
  )
}

export function SourceLanguageSelector() {
  const { language: sourceLang } = useTranslatorSource()
  const dispatch = useTranslatorDispatch()

  // TODO: this should probably go in the TabbedDropdown.Tabs component
  // stores the recently selected langs so we can show them in the tabs
  const selectedLangsRef = useRef<{ code: string; name: string }[]>(
    languages.slice(0, MAX_SOURCE_TABS_COUNT)
  )

  const handleSelect = useCallback(
    (languageName: string | null) => {
      // TODO: transform the lang state to be Record<code, name> instead so this find isn't necessary
      const lang = languages.find((language) => language.name === languageName)

      // if languageName isn't on selectedLangsRef yet, push it and remove last item
      if (
        !!lang &&
        !selectedLangsRef.current.some((l) => l.name === languageName)
      ) {
        selectedLangsRef.current = [lang, ...selectedLangsRef.current]
        selectedLangsRef.current.pop()
      }

      dispatch({
        type: "setSourceLang",
        payload: lang?.code ?? null,
      })
    },
    [dispatch]
  )

  return (
    <TabbedDropdown>
      <TabbedDropdown.Tabs>
        <TabbedDropdown.Tab
          selected={sourceLang === null}
          onClick={() => handleSelect(null)}
        >
          Detect language
        </TabbedDropdown.Tab>
        {selectedLangsRef.current.map((language) => (
          <TabbedDropdown.Tab
            key={language.code}
            selected={language.code === sourceLang}
            onClick={() => handleSelect(language.name)}
          >
            {language.name}
          </TabbedDropdown.Tab>
        ))}
        <TabbedDropdown.Trigger />
      </TabbedDropdown.Tabs>
      <TabbedDropdown.Items>
        <TabbedDropdown.Item
          selected={sourceLang === null}
          onClick={() => handleSelect(null)}
        >
          Detect language
        </TabbedDropdown.Item>
        {languages.map((language) => (
          <TabbedDropdown.Item
            key={language.code}
            selected={language.code === sourceLang}
            onClick={() => handleSelect(language.name)}
          >
            {language.name}
          </TabbedDropdown.Item>
        ))}
      </TabbedDropdown.Items>
    </TabbedDropdown>
  )
}

export function TargetLanguageSelector() {
  const { language } = useTranslatorTarget()
  const dispatch = useTranslatorDispatch()

  const featuredCodes = useMemo(() => ["de", "en", "es"], [])

  const handleSelect = useCallback(
    (languageName: string | null) =>
      dispatch({
        type: "setTargetLang",
        payload: languages.find((l) => l.name === languageName)!.code, // safe to assume it exists since we're passing all langs to the dropdown
      }),
    [dispatch]
  )

  return <div>todo</div>
}
