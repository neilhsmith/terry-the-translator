import HomeCTA from "@/app/cta"
import Translator from "@/app/translate/translator"

export default function Home() {
  return (
    <>
      <HomeCTA />
      <main id="main" role="main" className="py-16">
        <Translator />
      </main>
    </>
  )
}
