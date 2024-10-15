import express from "express"
import rateLimit from "express-rate-limit"
import AuthService from "../../service/AuthService"

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30
})

const routes = express.Router()
const authService = new AuthService()

/**
 * @swagger
 * /api/public/auth/login:
 *   post:
 *     summary: Realiza login de usuário.
 *     description: Endpoint para realizar login de usuário.
 *     parameters:
 *        - in: query
 *          name: admin
 *          type: boolean
 *     requestBody:
 *       required: true
 *       content:
 *         application/*:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *             required:
 *               - email
 *               - password
 *     responses:
 *       '200':
 *         description: Login bem-sucedido.
 *       '401':
 *         description: Credenciais inválidas.
 */
routes.post("/login", limiter, async (req, res) => {
  const { email, password } = req.body
  const { token, refreshToken, user } = await authService.login({
    email,
    password,
    admin: false
  })

  res.cookie("token", token, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 60 * 1000),
    maxAge: 60 * 60 * 1000,
    sameSite: "strict",
    secure: true,
    signed: true
  })
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    expires: new Date(Date.now() + 60 * 60 * 1000),
    maxAge: 60 * 60 * 1000,
    sameSite: "strict",
    secure: true,
    signed: true
  })

  res.json({
    name: user.nome,
    email: user.email
  })
})

/**
 * @swagger
 * /ap/publici/auth/refresh:
 *   post:
 *     summary: Atualiza token de acesso.
 *     description: Endpoint para atualizar o token de acesso.
 *     responses:
 *       '200':
 *         description: Token atualizado com sucesso.
 *       '401':
 *         description: Falha ao atualizar o token.
 */
routes.post("/refresh", async (req, res) => {
  const { refreshToken } = req.signedCookies
  try {
    const { token } = await authService.refreshToken({ refreshToken })
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 60 * 60 * 1000),
      maxAge: 60 * 60 * 1000,
      sameSite: "strict",
      secure: true,
      signed: true
    })

    res.status(200).send()
  } catch (error) {
    res.status(401).send()
  }
})

export default routes
