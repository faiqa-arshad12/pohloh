export { }

// Create a type for the roles
export type Roles = 'admin' | 'user' | 'owner'

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      role?: Roles
    }
  }
}