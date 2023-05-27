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
    <>
      <Header>
        <div>languages</div>
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
    </>
  )
}

export function Results() {
  return (
    <div className="flex flex-col h-full">
      <Header>
        <div>languages</div>
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

function Header({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-2">{children}</div>
  )
}

export function Body({ children }: { children: ReactNode }) {
  return <div className={bodyClasses}>{children}</div>
}

function Content({ children }: { children: ReactNode }) {
  return <div className="flex-1 flex flex-col h-full">{children}</div>
}

function MainAction({ children }: { children: ReactNode }) {
  return <div className="-mt-2 w-8 md:w-10 lg:w-12 text-center">{children}</div>
}

function Actions({ children }: { children: ReactNode }) {
  return <div className="flex items-center justify-end mt-4">{children}</div>
}
