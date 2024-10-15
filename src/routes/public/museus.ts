import express from "express"
import {
  adminMiddleware,
  userMiddleware
} from "../../middlewares/AuthMiddlewares"
import MuseuController from "../../controllers/MuseuController"

const routes = express.Router()
/**
 * @swagger
 * /api/public/museus:
 *   post:
 *     summary: Cria um novo museu.
 *     description: Endpoint para criar um novo museu.
 *     tags:
 *       - Museu
 *     parameters:
 *       - in: body
 *         name: museu
 *         description: Dados do museu a ser criado.
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             nome:
 *               type: string
 *               description: Nome do museu.
 *             endereco:
 *               type: object
 *               properties:
 *                 cidade:
 *                   type: string
 *                   description: Nome da cidade onde o museu está localizado.
 *                 UF:
 *                   type: string
 *                   enum: ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO']
 *                   description: Sigla do estado onde o museu está localizado.
 *                 logradouro:
 *                   type: string
 *                   description: Nome da rua ou logradouro onde o museu está localizado.
 *                 numero:
 *                   type: string
 *                   description: Número do endereço onde o museu está localizado.
 *                 complemento:
 *                   type: string
 *                   description: Complemento do endereço (opcional).
 *                 bairro:
 *                   type: string
 *                   description: Bairro onde o museu está localizado.
 *                 cep:
 *                   type: string
 *                   description: CEP do endereço onde o museu está localizado.
 *                 municipio:
 *                   type: string
 *                   description: Nome do município onde o museu está localizado.
 *                 uf:
 *                   type: string
 *                   description: Sigla do estado onde o museu está localizado.
 *     responses:
 *       '200':
 *         description: Museu criado com sucesso.
 *       '400':
 *         description: Erro ao criar o museu.
 */
routes.post("/", adminMiddleware, MuseuController.criarMuseu)

/**
 * @swagger
 * /api/public/museus:
 *   get:
 *     summary: Lista os museus do usuário.
 *     description: Endpoint para listar os museus associados ao usuário autenticado.
 *     tags:
 *       - Museu
 *     responses:
 *       '200':
 *         description: Lista de museus do usuário retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items: {}
 *       '500':
 *         description: Erro ao listar museus do usuário.
 */
routes.get("/", userMiddleware, MuseuController.userMuseus)

export default routes
