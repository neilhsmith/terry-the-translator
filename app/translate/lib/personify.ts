import "server-only"

import { Configuration, OpenAIApi } from "openai"

const instance = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
)

export async function personify(text: string, targetPersonality: string) {
  const prompt = `Convert the following text to the voice of ${targetPersonality}.\n\n${text}`

  const response = await instance.createCompletion({
    prompt,
    model: "text-davinci-002",
    max_tokens: 256,
  })

  // TODO: handle response properly. and is createCompletion the right method here?
  return response.data.choices[0].text
}
