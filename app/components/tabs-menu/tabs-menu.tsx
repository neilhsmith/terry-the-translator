"use client"

/**
 * ARIA APG
 * - https://www.w3.org/WAI/ARIA/apg/patterns/menubar/
 * - https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/
 * - aria-labelledby multiple ids: https://www.w3.org/TR/wai-aria/#typemapping
 *
 * Note: although we call this component a 'tabs-menu', we aren't implementing the ARIA Tabs pattern (https://www.w3.org/WAI/ARIA/apg/patterns/tabs/) because it requires a unique tab panel per tab button. We are using the same panel for all buttons.
 *
 * Example:
 *
 * <TabsMenu>
 *   <TabsMenu.Tabs mode="selectAndOpen | selectThenOpen" aria-label="Languages">
 *     <TabsMenu.Tab>
 *       {({active, disabled, menuOpen}) => (
 *         <button ...classes & props based on render props...>Item 1</button>
 *       )}
 *     </TabsMenu.Tab>
 *     <TabsMenu.Tab>
 *       {({active, disabled, menuOpen}) => (
 *         <button ...classes & props based on render props...>Item 2</button>
 *       )}
 *     </TabsMenu.Tab>
 *   </TabsMenu.Tabs>
 *   <TabsMenu.Items static={false} unmount={false}>
 *     {({active}) => (...)} TO BE USED TO HIDE WHEN static IS TRUE
 *     <TabsMenu.Item>
 *       {({active, disabled}) => (
 *         <button type="button">Item 1</button>
 *       )}
 *     </TabsMenu.Item>
 *   </TabsMenu.Items>
 * </TabsMenu>
 *
 * Renders:
 * <>
 *   <ul role="menubar" aria-label="Languages">
 *     <li role="none">
 *       <button id="tab1" type="button" role="menuitem" aria-haspopup="true" aria-controls="menu" aria-expanded="false">Tab 1</button>
 *     </li>
 *     <li role="none">
 *       <button id="tab2" type="button" aria-haspopup="true" aria-controls="menu" aria-expanded="false">Tab 1</button>
 *     </li>
 *     <li role="none">
 *       <button id="tab3" type="button" aria-haspopup="true" aria-controls="menu" aria-expanded="false">Tab 1</button>
 *     </li>
 *   </ul>
 *   <ul id="menu" role="menu" tabindex="-1" aria-labelledby="tab1 tab2 tab3" aria-activedescendant style="display: none;">
 *     <li id="mi1" role="menuitem" tabindex="-1">Item 1</li>
 *     OR
 *     <li role="none"><button id="mi1" type="button" role="menuitem" tabindex="-1">Item 1</button></li>
 *   </ul>
 * </>
 */

import React, {
  createContext,
  Dispatch,
  forwardRef,
  useCallback,
  useContext,
  useId as useReactId,
  useMemo,
  useReducer,
  ReactNode,
} from "react"
import { PolymorphicComponentPropsWithRef, PolymorphicRef } from "@/app/types"

/**
 * TODO:
 * - test rendering a plain element at each level w/ render props
 *    - i'm pretty sure some wont add the aria attrs they should since they aren't rendered via React.cloneElement
 *    - the Tab component is a good working example
 * - figure out how to handle the Tab's "selectAndOpen" vs "selectThenOpen" mode thing
 *    - the issue is that we don't actually have the concept of selecting internally
 *    - so do i treat it as singleClick vs doubleClick before opening the items?
 *    - or do i make it so that it's always a double click on a Tab to open the items?
 *    - not ideal but - add an 'open' callback to the render prop so that we can manually open when needed?
 *    - also, should onClick fire when double clicking a tab?
 * - implement the toggle state
 *    - theres mocked close callbacks for render props sprinkled around
 * - implement Items and Item
 * - implement keyboard nav
 * - return as a compound component
 */

function useId(componentName: string) {
  const id = useReactId()
  return `tabs-menu-${componentName}-${id}`
}

// STATE ---------------------------------

enum ToggleState {
  Open = "open",
  Closed = "closed",
}

type MenuState = {
  itemsId: string
  activeTabId: string | null // the tab being hovered or focused for aria-activedescendant
}

enum ActionType {
  ActivateTab = "activateTab",
  DeactivateTab = "deactivateTab",
}

type Actions =
  | { type: ActionType.ActivateTab; payload: string | null }
  | { type: ActionType.DeactivateTab }

function menuReducer(state: MenuState, action: Actions) {
  switch (action.type) {
    case ActionType.ActivateTab:
      return {
        ...state,
        activeTabId: action.payload,
      }
    case ActionType.DeactivateTab:
      return {
        ...state,
        activeTabId: null,
      }
    default:
      return state
  }
}

const ToggleContext = createContext<ToggleState | null>(null)
const MenuContext = createContext<MenuState | null>(null)
const DispatchContext = createContext<Dispatch<Actions> | null>(null)

function useToggleContext(componentName: string) {
  const context = useContext(ToggleContext)

  if (context === null) {
    const error = new Error(
      `<${componentName}> must be used within a <TabsMenu>`
    )
    if (Error.captureStackTrace)
      Error.captureStackTrace(error, useToggleContext)

    throw error
  }

  return context
}

function useMenuContext(componentName: string) {
  const context = useContext(MenuContext)

  if (context === null) {
    const error = new Error(
      `<${componentName}> must be used within a <TabsMenu>`
    )
    if (Error.captureStackTrace)
      Error.captureStackTrace(error, useToggleContext)

    throw error
  }

  return context
}

