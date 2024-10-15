import express from "express"
import publicRoutes from "./public"
import adminRoutes from "./admin"

const routes = express.Router()

routes.use("/public", publicRoutes)
routes.use("/admin", adminRoutes)

export default routes
