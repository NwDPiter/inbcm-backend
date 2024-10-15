import express from "express"
import PermissionController from "../../controllers/PermissionController"

const routes = express.Router()

routes.get("/", PermissionController.getPermissions)

export default routes
