import * as RadixSlider from '@radix-ui/react-slider';
import styles from './Slider.module.scss';
import { useMemo } from 'react';

export type SliderProps = {
  value: number;
  onValueChange?: (newVal: number) => void;
  onValueCommit?: (newVal: number) => void;
  min?: number;
  max?: number;
  minLabel?: string;
  maxLabel?: string;
  step?: number;
  precision?: number;
};

export const Slider = ({ value, onValueChange, onValueCommit, min = 0, max = 100, minLabel, maxLabel, precision = 0, step }: SliderProps) => {
  const correctedMin = useMemo(() => min * (10 ** precision), [min, precision]);
  const correctedMax = useMemo(() => max * (10 ** precision), [max, precision]);
  const correctedValue = useMemo(() => [value * (10 ** precision)], [value, precision]);
  const correctedStep = useMemo(() => step ? step * (10 ** precision) : undefined, [step, precision]);

  return (<div className={styles.Slider}>
    <div className={styles.minMax}>
      <div className={styles.minMaxValue}>{min}</div>
      {!!minLabel && <div className={styles.minMaxLabel}>{minLabel}</div>}
    </div>
    <RadixSlider.Root
      className={styles.root}
      value={correctedValue}
      onValueChange={([val]) => onValueChange?.(Math.round(val) / (10 ** precision))}
      onValueCommit={([val]) => onValueCommit?.(Math.round(val) / (10 ** precision))}
      min={correctedMin}
      max={correctedMax}
      step={correctedStep}
    >
      <RadixSlider.Track className={styles.track}>
        <RadixSlider.Range className={styles.range} />
      </RadixSlider.Track>
      <RadixSlider.Thumb className={styles.thumb}>
        <div className={styles.value}>{value.toString()}</div>
      </RadixSlider.Thumb>
    </RadixSlider.Root>
    <div className={styles.minMax}>
      <div className={styles.minMaxValue}>{max}</div>
      {!!maxLabel && <div className={styles.minMaxLabel}>{maxLabel}</div>}
    </div>
  </div>);
};
