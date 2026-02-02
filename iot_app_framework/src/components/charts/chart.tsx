'use client';

import "@lib/chartjs";

import { ChartData, ChartOptions, ChartType, Chart as ChartJS, Plugin } from "chart.js";
import React, { Ref } from "react";
import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";

export type TimePoint = { x: number; y: number };
export type LegendPosition = "top" | "left" | "bottom" | "right" | "chartArea";

// Props interface.
interface Props {
    type: ChartType;
    data: ChartData;
    options?: ChartOptions;
    showLegend?: boolean;
    legendPosition?: LegendPosition;
    showCountInLegend?: boolean;
    chartPlugins?: Plugin<ChartType>[];
}

// Interface with the methods exposed to the parent component.
export interface ChartRef {
    setLegendPosition: (position: LegendPosition) => void;
}

const Chart = React.forwardRef((props: Props, ref: Ref<ChartRef>) => {
    const { type, showLegend = true, legendPosition = "bottom", showCountInLegend, data, options } = props;

    // Reference to the chart.
    const chartRef = React.useRef<ChartJS | null>();

    /**
     * Sets the legend in the given position.
     * 
     * @param position New legend position.
     */
    const setLegendPosition = (position: LegendPosition) => {
        const chart = chartRef.current;
        if (!chart) {
            return;
        }

        // Avoid chart crash if something ever passes a non-string.
        if (typeof position !== "string") {
            console.warn('setLegendPosition: position is not a string', typeof position, position);
            return;
        }

        // Ensure plugins object exists
        if (!chart.options.plugins) {
            chart.options.plugins = {};
        }

        // Ensure legend object exists - but don't overwrite it if it already exists
        if (!chart.options.plugins.legend) {
            chart.options.plugins.legend = {};
        }

        // Ensure legend object exists and is a plain object
        if (typeof chart.options.plugins.legend !== "object") {
            chart.options.plugins.legend = {};
        }

        (chart.options.plugins.legend as any).position = position;
        try {
            chart.update();
        } catch (error) {
            console.error('setLegendPosition: error updating chart', error);
        }
    };

    // Export the following functions so that they can be used in the parent component.
    React.useImperativeHandle(ref, () => ({
        setLegendPosition
    }));

    const userPlugins = options?.plugins && !Array.isArray(options.plugins) ? options.plugins : {};

    // Clone data/options to avoid mutating props
    const finalData: ChartData = {
        ...data,
        datasets: (data.datasets ?? []).map((d: any) => ({
            ...d,
            // v3+ uses `tension` (line charts), but harmless for others
            tension: d.tension ?? 0,
            fill: d.fill ?? false,
        })),
    };

    const finalOptions: ChartOptions = {
        ...(options ?? {}),
        onHover: (event: any) => {
            if (event?.native?.target) event.native.target.style.cursor = 'default';
        },
        plugins: {
            ...userPlugins,
            legend: {
                ...((userPlugins as any).legend ?? {}),
                display: showLegend,
                position: legendPosition,
                onHover: (event: any) => {
                    if (event?.native?.target) event.native.target.style.cursor = 'pointer';
                },
            },
        },
    };

    // Doughnut cutout: v3+ uses `cutout`
    if (type === 'doughnut') {
        (finalOptions as any).cutout = (finalOptions as any).cutout ?? '70%';
    }

    // Legend labels with counts (only makes sense for single dataset)
    if (showCountInLegend && finalData.datasets?.length === 1) {
        const dataset0: any = finalData.datasets[0];

        finalOptions.plugins = finalOptions.plugins ?? {};
        (finalOptions.plugins as any).legend = (finalOptions.plugins as any).legend ?? {};

        (finalOptions.plugins as any).legend.labels = {
            ...((finalOptions.plugins as any).legend.labels ?? {}),
            generateLabels: (chart: any) => {
                const labels = chart.data.labels ?? [];
                const values = dataset0.data ?? [];
                const bg = dataset0.backgroundColor ?? [];

                return values.map((value: any, index: number) => ({
                text: `${labels[index] ?? ''} (${value})`,
                fillStyle: Array.isArray(bg) ? bg[index] : bg,
                hidden: chart.getDatasetMeta(0).data[index]?.hidden,
                datasetIndex: 0,
                index,
                }));
            },
        };

        (finalOptions.plugins as any).legend.onClick = (_e: any, legendItem: any) => {
            const chart = chartRef.current as any;
            if (!chart) return;

            const datasetIndex = legendItem.datasetIndex;
            const index = legendItem.index;

            if (datasetIndex != null && index != null) {
                const meta = chart.getDatasetMeta(datasetIndex);
                meta.data[index].hidden = !meta.data[index].hidden;
                chart.update();
            }
        };
    }

    // Create the chart depending on the given type.
    switch (type) {
        case 'bar':
            return <Bar ref={chartRef as any} data={finalData as any} options={finalOptions as any} plugins={props.chartPlugins as any} />;
        case 'doughnut':
            return <Doughnut ref={chartRef as any} data={finalData as any} options={finalOptions as any} plugins={props.chartPlugins as any} />;
        case 'line':
            return <Line ref={chartRef as any} data={finalData as any} options={finalOptions as any} plugins={props.chartPlugins as any} />;
        case 'pie':
            return <Pie ref={chartRef as any} data={finalData as any} options={finalOptions as any} plugins={props.chartPlugins as any} />;
        default:
            return null;
      }
});

Chart.displayName = "Chart";

export default Chart;