import "server-only"
import TranslatorClient from "./client"
import { getLanguages } from "./lib/translate"

// async function getLanguages() {
//   const res = await fetch(`${process.env.API_PATH}/translate`)
//   if (!res.ok) throw new Error("Failed to fetch languages")
//   const json = await res.json()
//   return json.data
// }

export default async function Translator() {
  const languages = await getLanguages()

  return <TranslatorClient languages={languages} />
}
