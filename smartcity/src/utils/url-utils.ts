export const getRouteUrl = (url: string, params?: Record<string, string>) => {
    if (!params || JSON.stringify(params) === '{}') {
        return url;
    }
    const query = new URLSearchParams(params).toString();
    return `${url}?${query}`;
};
