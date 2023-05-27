import { NextResponse } from "next/server"
import { TranslateRequestPayload } from "./types"
import { getLanguages, translate } from "./lib/translate"
import { personify } from "./lib/personify"

export async function GET() {
  try {
    const languages = await getLanguages()

    return NextResponse.json({
      data: languages,
    })
  } catch (err) {
    return NextResponse.json(
      {
        data: err,
      },
      {
        status: 500,
      }
    )
  }
}

export async function POST(req: Request) {
  const { text, inputLang, targetLang, targetPersonality } =
    (await req.json()) as TranslateRequestPayload

  try {
    const translateResult = await translate(text, targetLang, inputLang)
    const personifiedText = await personify(
      translateResult.translatedText,
      targetPersonality
    )

    return NextResponse.json({
      data: {
        translatedText: personifiedText,
        translatedPersonality: targetPersonality,
        detectedSourceLanguage: translateResult.detectedSourceLanguage,
      },
    })
  } catch (err) {
    return NextResponse.json(
      {
        data: err,
      },
      {
        status: 500,
      }
    )
  }
}
