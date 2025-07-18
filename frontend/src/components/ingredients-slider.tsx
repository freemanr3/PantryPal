import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { cn } from '@/lib/utils';

interface IngredientsSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function IngredientsSlider({ value, onChange }: IngredientsSliderProps) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <label className="text-sm font-medium">
          Maximum Additional Ingredients
        </label>
        <span className="text-sm text-muted-foreground">{value}</span>
      </div>
      <SliderPrimitive.Root
        className="relative flex w-full touch-none select-none items-center"
        defaultValue={[value]}
        max={10}
        min={0}
        step={1}
        onValueChange={([newValue]) => onChange(newValue)}
      >
        <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Range className="absolute h-full bg-primary" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-5 w-5 rounded-full border-2 border-primary bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Only what I have</span>
        <span>Up to 10 more</span>
      </div>
    </div>
  );
} 