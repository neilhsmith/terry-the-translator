"use client"

import { useRef, useState } from "react"
import useAsyncCallback from "../hooks/useAsyncCallback"
import { Language, TranslatedText } from "./types"
import LayoutStack from "../components/layout-stack"
import Button from "../components/button"
import LanguageSelector from "./language-selector"
import { IoMdClose } from "react-icons/io"
import Dropdown from "../components/dropdown"

const personalitites = [
  "Appalachian Hillbilly",
  "California Valley Girl",
  "Cajun",
  "Surfer Bro",
]

async function fetchTranslatedText(
  text: string,
  targetLang: string,
  targetPersonality: string,
  inputLang: string | null
) {
  const res = await fetch(`${process.env.API_PATH}/translate`, {
    method: "POST",
    body: JSON.stringify({
      text,
      targetLang,
      targetPersonality,
      inputLang: inputLang,
    }),
  })

  const json = await res.json()
  return json.data as TranslatedText
}

export default function TranslatorClient({
  languages,
}: {
  languages: Language[]
}) {
  const [inputText, setInputText] = useState("")
  const [inputLang, setInputLang] = useState<Language>({
    language: "de",
    name: "German",
  }) // null when auto detecting
  const [targetLang, setTargetLang] = useState<Language>({
    language: "en",
    name: "English",
  })
  const [targetPersonality, setTargetPersonality] = useState<string>("Cajun")

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const handleChange = (value: string) => {
    setInputText(value)
  }

  // FIXME: why is being executed when targetPersonality changes?
  const [executeTranslate, translateState] =
    useAsyncCallback(fetchTranslatedText)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    executeTranslate(
      inputText,
      targetLang.language,
      targetPersonality,
      inputLang?.language ?? null
    )
  }

  return (
    <LayoutStack as="form" onSubmit={handleSubmit}>
      <div>
        <div className="flex items-center pl-2">
          <div className="flex-1">
            <LanguageSelector
              languages={languages}
              selectedLanguage={inputLang}
              onSelect={setInputLang}
            />
          </div>
          <div className="py-1">
            <Button type="submit" size="sm">
              Translate
            </Button>
          </div>
        </div>
        <div className="border rounded-lg relative pt-4 pl-2">
          <Button
            type="reset"
            className="absolute top-2 right-1 p-4 flex justify-center items-center aspect-square rounded-full"
            onClick={() => setInputText("")}
          >
            <IoMdClose />
          </Button>
          <textarea
            ref={textareaRef}
            className="w-11/12 h-5/6 bg-transparent resize-none min-h-[6rem] overflow-y-hidden focus:outline-none"
            value={inputText}
            onChange={(e) => handleChange(e.target.value)}
            maxLength={5000}
            style={{
              height: textareaRef.current?.scrollHeight,
            }}
          />
          <div className="py-2 px-5 flex justify-end">
            {inputText.length} / 5000
          </div>
        </div>
      </div>
      <div className="flex flex-col h-full">
        <div className="flex items-center pl-2">
          <div className="flex-1">
            <LanguageSelector
              languages={languages}
              selectedLanguage={targetLang}
              onSelect={setTargetLang}
            />
          </div>
          <div className="py-1">
            <Dropdown>
              <Dropdown.Trigger>{targetPersonality}</Dropdown.Trigger>
              <Dropdown.Items>
                {personalitites.map((personality) => (
                  <Dropdown.Item
                    key={personality}
                    selected={personality === targetPersonality}
                    onClick={() => setTargetPersonality(personality)}
                  >
                    {personality}
                  </Dropdown.Item>
                ))}
              </Dropdown.Items>
            </Dropdown>
            {/* <Menu as="div" className="relative inline-block text-left">
              <Menu.Button as={Button} size="sm">
                {targetPersonality}
                <BsChevronDown className="ml-2" />
              </Menu.Button>
              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {personalitites.map((personality) => (
                    <div key={personality} className="px-1 py-1 ">
                      <Menu.Item>
                        <button
                          className="text-gray-900 group flex w-full items-center rounded-md px-2 py-2 text-sm"
                          onClick={() => setTargetPersonality(personality)}
                        >
                          {personality}
                        </button>
                      </Menu.Item>
                    </div>
                  ))}
                </Menu.Items>
              </Transition>
            </Menu> */}
          </div>
        </div>
        <div className="border rounded-lg py-4 px-2 flex-grow">
          <span>
            {translateState.status === "success"
              ? translateState.value.translatedText
              : null}
          </span>
        </div>
      </div>
    </LayoutStack>
  )
}
