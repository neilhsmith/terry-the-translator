// https://github.com/ohansemmanuel/polymorphic-react-component

import React from "react"

// TODO: create versions w/o children
// TODO: don't allow a ref prop if as was not explicitly set, otherwise we're allowed to set a ref w/ the wrong type

export type PolymorphicComponentProps<
  C extends React.ElementType,
  Props = {}
> = AsProp<C> &
  Props &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>

export type PolymorphicComponentPropsWithRef<
  C extends React.ElementType,
  Props = {}
> = PolymorphicComponentProps<C, Props> & {
  ref?: PolymorphicRef<C>
}

/**
 * Utility type for creating polymorphic components without forwardRef. Provides an optional `as` prop which determines which element is rendered and which props are available. Omits fields from the underlying element when conflicting with fields found on Props.
 *
 * Example:
 * ```
 * type ComponentProps<C extends React.ReactElement> = PolymorphicComponentProps<C, {
 *   foo: string
 * }>
 *
 * function SomeComponent<C extends React.ReactElement = "div">(props: ComponentProps<C>) {
 *   return ...
 * }
 * ```
 *
 * Usage:
 * ```
 * <SomeComponent as="a" href="https://google.com" foo="bar" />
 * ```
 */
export type PolymorphicComponentPropsWithChildren<
  C extends React.ElementType,
  Props = {}
> = React.PropsWithChildren<AsProp<C> & Props> &
  Omit<React.ComponentPropsWithoutRef<C>, PropsToOmit<C, Props>>

/**
 * Utility type for creating polymorphic components with forwardRef. Provides an optional `as` prop, which determines which element is rendered and which props are available, and an optional `ref`. Omits fields from the underlying element when conflicting with fields found on Props.
 *
 * Example:
 * ```
 * // type the component's props
 * type ExampleProps<C extends React.ReactElement> = PolymorphicComponentPropsWithRef<C, {
 *   foo: string
 * }>
 *
 * // type the component itself (needed so the ref prop is correctly typed)
 * type ExampleComponent = <C extends React.ReactElement = "div">(
 *   props: PolymorphicComponentPropsWithRef<C, ExampleProps<C>>
 * ) => React.ReactElement | null
 *
 * // set the return type and use forwardRef
 * const Example: ExampleComponent = React.forwardRef(
 *   function SomeComponent<C extends React.ReactElement = "div">(
 *     props: PolymorphicComponentPropsWithRef<C, ExampleProps<C>>,
 *     ref: PolymorphicRef<C>
 *   ) {
 *     return ...
 *   }
 * )
 *
 * Usage:
 * const buttonRef = useRef<HTMLButtonElement>(null)
 * <SomeComponent as="button" ref={buttonRef} foo="bar" />
 * ```
 */
export type PolymorphicComponentPropsWithRefAndChildren<
  C extends React.ElementType,
  Props = {}
> = PolymorphicComponentPropsWithChildren<C, Props> & {
  ref?: PolymorphicRef<C>
}

/**
 * Utility type used for the ref prop when using PolymorphicComponentPropsWithRef.
 *
 * Example:
 * ```
 * function SomeComponent<C extends React.ReactElement = "div">(
 *   props: PolymorphicComponentPropsWithRef<C, {}>,
 *   ref: PolymorphicRef<C>
 * ) {
 *   return ...
 * }
 * ```
 *
 * Usage:
 * ```
 * const buttonRef = useRef<HTMLButtonElement>(null)
 * <SomeComponent as="button" ref={buttonRef} foo="bar" />
 * ```
 */
export type PolymorphicRef<C extends React.ElementType> =
  React.ComponentPropsWithRef<C>["ref"]

// ---

type AsProp<C extends React.ElementType> = {
  as?: C
}

type PropsToOmit<C extends React.ElementType, Props> = keyof (AsProp<C> & Props)
