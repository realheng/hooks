import { useMemo, useRef } from 'react'
import useMemoizedFn from '../useMemoizedFn'
import useUpdate from '../useUpdate'

export interface Options<T> {
  defaultValue?: T
  defaultValuePropName?: string
  valuePropName?: string
  trigger?: string
}

export type Props = Record<string, any>

export interface StandardProps<T> {
  value: T
  defaultValue?: T
  onChange: (val: T) => void
}

function useControllableValue<T = any>(props: StandardProps<T>): [T, (val: T) => void]
function useControllableValue<T = any>(
  props?: Props,
  options?: Options<T>,
): [T, (v: T, ...args: any[]) => void]
function useControllableValue<T = any>(props: Props = {}, options: Options<T> = {}) {
  const {
    defaultValue,
    defaultValuePropName = 'defaultValue',
    valuePropName = 'value',
    trigger = 'onChange',
  } = options

  const value = props[valuePropName] as T
  const isControlled = valuePropName in props

  const initialValue = useMemo(() => {
    if (isControlled) {
      return value
    }
    if (defaultValuePropName in props) {
      return props[defaultValuePropName]
    }
    return defaultValue
  }, [])

  const stateRef = useRef(initialValue)
  if (isControlled) {
    stateRef.current = value
  }

  const update = useUpdate()

  const setState = (v: T, ...args: any[]) => {
    // 如果受控的话，那么就用props中的trigger
    // 如果不受控的话，就用自己的state
    // 是否受控根据props是否有value属性来判断的
    if (!isControlled) {
      stateRef.current = v
      update()
    }
    if (props[trigger]) {
      props[trigger](v, ...args)
    }
  }

  return [stateRef.current, useMemoizedFn(setState)] as const
}

export default useControllableValue
