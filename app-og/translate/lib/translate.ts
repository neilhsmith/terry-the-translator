import "server-only"

import { Language, type TranslatedText } from "../types"
import { v2 as v2Translate } from "@google-cloud/translate"

const credential = JSON.parse(
  Buffer.from(process.env.GOOGLE_SERVICE_KEY as string, "base64").toString()
)

const instance = new v2Translate.Translate({
  projectId: "terry-the-translator",
  credentials: {
    client_email: credential.client_email,
    private_key: credential.private_key,
  },
})

export async function translate(
  text: string,
  targetLang: string,
  inputLang: string | null
): Promise<TranslatedText> {
  const result = await instance.translate(text, {
    to: targetLang,
    ...(inputLang ? { from: inputLang } : {}),
  })

  // result[1] is the response object
  // its safe to grab the first translation since we only sent one and can rely on only 1 coming back
  return result[1].data.translations[0]
}

export async function getLanguages(): Promise<Language[]> {
  const result = await instance.getLanguages()

  return result[1].data.languages
}
