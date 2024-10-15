import express from "express"
import authRoutes from "./auth"
import dashboardRoutes from "./dashboard"
import declaracoesRoutes from "./declaracoes"
import museusRoutes from "./museus"
import profileRoutes from "./profile"
import userRoutes from "./user"

const routes = express.Router()

routes.use("/auth", authRoutes)
routes.use("/declaracoes", declaracoesRoutes)
routes.use("/museus", museusRoutes)
routes.use("/profile", profileRoutes)
routes.use("/users", userRoutes)
routes.use("/dashboard", dashboardRoutes)

export default routes
