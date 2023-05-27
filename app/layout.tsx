import "./globals.css"
import SkipToContent from "@/app/components/skip-to-content"
import Header from "@/app/header"
import Footer from "@/app/footer"

export const metadata = {
  title: "[todo]",
  description: "[todo]",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-sans text-base relative container mx-auto min-h-screen flex flex-col">
        <SkipToContent />
        <Header />
        <div className="flex-1 py-12 md:py-16 lg:py-20">{children}</div>
        <Footer />
      </body>
    </html>
  )
}
