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
 * - decide how Tab & Item should work w/ different children types
 *    - issue: when do we add the aria attributes to the 'wrapper' ele vs 'injecting' them onto the child via cloneElement?
 *             it gets difficult when considering a ReactElement which could be a span or div wrapping text & an icon
 *             or it could be a button w/ the expecation that it would become the menuitem and receive the attrs
 *             so i need to make a decision, implement it, and make sure the docs reflect how it should work
 *             im thinking that a function child will not render the wrapper ele and will instead inject the attrs onto the child
 *               unless an as prop is given but will then set role="none" on the wrapper. so this can break if you were to set
 *               as="button" and then pass a function which returns the menuitem element
 *    - string/number: render Component w/ ...rest & aria attrs & the children like normal
 *    - todo: figure out how a function child should work and if the existance of an 'as' prop should affect it
 *    - todo: figure out how a ReactElement child should work and if the existance of an 'as' prop should affect it
 * - implement keyboard nav
 *    - might be able to remove Tab's close logic in handleClick. the Items useOutsideClick will handle it
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
  tabIds: string[] // the ids of each tab - needed for the item's aria-labelledby
  activeTabId: string | null // the tab being hovered or focused - for the tab's aria-activedescendant
  activeItemId: string | null // the item being hovered or focused - for the item's aria-activedescendant
  tabsOpenMode: TabsOpenMode // how many clicks on tab before the menu opens - useful for select then open ux flows
  toggleState: ToggleState // whether the menu is open or closed
}

enum ActionType {
  AddTab = "addTab",
  RemoveTab = "removeTab",
  ActivateTab = "activateTab",
  DeactivateTab = "deactivateTab",
  Open = "open",
  Close = "close",
  SetTabsMode = "setTabsMode",
  ActivateItem = "activateItem",
  DeactivateItem = "deactivateItem",
}

type Actions =
  | { type: ActionType.AddTab; payload: string }
  | { type: ActionType.RemoveTab; payload: string }
  | { type: ActionType.ActivateTab; payload: string | null }
  | { type: ActionType.DeactivateTab }
  | { type: ActionType.Open }
  | { type: ActionType.Close }
  | { type: ActionType.SetTabsMode; payload: TabsOpenMode }
  | { type: ActionType.ActivateItem; payload: string }
  | { type: ActionType.DeactivateItem }

function menuReducer(state: MenuState, action: Actions) {
  switch (action.type) {
    case ActionType.AddTab:
      return {
        ...state,
        tabIds: [...state.tabIds, action.payload],
      }
    case ActionType.RemoveTab:
      return {
        ...state,
        tabIds: state.tabIds.filter((id) => id !== action.payload),
      }
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
    case ActionType.ActivateItem:
      return {
        ...state,
        activeItemId: action.payload,
      }
    case ActionType.DeactivateItem:
      return {
        ...state,
        activeItemId: null,
      }
    default:
      return state
  }
}

const StateContext = createContext<MenuState | null>(null)
const DispatchContext = createContext<Dispatch<Actions> | null>(null)

function useMenuState(componentName: string) {
  const context = useContext(StateContext)

  if (context === null) {
    const error = new Error(
      `<${componentName}> must be used within a <TabsMenu>`
    )
    if (Error.captureStackTrace) Error.captureStackTrace(error, useMenuState)

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
    tabIds: [],
    activeTabId: null,
    activeItemId: null,
    toggleState: ToggleState.Closed,
    tabsOpenMode: "singleClick",
  })

  console.log(menuState)

  return (
    <StateContext.Provider value={menuState}>
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
    </StateContext.Provider>
  )
})

// TABS ---------------------------------

const DEFAULT_TABS_TAG = "div"

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

  const { activeTabId, toggleState } = useMenuState("Tabs")
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

const DEFAULT_TAB_TAG = "button"

