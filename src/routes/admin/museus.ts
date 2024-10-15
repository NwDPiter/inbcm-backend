import express from "express"
import { adminMiddleware } from "../../middlewares/AuthMiddlewares"
import MuseuController from "../../controllers/MuseuController"

const routes = express.Router()

/**
 * @swagger
 * /api/admin/museus:
 *   get:
 *     summary: Lista os museus.
 *     description: Endpoint para listar todos os museus cadastrados no sistema.
 *     tags:
 *       - Museu
 *     responses:
 *       '200':
 *         description: Lista de museus retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: {}
 *       '500':
 *         description: Erro ao listar museus.
 */
routes.get("/", adminMiddleware, MuseuController.listarMuseus)

export default routes
