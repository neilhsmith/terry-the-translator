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

  const handleSelect = useCallback(
    (languageName: string | null) => {
      dispatch({
        type: "setSourceLang",
        // TODO: transform the lang state to be Record<code, name> instead so this find isn't necessary
        payload:
          languages.find((language) => language.name === languageName)?.code ??
          null,
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
        <TabbedDropdown.Tab
          selected={sourceLang === "en"}
          onClick={() => handleSelect("English")}
        >
          English
        </TabbedDropdown.Tab>
        <TabbedDropdown.Tab
          selected={sourceLang === "de"}
          onClick={() => handleSelect("German")}
        >
          German
        </TabbedDropdown.Tab>
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

  // return (
  //   <Dropdown fluid>
  //     <Dropdown.Tabs>
  //       <Dropdown.Tab
  //         selected={sourceLanguage === null}
  //         onClick={() => handleSelect(null)}
  //       >
  //         Detect language
  //       </Dropdown.Tab>
  //       <Dropdown.Tab
  //         selected={sourceLanguage === "en"}
  //         onClick={() => handleSelect("English")}
  //       >
  //         English
  //       </Dropdown.Tab>
  //       <Dropdown.Tab
  //         selected={sourceLanguage === "fr"}
  //         onClick={() => handleSelect("French")}
  //       >
  //         French
  //       </Dropdown.Tab>
  //     </Dropdown.Tabs>
  //     <Dropdown.Trigger />
  //     <Dropdown.Trigger />
  //     <Dropdown.Items>
  //       <Dropdown.Item
  //         selected={sourceLanguage === null}
  //         onClick={() => handleSelect(null)}
  //       >
  //         Detect language
  //       </Dropdown.Item>
  //       {languages.map((language) => (
  //         <Dropdown.Item
  //           key={language.code}
  //           selected={language.code === sourceLanguage}
  //           onClick={() => handleSelect(language.name)}
  //         >
  //           {language.name}
  //         </Dropdown.Item>
  //       ))}
  //     </Dropdown.Items>
  //   </Dropdown>
  // )
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

  // return (
  //   <TabbedDropdown
  //     onSelect={handleSelect}
  //     items={languages.map((l) => ({
  //       value: l.name,
  //       active: l.code === language,
  //       featured: featuredCodes.includes(l.code),
  //     }))}
  //   />
  // )
}
