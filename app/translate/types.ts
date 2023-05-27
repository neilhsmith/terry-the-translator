export type Language = {
  code: string
  name: string
}

export type TranslatedText = {
  text: string
  detectedSourceLanguage: string
}

export type TranslateRequestPayload = {
  // the text to translate
  text: string

  // the language code to translate to, e.g. 'en'
  targetLang: string

  // the personality to translate to, e.g. 'pirate'
  targetPersonality: string

  // the language code to translate from, e.g. 'en'
  // null or undefined if the language should be auto-detected
  inputLang?: string | null
}

export type TranslateResponsePayload = {
  // the translated & personified text
  resultText: string

  // translation metadata, null if the request targeted the same lang as the input
  translationMetadata?: {
    // the text that was translated
    inputText: string

    // the translated text
    resultText: string

    // the language code of the source text, e.g. 'en'
    sourceLang: string

    // the language code of the tearget text, e.g. 'de'
    targetLang: string

    // the google translate model used to translate the text, e.g. 'nmt' or a custom model's id
    model: string
  }

  // personality metadata
  personalityMetadata: {
    // the text that was personified
    inputText: string

    // the personified text
    resultText: string

    // the personality model used to personalize the text, e.g. 'pirate'
    targetPersonality: string

    // the OpenAI model used to personalize the text, e.g. 'davinci-003'
    model: string
  }
}
