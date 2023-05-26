import "server-only"
import TranslatorClient from "./client"

async function getLanguages() {
  const res = await fetch("http://localhost:3000/translate")
  if (!res.ok) throw new Error("Failed to fetch languages")
  const json = await res.json()
  return json.data
}

export default async function Translator() {
  const languages = await getLanguages()

  return <TranslatorClient languages={languages} />
}

// "use client"

// import { useState } from "react"
// import { TranslatedText } from "@/app/translate/types"
// import useAsyncCallback from "@/app/hooks/useAsyncCallback"
// import LayoutStack from "@/app/components/layout-stack"

// async function fetchTranslatedText(
//   text: string,
//   targetLang: string,
//   targetPersonality: string,
//   inputLang: string | null
// ) {
//   const res = await fetch("/translate", {
//     method: "POST",
//     body: JSON.stringify({
//       text,
//       targetLang,
//       targetPersonality,
//       inputLang: inputLang,
//     }),
//   })

//   const json = await res.json()
//   return json.data as TranslatedText
// }

// export default function Translator() {
//   const [inputLang, setInputLang] = useState<string | null>(null) // null means 'detect language'
//   const [targetLang, setTargetLang] = useState("en")
//   const [targetPersonality, setTargetPersonality] = useState(
//     "California Valley Girl"
//   )

//   const [executeTranslate, translateState] =
//     useAsyncCallback(fetchTranslatedText)

//   return (
//     <LayoutStack>
//       <div className="border">
//         {/* <TranslatorForm onSubmit={executeTranslate} /> */}
//         <button
//           onClick={() =>
//             executeTranslate(
//               "Hallo, ich bin jemand, der etwas testet",
//               targetLang,
//               targetPersonality,
//               inputLang
//             )
//           }
//         >
//           Hallo, ich bin jemand, der etwas testet
//         </button>
//       </div>
//       <div className="border">
//         {translateState.status === "success" ? (
//           <span>{translateState.value.translatedText}</span>
//         ) : null}
//       </div>
//     </LayoutStack>
//   )
// }

// function InputController({ onSubmit }: { onSubmit: (text: string) => void }) {
//   // displays input language selection, 'detect langauge' by default
//   // displays a submit button
//   //
// }
