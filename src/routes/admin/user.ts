import express from "express"
import UsuarioController from "../../controllers/UsuarioController"

const routes = express.Router()

routes.post("/", UsuarioController.registerUsuario)
routes.get("/", UsuarioController.getUsuarios)
routes.get("/by-profile/:profileId", UsuarioController.getUsersByProfile)
routes.get("/:id", UsuarioController.getUsuarioPorId)
routes.put("/:id", UsuarioController.atualizarUsuario)
routes.delete("/:id", UsuarioController.deletarUsuario)

export default routes
