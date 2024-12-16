import React from 'react';

/**
 * Adds a resize observer for the element with the given ID.
 * 
 * @param elementId ID of the element to add the observer to.
 * @param callback Callback that will be invoked when the element size changes.
 */
export const useResizeObserver = (elementId: string, callback: (width: number, height: number) => void) => {
    React.useEffect(() => {
        const target = document.getElementById(elementId);
        if (target) {
            // Create the resize observer and notify the callback when the size changes.
            const resizeObserver = new ResizeObserver(entries => {
                entries.forEach(entry => callback(entry.contentRect.width, entry.contentRect.height));
            });
            // Start the observing.
            resizeObserver.observe(target);
            // End the observing when the component is unmounted.
            return () => resizeObserver.unobserve(target);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
};