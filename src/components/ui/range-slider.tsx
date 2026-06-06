'use client'

import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'
import { cn } from '@/lib/utils'

/**
 * A dual-thumb range slider with amber/gold theming.
 * Shows a colored track between the two thumbs.
 */

interface RangeSliderProps extends React.ComponentProps<typeof SliderPrimitive.Root> {
  /** Whether to show value tooltips on hover/drag */
  showTooltip?: boolean
  /** Format function for tooltip values */
  formatValue?: (value: number) => string
}

function RangeSlider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  showTooltip = true,
  formatValue = (v) => String(v),
  ...props
}: RangeSliderProps) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )

  const [hoveredThumb, setHoveredThumb] = React.useState<number | null>(null)
  const [isDragging, setIsDragging] = React.useState(false)
  const [draggingThumb, setDraggingThumb] = React.useState<number | null>(null)

  return (
    <SliderPrimitive.Root
      data-slot="range-slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        'relative flex w-full touch-none items-center select-none data-[disabled]:opacity-50',
        className
      )}
      onPointerDown={() => setIsDragging(true)}
      onPointerUp={() => {
        setIsDragging(false)
        setDraggingThumb(null)
      }}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="range-slider-track"
        className="bg-muted relative grow overflow-hidden rounded-full h-2 w-full"
      >
        <SliderPrimitive.Range
          data-slot="range-slider-range"
          className="absolute h-full rounded-full bg-gradient-to-r from-amber-400 to-amber-500 dark:from-amber-500 dark:to-amber-600"
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => {
        const showLabel = showTooltip && (hoveredThumb === index || (isDragging && draggingThumb === index))
        return (
          <SliderPrimitive.Thumb
            data-slot="range-slider-thumb"
            key={index}
            className={cn(
              'relative block size-5 shrink-0 rounded-full border-2 border-amber-500 bg-background shadow-md',
              'transition-[transform,box-shadow] duration-150',
              'hover:scale-110 hover:shadow-lg hover:border-amber-600',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 focus-visible:ring-offset-2',
              'active:scale-110 active:shadow-lg',
              'disabled:pointer-events-none disabled:opacity-50',
              isDragging && draggingThumb === index && 'scale-110 shadow-lg border-amber-600'
            )}
            onPointerEnter={() => setHoveredThumb(index)}
            onPointerLeave={() => setHoveredThumb(null)}
            onPointerDown={() => setDraggingThumb(index)}
          >
            {/* Tooltip bubble */}
            {showLabel && (
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-amber-500 text-white text-xs font-medium shadow-md whitespace-nowrap z-10">
                {formatValue(_values[index])}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-amber-500" />
              </div>
            )}
          </SliderPrimitive.Thumb>
        )
      })}
    </SliderPrimitive.Root>
  )
}

export { RangeSlider }
