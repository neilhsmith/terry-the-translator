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
 *   <TabsMenu.Tabs openMode="singleClick | doubleClick" aria-label="Languages">
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
  useEffect,
  useRef,
  RefObject,
} from "react"
import { PolymorphicComponentPropsWithRef, PolymorphicRef } from "@/app/types"

/**
 * TODO:
 * - test rendering a plain element at each level w/ render props
 *    - i'm pretty sure some wont add the aria attrs they should since they aren't rendered via React.cloneElement
 *    - the Tab component is a good working example
 * - rename MenuContext to StateContext / useStateContext,  useDispatchContext
 * - implement Items and Item
 *    - might be able to remove the close logic from Tab's handleClick? it just closes any open tab, but this
 *      functionality will be handled by Items outside click.
 * - implement keyboard nav
 * - don't import 'React' and fix the errors it causes
 * - return as a compound component
 */

function useId(componentName: string) {
  const id = useReactId()
  return `tabs-menu-${componentName}-${id}`
}

function useOutsideClick<T extends HTMLElement = HTMLElement>(
  ref: RefObject<T>,
  handler: (event: Event) => void
) {
  useEffect(() => {
    const listener = (event: Event) => {
      const el = ref?.current

      if (!el || el.contains(event.target as Node)) {
        return
      }

      handler(event)
    }

    document.addEventListener("mousedown", listener)
    document.addEventListener("touchstart", listener)

    return () => {
      document.removeEventListener("mousedown", listener)
      document.removeEventListener("touchstart", listener)
    }

    // Reload only if ref or handler changes
  }, [ref, handler])
}

// STATE ---------------------------------

enum ToggleState {
  Open = "open",
  Closed = "closed",
}

type TabsOpenMode = "singleClick" | "doubleClick"

type MenuState = {
  itemsId: string // the items list id - needed for aria targets across levels
  activeTabId: string | null // the tab being hovered or focused - for aria-activedescendant
  tabsOpenMode: TabsOpenMode // how many clicks on tab before the menu opens - useful for select then open ux flows
  toggleState: ToggleState // whether the menu is open or closed
}

enum ActionType {
  ActivateTab = "activateTab",
  DeactivateTab = "deactivateTab",
  Open = "open",
  Close = "close",
  SetTabsMode = "setTabsMode",
}

type Actions =
  | { type: ActionType.ActivateTab; payload: string | null }
  | { type: ActionType.DeactivateTab }
  | { type: ActionType.Open }
  | { type: ActionType.Close }
  | { type: ActionType.SetTabsMode; payload: TabsOpenMode }

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
    case ActionType.Open:
      return {
        ...state,
        toggleState: ToggleState.Open,
      }
    case ActionType.Close:
      return {
        ...state,
        toggleState: ToggleState.Closed,
      }
    case ActionType.SetTabsMode:
      return {
        ...state,
        tabsOpenMode: action.payload,
      }
    default:
      return state
  }
}

const MenuContext = createContext<MenuState | null>(null)
const DispatchContext = createContext<Dispatch<Actions> | null>(null)

function useMenuContext(componentName: string) {
  const context = useContext(MenuContext)

  if (context === null) {
    const error = new Error(
      `<${componentName}> must be used within a <TabsMenu>`
    )
    if (Error.captureStackTrace) Error.captureStackTrace(error, useMenuContext)

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
    if (Error.captureStackTrace) Error.captureStackTrace(error, useMenuDispatch)

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
    toggleState: ToggleState.Closed,
    tabsOpenMode: "singleClick",
  })

  console.log(menuState)

  return (
    <MenuContext.Provider value={menuState}>
      <DispatchContext.Provider value={dispatch}>
        <Component ref={ref} {...rest}>
          {typeof children === "function"
            ? children({
                open: false,
                close: () => dispatch({ type: ActionType.Close }),
              })
            : children}
        </Component>
      </DispatchContext.Provider>
    </MenuContext.Provider>
  )
})

// TABS ---------------------------------

const DEFAULT_TABS_TAG = "ul"

