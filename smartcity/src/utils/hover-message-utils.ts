import { ReactNode } from 'react';
import { createRoot } from 'react-dom/client';

function removeElementById(id: string): void {
    const element = document.getElementById(id);
    if (element && element.parentNode) {
        element.parentNode.removeChild(element);
    }
}

function renderHoverMessage(id: string, text: ReactNode, xCoord: number, yCoord: number): void {
    const width = document.body.clientWidth;
    const height = document.body.clientHeight;
    const left = (width - xCoord) > 150 ? xCoord + 10 : xCoord - 150;
    const top = (height - yCoord) > 150 ? yCoord + 20 : yCoord - 75;
    const hoverMessage = document.createElement('div');
    hoverMessage.className = 'hover-message';
    hoverMessage.style.left = `${left}px`;
    hoverMessage.style.top = `${top}px`;
    hoverMessage.style.zIndex = '2000';
    hoverMessage.id = id;
    const root = createRoot(hoverMessage);
    root.render(text);
    document.body.appendChild(hoverMessage);
}

export { removeElementById, renderHoverMessage };
