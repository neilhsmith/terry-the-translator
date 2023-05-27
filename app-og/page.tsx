import { Suspense } from "react"
import Translator from "@/app/translate/translator"
import Loading from "@/app/loading"

export default function Home() {
  return (
    <main id="main" role="main">
      <Suspense fallback={<Loading />}>
        {/* @ts-expect-error async server component */}
        <Translator />
      </Suspense>
    </main>
  )
}
