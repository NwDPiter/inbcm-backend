import express from "express"
import { userMiddleware } from "../../middlewares/AuthMiddlewares"
import ReciboController from "../../controllers/ReciboController"

const reciboController = new ReciboController()

const routes = express.Router()

/**
 * @swagger
 * /api/public/recibo/{idDeclaracao}:
 *   get:
 *     summary: Gera um recibo para a declaração especificada.
 *     description: Endpoint para gerar um recibo para a declaração especificada.
 *     tags:
 *       - Recibo
 *     parameters:
 *       - in: path
 *         name: idDeclaracao
 *         description: ID da declaração para a qual o recibo será gerado.
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Recibo gerado com sucesso.
 *       '400':
 *         description: ID inválido.
 *       '500':
 *         description: Erro ao gerar o recibo.
 */
routes.get("/:idDeclaracao", userMiddleware, reciboController.gerarRecibo)

export default routes
