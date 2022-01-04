/**
 * title: Default usage
 * desc: render 100,000 items in a list.
 *
 * title.zh-CN: 基础用法
 * desc.zh-CN: 渲染大量数据
 */

import React, { useMemo, useRef } from 'react'
import { useVirtualList } from 'ahooks'

export default () => {
  const containerRef = useRef()
  const wrapperRef = useRef()

  const originalList = useMemo(() => Array.from(Array(99999).keys()), [])

  const [list, scrollTo] = useVirtualList(originalList, {
    containerTarget: containerRef,
    wrapperTarget: wrapperRef,
    itemHeight: 60,
    overscan: 10,
  })
  return (
    <>
      <button onClick={() => scrollTo(100)}>点击跳转到第100个</button>
      <div ref={containerRef} style={{ height: '300px', overflow: 'auto', border: '1px solid' }}>
        <div ref={wrapperRef}>
          {list.map((ele) => (
            <div
              style={{
                height: 52,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                border: '1px solid #e8e8e8',
                marginBottom: 8,
              }}
              key={ele.index}
            >
              Row: {ele.data}
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
