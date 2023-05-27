import Dropdown from "../components/dropdown"
import { Language } from "./types"

const commonLanguages = ["en", "de", "es"]

export default function LanguageSelector({
  languages,
  selectedLanguage,
  onSelect,
}: {
  autoDetect?: string
  languages: Language[]
  selectedLanguage: Language
  onSelect: (language: Language) => void
}) {
  return (
    <Dropdown fluid>
      <Dropdown.Trigger>{selectedLanguage.name}</Dropdown.Trigger>
      <Dropdown.Items>
        {languages.map((language) => (
          <Dropdown.Item
            key={language.language}
            selected={language.language === selectedLanguage.language}
            onClick={() => onSelect(language)}
          >
            {language.name}
          </Dropdown.Item>
        ))}
      </Dropdown.Items>
    </Dropdown>
  )
}
