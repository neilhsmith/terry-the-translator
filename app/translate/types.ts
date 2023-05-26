export type Language = {
  language: string
  name: string
}

export type TranslatedText = {
  translatedText: string
  detectedSourceLanguage: string
}

export type TranslateRequestPayload = {
  text: string
  inputLang: string | null
  targetLang: string
  targetPersonality: string
}
