import { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

const POPOVER_PADDING = 20;

function removeElementById(id: string): void {
    const element = document.getElementById(id);
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
}

function renderHoverMessage(id: string, text: ReactNode, xCoord: number, yCoord: number): void {
    const hoverMessage = document.createElement('dialog');
    hoverMessage.className = 'hover-message';
    // Set the opacity to 0 to prevent the dialog from appearing before it is positioned.
    hoverMessage.style.opacity = '0';
    hoverMessage.id = id;
    const root = createRoot(hoverMessage);
    root.render(text);
    document.body.appendChild(hoverMessage);
    hoverMessage.showModal();

    // Set the position of the hover message once it is rendered.
    setTimeout(() => {
        const width = document.body.clientWidth;
        const height = document.body.clientHeight;
        const dialogWidth = hoverMessage.offsetWidth;
        const dialogHeight = hoverMessage.offsetHeight;
        const left = xCoord * 2 - width + ((width - xCoord) > dialogWidth ? dialogWidth + POPOVER_PADDING : -dialogWidth - POPOVER_PADDING);
        const top = yCoord * 2 - height + ((height - yCoord) > dialogHeight ? dialogHeight + POPOVER_PADDING : -dialogHeight - POPOVER_PADDING);
        hoverMessage.style.left = `${left}px`;
        hoverMessage.style.top = `${top}px`;
        // Set the opacity to 1 to make the dialog visible.
        hoverMessage.style.opacity = '1';
    }, 100);
}

export { removeElementById, renderHoverMessage };