type TabProps = {
  disabled?: boolean
  openMode?: "singleClick" | "doubleClick"
  children:
    | React.ReactElement
    | string
    | number
    | null
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
    useMenuState("Tab")

  useEffect(() => {
    dispatch({ type: ActionType.AddTab, payload: id })
    return () => dispatch({ type: ActionType.RemoveTab, payload: id })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

  if (typeof children === "function") {
    return (
      <Component ref={ref} role="none" {...rest}>
        {React.cloneElement(
          children({
            active: id === activeTabId,
            disabled,
            open: toggleState === ToggleState.Open,
            close: () => dispatch({ type: ActionType.Close }),
          }),
          sharedAttrs
        )}
      </Component>
    )
  }

  return (
    <Component ref={ref} {...rest} {...sharedAttrs}>
      {children}
    </Component>
  )
})

// Items ---------------------------------

const DEFAULT_ITEMS_TAG = "div"

type ItemsProps = {
  children: ReactNode | (({ open }: { open: boolean }) => ReactNode)
} & (
  | { static?: boolean; unmount?: undefined }
  | { static?: undefined; unmount?: boolean }
)

type ItemsComponent = <C extends React.ElementType = typeof DEFAULT_ITEMS_TAG>(
  props: PolymorphicComponentPropsWithRef<C, ItemsProps>
) => React.ReactElement | null

export const Items: ItemsComponent = forwardRef(function Items<
  C extends React.ElementType = typeof DEFAULT_ITEMS_TAG
>(
  {
    as,
    children,
    unmount,
    static: isStatic,
    ...rest
  }: PolymorphicComponentPropsWithRef<C, ItemsProps>,
  ref?: PolymorphicRef<C>
) {
  const Component = as || DEFAULT_ITEMS_TAG

  const { activeItemId, itemsId, tabIds, toggleState } = useMenuState("Items")

  // want to unmount if static is true. otherwise, want to respect the unmount prop or default to true if it wasn't given.
  const shouldUnmount = !isStatic && (unmount ?? true)
  if (shouldUnmount && toggleState === ToggleState.Closed) return null

  const shouldHide = !isStatic && toggleState === ToggleState.Closed

  return (
    <Component
      ref={ref}
      id={itemsId}
      role="menu"
      aria-labelledby={tabIds.join(" ")}
      tabIndex={0}
      {...rest}
      {...(activeItemId ? { "aria-activedescendant": activeItemId } : {})}
      {...(shouldHide
        ? {
            hidden: true,
            style: { display: "none" },
          }
        : {})}
    >
      {typeof children === "function"
        ? children({ open: toggleState === ToggleState.Open })
        : children}
    </Component>
  )
})

// Item ---------------------------------

const DEFAULT_ITEM_TAG = "button"

type ItemProps = {
  disabled?: boolean
  role?: "none"
  children:
    | React.ReactElement
    | string
    | number
    | null
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
      }) => React.ReactElement) // TODO: add string, number, null to this when i create the type. add to Tab too
}

type ItemComponent = <C extends React.ElementType = typeof DEFAULT_ITEM_TAG>(
  props: PolymorphicComponentPropsWithRef<C, ItemProps>
) => React.ReactElement | null

export const Item: ItemComponent = forwardRef(function Item<
  C extends React.ElementType = typeof DEFAULT_ITEM_TAG
>(
  {
    as,
    children,
    disabled = false,
    ...rest
  }: PolymorphicComponentPropsWithRef<C, ItemProps>,
  ref?: PolymorphicRef<C>
) {
  const Component = as || DEFAULT_ITEM_TAG

  const id = useId("item")
  const dispatch = useMenuDispatch("Item")

  const handleHoverOn = useCallback(
    () => dispatch({ type: ActionType.ActivateItem, payload: id }),
    [dispatch, id]
  )
  const handleHoverOff = useCallback(
    () => dispatch({ type: ActionType.DeactivateItem }),
    [dispatch]
  )

  const sharedAttrs = useMemo(
    () => ({
      id,
      role: "menuitem" as "menuitem",
      tabIndex: disabled ? -1 : 0,
      ...(disabled ? { "aria-disabled": true } : {}),
      onFocus: handleHoverOn,
      onMouseEnter: handleHoverOn,
      onBlur: handleHoverOff,
      onMouseLeave: handleHoverOff,
    }),
    [disabled, id, handleHoverOn, handleHoverOff]
  )

  if (typeof children === "function") {
    return (
      <Component ref={ref} role="none" {...rest}>
        {React.cloneElement(
          children({
            active: true,
            disabled: true,
            open: true,
            close: () => {},
          }),
          sharedAttrs
        )}
      </Component>
    )
  }

  return (
    <Component ref={ref} {...rest} {...sharedAttrs}>
      {children}
    </Component>
  )
})
