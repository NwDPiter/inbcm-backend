import express from "express"
import {
  permissionCheckMiddleware,
  userMiddleware
} from "../../middlewares/AuthMiddlewares"
import ProfileController from "../../controllers/ProfileController"

const routes = express.Router()

routes.post(
  "/",
  permissionCheckMiddleware("createProfile"),
  ProfileController.createProfile
)
routes.get("/", userMiddleware, ProfileController.getProfiles)
routes.get(
  "/:id",
  permissionCheckMiddleware("getProfileById"),
  ProfileController.getProfileById
)
routes.put(
  "/:id",
  permissionCheckMiddleware("updateProfile"),
  ProfileController.updateProfile
)
routes.delete(
  "/:id",
  permissionCheckMiddleware("deleteProfile"),
  ProfileController.deleteProfile
)
routes.post(
  "/addPermissions",
  permissionCheckMiddleware("addPermissions"),
  ProfileController.addPermissions
)

export default routes
