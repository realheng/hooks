import type { DependencyList } from 'react'
import { useRef } from 'react'
import depsAreSame from '../utils/depsAreSame'

export default function useCreation<T>(factory: () => T, deps: DependencyList) {
  const { current } = useRef({
    deps,
    obj: undefined as undefined | T,
    initialized: false,
  })
  // 当初始化的或者deps发生变化的时候重新计算缓存值
  if (current.initialized === false || !depsAreSame(current.deps, deps)) {
    current.deps = deps
    current.obj = factory()
    current.initialized = true
  }
  return current.obj as T
}
