import argon from "@node-rs/argon2"
import jwt from "jsonwebtoken"
import { RefreshToken, Usuario } from "../models/Usuario"
import config from "../config"

export default class AuthService {
  async login({
    email,
    password
  }: {
    email: string
    password: string
    admin: boolean
  }) {
    const user = await Usuario.findOne({ email })

    if (!user) {
      throw new Error("Usuário não encontrado")
    } else if (!(await argon.verify(user.senha, password))) {
      throw new Error("Senha incorreta")
    }
    if (!user.ativo) {
      throw new Error("Usuário não está ativo.")
    }

    const token = jwt.sign(
      { sub: user.id, admin: user.admin ? true : undefined },
      config.JWT_SECRET!,
      { expiresIn: "1h" }
    )
    const { id: refreshToken } = await RefreshToken.create({
      user,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000
    })

    return {
      token,
      refreshToken,
      user
    }
  }

  async refreshToken({ refreshToken }: { refreshToken: string }) {
    const refreshTokenObj = await RefreshToken.findById(refreshToken)

    if (!refreshTokenObj) {
      throw new Error("RefreshToken inválido")
    } else if (refreshTokenObj.expiresAt.getTime() < Date.now()) {
      throw new Error("RefreshToken expirado")
    }

    const user = (await Usuario.findById(refreshTokenObj.user))!

    const newToken = jwt.sign(
      { sub: user.id, admin: user.admin ? true : undefined },
      config.JWT_SECRET,
      { expiresIn: "1h" }
    )

    return {
      token: newToken
    }
  }
}
