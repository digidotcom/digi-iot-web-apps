'use-client';

import { ChartData, ChartLegendOptions, ChartOptions, ChartType, PositionType } from "chart.js";
import React, { Ref } from "react";
import { Bar, Doughnut, Line, Pie } from "react-chartjs-2";

// Props interface.
interface Props {
    type: ChartType;
    data: ChartData;
    options?: ChartOptions;
    legend?: ChartLegendOptions;
    showLegend?: boolean;
    legendPosition?: PositionType;
    showCountInLegend?: boolean;
    plugins?: object[];
}

// Interface with the methods exposed to the parent component.
export interface ChartRef {
    setLegendPosition: (position: PositionType) => void;
}

const Chart = React.forwardRef((props: Props, ref: Ref<ChartRef>) => {
    const { type, showLegend, legendPosition = "bottom", showCountInLegend, ...chartProps } = props;

    // Reference to the chart.
    const chartRef = React.useRef<Bar | Doughnut | Line | Pie | null>();

    /**
     * Sets the legend in the given position.
     * 
     * @param position New legend position.
     */
    const setLegendPosition = (position: PositionType) => {
        if (chartRef.current) {
            const chart = chartRef.current.chartInstance;
            const legend = chart.options.legend;
            if (legend) {
                legend.position = position;
                chart.update();
            }
        }
    };

    // Export the following functions so that they can be used in the parent component.
    React.useImperativeHandle(ref, () => ({
        setLegendPosition
    }));

    // Configure the datasets.
    if (chartProps.data.datasets) {
        chartProps.data.datasets.forEach(d => {
            d.fill = false;
            d.lineTension = 0;
        });
    }

    // Configure the chart options.
    if (!chartProps.options) {
        chartProps.options = {};
    }
    chartProps.options.onHover = e => {
        // @ts-ignore
        e.target.style.cursor = "default";
    };
    if (type == "doughnut") {
        chartProps.options.cutoutPercentage = 70;
    }

    // Configure the chart legend.
    if (!chartProps.legend) {
        chartProps.legend = {};
    }
    chartProps.legend.display = showLegend ?? true;
    chartProps.legend.position = legendPosition;
    chartProps.legend.onHover = e => {
        // @ts-ignore
        e.target.style.cursor = "pointer";
    }

    // If the numbers have to be displayed in the legend, generate custom labels and override the
    // onClick callback to show or hide the data elements.
    if (showCountInLegend && chartProps.data.datasets?.length == 1) {
        if (!chartProps.legend.labels) {
            chartProps.legend.labels = {};
        }
        chartProps.legend.labels.generateLabels = chart => {
            const datasets = chart.data.datasets;
            if (datasets === undefined || datasets[0].data === undefined) {
                return [];
            }
            return datasets[0].data.map((value, index) => ({
                text: `${chart.data.labels ? chart.data.labels[index] : ""} (${value})`,
                // @ts-ignore
                fillStyle: datasets[0].backgroundColor[index],
                hidden: chart.getDatasetMeta(0).data[index].hidden,
                datasetIndex: 0,
                index: index
            }));
        };
        chartProps.legend.onClick = (e, legendItem) => {
            const chart = chartRef.current?.chartInstance;
            if (chart) {
                const datasetIndex = legendItem.datasetIndex;
                const index = legendItem.index;
                if (datasetIndex !== undefined && index !== undefined) {
                    const meta = chart.getDatasetMeta(datasetIndex);
                    meta.data[index].hidden = !meta.data[index].hidden;
                    chart.update();
                }
            }
        };
    }

    // Create the chart depending on the given type.
    switch (type) {
        case "bar":
            return <Bar ref={c => { chartRef.current = c; }} {...chartProps} />
        case "doughnut":
            return <Doughnut ref={c => { chartRef.current = c; }} {...chartProps} />
        case "line":
            return <Line ref={c => { chartRef.current = c; }} {...chartProps} />
        case "pie":
            return <Pie ref={c => { chartRef.current = c; }} {...chartProps} />
    }
});

Chart.displayName = "Chart";

export default Chart;