function useMenuDispatch(componentName: string) {
  const context = useContext(DispatchContext)

  if (context === null) {
    const error = new Error(
      `<${componentName}> must be used within a <TabsMenu>`
    )
    if (Error.captureStackTrace)
      Error.captureStackTrace(error, useToggleContext)

    throw error
  }

  return context
}

// MENU ---------------------------------

const DEFAULT_MENU_TAG = React.Fragment

type TabsMenuProps = {
  children:
    | ReactNode
    | (({ open, close }: { open: boolean; close: () => void }) => ReactNode)
}

type TabsMenuComponent = <
  C extends React.ElementType = typeof DEFAULT_MENU_TAG
>(
  props: PolymorphicComponentPropsWithRef<C, TabsMenuProps>
) => React.ReactElement | null

export const TabsMenu: TabsMenuComponent = forwardRef(function TabsMenu<
  C extends React.ElementType = typeof DEFAULT_MENU_TAG
>(
  { as, children, ...rest }: PolymorphicComponentPropsWithRef<C, TabsMenuProps>,
  ref?: PolymorphicRef<C>
) {
  const Component = as || DEFAULT_MENU_TAG

  const itemsId = useId("items")
  const [menuState, dispatch] = useReducer(menuReducer, {
    itemsId: itemsId,
    activeTabId: null,
  })

  return (
    <MenuContext.Provider value={menuState}>
      <ToggleContext.Provider value={ToggleState.Closed}>
        <DispatchContext.Provider value={dispatch}>
          <Component ref={ref} {...rest}>
            {typeof children === "function"
              ? children({ open: false, close: () => {} })
              : children}
          </Component>
        </DispatchContext.Provider>
      </ToggleContext.Provider>
    </MenuContext.Provider>
  )
})

// TABS ---------------------------------

const DEFAULT_TABS_TAG = "ul"

type TabsProps = {
  mode?: "selectAndOpen" | "selectThenOpen"
  role?: undefined
  children: ReactNode | (({ open }: { open: boolean }) => ReactNode)
}

type TabsComponent = <C extends React.ElementType = typeof DEFAULT_TABS_TAG>(
  props: PolymorphicComponentPropsWithRef<C, TabsProps>
) => React.ReactElement | null

export const Tabs: TabsComponent = forwardRef(function Tabs<
  C extends React.ElementType = typeof DEFAULT_TABS_TAG
>(
  {
    as,
    children,
    mode = "selectThenOpen",
    role,
    ...rest
  }: PolymorphicComponentPropsWithRef<C, TabsProps>,
  ref?: PolymorphicRef<C>
) {
  const Component = as || DEFAULT_TABS_TAG

  const { activeTabId } = useMenuContext("Tabs")
  const toggleState = useToggleContext("Tabs")

  return (
    <Component
      ref={ref}
      role="menubar"
      {...rest}
      {...(activeTabId ? { "aria-activedescendant": activeTabId } : {})}
    >
      {typeof children === "function"
        ? children({ open: toggleState === ToggleState.Open })
        : children}
    </Component>
  )
})

// BUTTON ---------------------------------

const DEFAULT_TAB_TAG = "li"

type TabProps = {
  disabled?: boolean
  children:
    | ReactNode
    | (({
        active,
        disabled,
        open,
        close,
      }: {
        active: boolean
        disabled: boolean
        open: boolean
        close: () => void
      }) => React.ReactElement)
}

type TabComponent = <C extends React.ElementType = typeof DEFAULT_TAB_TAG>(
  props: PolymorphicComponentPropsWithRef<C, TabProps>
) => React.ReactElement | null

export const Tab: TabComponent = forwardRef(function Tab<
  C extends React.ElementType = typeof DEFAULT_TAB_TAG
>(
  {
    as,
    children,
    disabled = false,
    ...rest
  }: PolymorphicComponentPropsWithRef<C, TabProps>,
  ref?: PolymorphicRef<C>
) {
  const Component = as || DEFAULT_TAB_TAG

  const id = useId("button")
  const { activeTabId, itemsId } = useMenuContext("Button")
  const toggleState = useToggleContext("Button")
  const dispatch = useMenuDispatch("Button")

  const hoverOn = useCallback(
    () => dispatch({ type: ActionType.ActivateTab, payload: id }),
    [dispatch, id]
  )
  const hoverOff = useCallback(
    () => dispatch({ type: ActionType.DeactivateTab }),
    [dispatch]
  )

  const attrs = useMemo(
    () => ({
      id: id,
      role: "menuitem",
      "aria-controls": itemsId,
      "aria-haspopup": "menu" as "menu", // the fallback button wouldn't shutup w/o this as
      "aria-expanded": toggleState === ToggleState.Open,
      "aria-disabled": disabled,
      onFocus: hoverOn,
      onMouseEnter: hoverOn,
      onBlur: hoverOff,
      onMouseLeave: hoverOff,
    }),
    [disabled, hoverOn, hoverOff, id, itemsId, toggleState]
  )

  return (
    <Component ref={ref} role="none" {...rest}>
      {typeof children === "function"
        ? React.cloneElement(
            children({
              active: id === activeTabId,
              disabled,
              open: toggleState === ToggleState.Open,
              close: () => {},
            }),
            attrs
          )
        : React.Children.map(children, (child, index) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                key: index,
                ...attrs,
              })
            }

            return (
              <button key={index} type="button" {...attrs}>
                {child}
              </button>
            )
          })}
    </Component>
  )
})
