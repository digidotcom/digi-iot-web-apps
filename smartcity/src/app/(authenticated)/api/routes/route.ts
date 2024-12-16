import { ROUTES_PATH } from '@configs/app-config';
import { newAppError } from '@utils/error-utils';
import { naturalCompare } from '@utils/string-utils';
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

/**
 * This code is executed when doing a GET to `/api/routes`.
 * 
 * It reads the list of routes from the internal storage and returns it.
 */
export const GET: (req: Request) => Promise<Response> = withAuth(async (req) => {
    // Get the access token and create the auth header.
    const { token } = req.nextauth;
    if (!token) {
        return NextResponse.json({ error: "Requires Authentication" }, { status: 401, statusText: "Not Authenticated" });
    }

    try {
        const loadedRoutes = await getRoutes();
        return new NextResponse(JSON.stringify(loadedRoutes || []), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (error) {
        const appError = newAppError("Error loading routes", error as any)
        return new NextResponse(JSON.stringify({ error: appError.message }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
}) as (req: Request) => Promise<Response>;

/**
 * Fetches the list of routes asynchronously.
 * 
 * This function retrieves an array of `JSON` objects, which represents different routes
 * available in the application.
 * 
 * @returns An array of JSON objects representing the routes.
 * 
 * @throws An {@link Error} if the data cannot be retrieved.
 */
const getRoutes = async () => {
    if (typeof window !== 'undefined') {
        throw new Error("getRoutes can only be used on the server side");
    }
    const routes = [];

    // Special server-side imports.
    const fs = await import('fs').then(mod => mod.promises);

    const files = (await fs.readdir(process.cwd() + ROUTES_PATH)).filter(fn => fn.endsWith(".json"));
    for (const f of files) {
        const file = await fs.readFile(process.cwd() + ROUTES_PATH + f, "utf-8");
        const routeData = JSON.parse(file);
        routes.push(routeData);
    }

    routes.sort((a, b) => naturalCompare(a.id, b.id));
    return routes;
}