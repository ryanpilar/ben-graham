import { PrismaClient } from '@prisma/client'

/** ================================|| Prisma Client Setup ||=================================== 

    Configures the PrismaClient instance to ensure efficient database connections across the 
    application. It implements a singleton pattern for PrismaClient to prevent multiple 
    instances of the client in development.
 */

// Extending the Node.js global object type to include a 'cachedPrisma' property.
// This allows for caching the PrismaClient instance globally in a development environment.
declare global {
    var cachedPrisma: PrismaClient
}
let prisma: PrismaClient

// Check the environment to determine how PrismaClient should be instantiated
if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient()
} else {

    // In dev, check if a cached instance exists
    if (!global.cachedPrisma) {
        // If no cache, create a new PrismaClient and cache it globally
        global.cachedPrisma = new PrismaClient()
    }
    // Use the cached PrismaClient instance for subsequent requests
    prisma = global.cachedPrisma
}

export const db = prisma