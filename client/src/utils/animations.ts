export const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

export const inverseLerp = (num: number, min: number, max: number) => {
    const clamped = clamp(num, min, max);
    return (clamped - min) / (max - min)
};

export function lerp(num: number, min: number, max: number) {
    return min * (1 - num) + max * num;
};

export const minmax = (num: number, min: number, max: number) => Math.max(Math.min(max, num), min);
