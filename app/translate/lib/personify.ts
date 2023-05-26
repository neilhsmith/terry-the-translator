import "server-only"

import { Configuration, OpenAIApi } from "openai"

const instance = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
  })
)

export async function personify(text: string, targetPersonality: string) {
  //const prompt = `Convert the following text to the voice of ${targetPersonality}.\n\n${text}`
  const prompt = `Convert the following text to the voice of a ${targetPersonality}.\n\n${text}`

  // FIXME: issues with line breaks here. should the prompt be an array?

  const response = await instance.createCompletion({
    prompt,
    model: "text-davinci-003",
    max_tokens: 2000,
  })

  // TODO: handle response properly. and is createCompletion the right method here?
  return response.data.choices[0].text
}
