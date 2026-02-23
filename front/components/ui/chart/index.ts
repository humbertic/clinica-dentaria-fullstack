export { default as ChartCrosshair } from './ChartCrosshair.vue'
export { default as ChartLegend } from './ChartLegend.vue'
export { default as ChartSingleTooltip } from './ChartSingleTooltip.vue'
export { default as ChartTooltip } from './ChartTooltip.vue'

export function defaultColors(count: number = 3) {
  const chartVars = [
    'var(--chart-1)',
    'var(--chart-2)',
    'var(--chart-3)',
    'var(--chart-4)',
    'var(--chart-5)',
    'var(--chart-6)',
    'var(--chart-7)',
    'var(--chart-8)',
    'var(--chart-9)',
    'var(--chart-10)'
  ];
  return chartVars.slice(0, count);
}

export * from './interface'