type TabsProps = {
  openMode?: TabsOpenMode
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
    role,
    openMode = "singleClick",
    ...rest
  }: PolymorphicComponentPropsWithRef<C, TabsProps>,
  ref?: PolymorphicRef<C>
) {
  const Component = as || DEFAULT_TABS_TAG

  const { activeTabId, toggleState } = useMenuContext("Tabs")
  const dispatch = useMenuDispatch("Tabs")

  // TODO: wondering if there's a better way to do this than useEffect
  // - we're just pushing the openMode prop into the TabsMenu context
  // - but we are kinda doing sync stuff here - keeping the internal state in sync with the prop (which techically can change)
  useEffect(
    () => dispatch({ type: ActionType.SetTabsMode, payload: openMode }),
    [dispatch, openMode]
  )

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

// Tab ---------------------------------

const DEFAULT_TAB_TAG = "li"

type TabProps = {
  disabled?: boolean
  openMode?: "singleClick" | "doubleClick"
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
    openMode,
    disabled = false,
    ...rest
  }: PolymorphicComponentPropsWithRef<C, TabProps>,
  refProp?: PolymorphicRef<C>
) {
  const Component = as || DEFAULT_TAB_TAG

  const id = useId("tab")
  const dispatch = useMenuDispatch("Tab")
  const { activeTabId, itemsId, tabsOpenMode, toggleState } =
    useMenuContext("Tab")

  // need to use the ref to track outside clicks, so create one if not given
  const ref = useRef<HTMLElement>(refProp || null)

  // a tab can overrides the tabs open mode so take the local prop if given
  const actualOpenMode = openMode ?? tabsOpenMode

  // we track if the previous click was on this tab for doubleClick mode and reset it on outside clicks. named 'click' but works for touch too
  const doubleClickActive = useRef<boolean>(false)
  useOutsideClick(ref, () => {
    doubleClickActive.current = false
  })

  const handleClick = useCallback(() => {
    // note: no need to call onClick callbacks or anything as that's spread on via the ...rest already

    // if open, close
    if (toggleState === ToggleState.Open) {
      dispatch({ type: ActionType.Close })
      return
    }

    // if singleClick mode, open
    if (actualOpenMode === "singleClick") {
      dispatch({ type: ActionType.Open })
      return
    }

    // otherwise we're in doubleClick mode and need to track sequential clicks to determine if we should open the menu
    if (!doubleClickActive.current) {
      doubleClickActive.current = true
      return
    }

    // officially is a double click, so open the menu & reset the click tracker
    doubleClickActive.current = false
    dispatch({ type: ActionType.Open })
  }, [actualOpenMode, toggleState, dispatch])

  const handleHoverOn = useCallback(
    () => dispatch({ type: ActionType.ActivateTab, payload: id }),
    [dispatch, id]
  )
  const handleHoverOff = useCallback(
    () => dispatch({ type: ActionType.DeactivateTab }),
    [dispatch]
  )

  const sharedAttrs = useMemo(
    () => ({
      id: id,
      role: "menuitem",
      "aria-controls": itemsId,
      "aria-haspopup": "menu" as "menu", // the fallback button wouldn't shutup w/o this as
      "aria-expanded": toggleState === ToggleState.Open,
      ...(disabled ? { "aria-disabled": true } : {}),
      tabIndex: disabled ? -1 : 0,
      onFocus: handleHoverOn,
      onMouseEnter: handleHoverOn,
      onBlur: handleHoverOff,
      onMouseLeave: handleHoverOff,
      onClick: handleClick,
    }),
    [
      disabled,
      handleClick,
      handleHoverOn,
      handleHoverOff,
      id,
      itemsId,
      toggleState,
    ]
  )

  return (
    <Component ref={ref} role="none" {...rest}>
      {typeof children === "function"
        ? React.cloneElement(
            children({
              active: id === activeTabId,
              disabled,
              open: toggleState === ToggleState.Open,
              close: () => dispatch({ type: ActionType.Close }),
            }),
            sharedAttrs
          )
        : React.Children.map(children, (child, index) => {
            if (React.isValidElement(child)) {
              return React.cloneElement(child, {
                key: index,
                ...sharedAttrs,
              })
            }

            return (
              <button key={index} type="button" {...sharedAttrs}>
                {child}
              </button>
            )
          })}
    </Component>
  )
})
