import { drizzle } from 'drizzle-orm/node-postgres'
import postgres from 'postgres'
import { eq, sql } from 'drizzle-orm'

const { DATABASE_URL } = process.env

const db = drizzle(DATABASE_URL!)