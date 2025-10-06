import { ColorStyles } from '@configs/style-constants';
import { IconLookup, icon } from '@fortawesome/fontawesome-svg-core';
import { faCircle } from '@fortawesome/free-solid-svg-icons';

const IMAGE_REDUCE_FACTOR = 2.5;

export const CONTAINER_MIN_WIDTH = 300;

/**
 * Creates a Chart.js plugin that places an icon in the center of a chart.
 * 
 * @param faIcon FontAwesome icon lookup object.
 * @param color Desired color of the icon.
 * 
 * @returns A Chart.js plugin object.
 */
export const createImageCenterPlugin = (faIcon: IconLookup, color: string) => {
    const chartIcon = icon(faIcon);
    const chartCircleIcon = icon(faCircle);
    const chartImage = new Image();
    const chartCircleImage = new Image();

    // Set up the chart image URL for reuse.
    if (chartIcon) {
        let svgString = chartIcon.html[0];
        svgString = svgString.replace('fill="currentColor"', `fill="${color}"`);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svgBlob);
        chartImage.src = url;
        chartImage.onload = () => {
            URL.revokeObjectURL(url);
        };
    }

    // Set up the chart circle image URL for reuse.
    let svgString = chartCircleIcon.html[0];
    svgString = svgString.replace('fill="currentColor"', `fill="${ColorStyles.chartBackground}"`);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    chartCircleImage.src = url;
    chartCircleImage.onload = () => {
        URL.revokeObjectURL(url);
    };

    return {
        id: 'imageCenter',
        beforeDraw(chart: Chart) {
            const { ctx, chartArea } = chart;
            if (!chartArea) {
                return;
            }

            const { top, bottom, left, right } = chartArea;

            // Calculate the center of the chart
            const centerX = (left + right) / 2;
            const centerY = (top + bottom) / 2;

            // Draw the image
            if (chartImage.complete && chartImage.naturalWidth > 0) {
                if (!ctx) {
                    return;
                }
                ctx.save();
                const fullSize = right < bottom ? right : bottom;
                ctx.drawImage(chartCircleImage, centerX - fullSize / 2, centerY - fullSize / 2, fullSize, fullSize);
                const size = right < bottom ? right / IMAGE_REDUCE_FACTOR : bottom / IMAGE_REDUCE_FACTOR;
                ctx.drawImage(chartImage, centerX - size / 2, centerY - size / 2, size, size);
                ctx.restore();
            }
        },
    };
};

/**
 * Gets the initial position for the legend based on the container width.
 * 
 * @param elementId ID of the element that contains the chart.
 * 
 * @returns Initial position for the legend.
 */
export const getLegendInitialPosition = (elementId: string) => {
    const target = document.getElementById(elementId);
    if (target) {
        return target.clientWidth > CONTAINER_MIN_WIDTH ? "right" : "bottom";
    }
    return "bottom";
};