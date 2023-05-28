import { ReactNode } from "react"
import TranslatorProvider from "@/app/translate/provider"
import LayoutGrid from "@/app/translate/layout"
import {
  bodyClasses,
  ClearInputTextButton,
  ClickableBody,
  PersonalitiesDropdown,
  SourceLengthLabel,
  SubmitButton,
  Textarea,
  SourceLanguageSelector,
  TargetLanguageSelector,
} from "@/app/translate/client"

export default function Translator() {
  return (
    <TranslatorProvider>
      <LayoutGrid>
        <Controller />
        <Results />
      </LayoutGrid>
    </TranslatorProvider>
  )
}

export function Controller() {
  return (
    <div className="relative">
      <Header>
        <SourceLanguageSelector />
        <SubmitButton />
      </Header>
      <ClickableBody>
        <Content>
          <Textarea />
          <Actions>
            <SourceLengthLabel />
          </Actions>
        </Content>
        <MainAction>
          <ClearInputTextButton />
        </MainAction>
      </ClickableBody>
    </div>
  )
}

export function Results() {
  return (
    <div className="relative flex flex-col h-full">
      <Header>
        <TargetLanguageSelector />
        <PersonalitiesDropdown />
      </Header>
      <Body>
        <Content>
          <div className="border flex-1">results</div>
          <Actions>actions</Actions>
        </Content>
        <MainAction>
          <button>h</button>
        </MainAction>
      </Body>
    </div>
  )
}

const Header = ({ children }: { children: ReactNode }) => (
  <div className="flex items-center justify-between mb-2">{children}</div>
)

export const Body = ({ children }: { children: ReactNode }) => (
  <div className={bodyClasses}>{children}</div>
)

const Content = ({ children }: { children: ReactNode }) => (
  <div className="flex-1 flex flex-col h-full">{children}</div>
)

const MainAction = ({ children }: { children: ReactNode }) => (
  <div className="-mt-2 w-8 md:w-10 lg:w-12 text-center">{children}</div>
)

const Actions = ({ children }: { children: ReactNode }) => (
  <div className="flex items-center justify-end mt-4">{children}</div>
)
