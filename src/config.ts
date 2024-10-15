import dotenv from "dotenv"
import { expand } from "dotenv-expand"
import { z } from "zod"

dotenv.config()

const parsedEnv = {}

const parsed = {
  NODE_ENV: process.env.NODE_ENV ?? "DEVELOPMENT",
  DB_USER: process.env.DB_USER ?? "",
  DB_PASS: process.env.DB_PASS ?? "",
  DB_URL: process.env.DB_URL ?? "",
  JWT_SECRET: process.env.JWT_SECRET ?? "__SeCrEt__",
  ADMIN_SITE_URL: process.env.PRIVATE_SITE_URL ?? "https://localhost:5173",
  MINIO_ENDPOINT: process.env.MINIO_ENDPOINT ?? "localhost",
  MINIO_PORT: process.env.MINIO_PORT ?? "9000",
  MINIO_USE_SSL: process.env.MINIO_USE_SSL ?? "false",
  MINIO_ACCESS_KEY: process.env.MINIO_ACCESS_KEY ?? "",
  MINIO_SECRET_KEY: process.env.MINIO_SECRET_KEY ?? ""
}

expand({ parsed, processEnv: parsedEnv })

const schema = z.object({
  NODE_ENV: z.enum(["DEVELOPMENT", "PRODUCTION", "test"]),
  DB_USER: z.string().min(1),
  DB_PASS: z.string().min(1),
  DB_URL: z.string().min(1).url(),
  JWT_SECRET: z.string().min(1),
  ADMIN_SITE_URL: z.string().min(1).url(),
  MINIO_ENDPOINT: z.string().min(1),
  MINIO_PORT: z
    .string()
    .min(1)
    .transform((val) => parseInt(val, 10)),
  MINIO_USE_SSL: z.enum(["true", "false"]),
  MINIO_ACCESS_KEY: z.string().min(1),
  MINIO_SECRET_KEY: z.string().min(1)
})

const config = schema.parse(parsedEnv)

export default config
