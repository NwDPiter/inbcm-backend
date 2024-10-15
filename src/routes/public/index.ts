import express from "express"
import authRoutes from "./auth"
import declaracoesRoutes from "./declaracoes"
import museusRoutes from "./museus"
import permissionsRoutes from "./permissions"
import reciboRoutes from "./recibo"

const routes = express.Router()

routes.use("/auth", authRoutes)
routes.use("/declaracoes", declaracoesRoutes)
routes.use("/museus", museusRoutes)
routes.use("/permissions", permissionsRoutes)
routes.use("/recibo", reciboRoutes)

export default routes
