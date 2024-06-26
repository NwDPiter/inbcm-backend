import type { Handler } from "express"
import jwt from "jsonwebtoken"
import { Usuario } from "../models/Usuario"
import { Profile } from "../models/Profile"
import { verify } from "@node-rs/argon2"
import config from "../config"

export const permissionCheckMiddleware: (permission: string) => Handler = (permission) => async (req, res, next) => {
  try {
    const { token } = req.signedCookies;
    if (!token) {
      return res.status(401).send('Token não fornecido');
    }
    // Verifica e decodifica o token JWT
    const decodedToken = jwt.verify(token, config.JWT_SECRET) as { sub: string; admin: boolean };

    // Define req.body.user com os dados do usuário do token JWT
    req.body.user = {
      sub: decodedToken.sub,
      admin: decodedToken.admin,
    };

    //extrai os dados do profile do usuário para verificar se possui permissão de acesso
    const user_id = decodedToken.sub
    const user = await Usuario.findOne({ _id: user_id })
    const profile_id = user.profile.toString();
    const profile = await Profile.findOne({ _id: profile_id })


    if (!profile.permissions.includes(permission)) {
      return res.status(403).json({ mensagem: "Sem permissão para realizar esta ação." });
    }

    next();
  } catch (error) {
    console.error('Erro no middleware de verificação de permissão:', error);
    return res.status(401).send('Erro ao verificar permissão');
  }
};

export const userMiddleware: Handler = async (req, res, next) => {
  if (config.NODE_ENV !== "PRODUCTION") {
    const [email, password] = Buffer.from(req.headers["authorization"]?.split(" ")[1] ?? " : ", "base64").toString().split(":")

    const user = await Usuario.findOne({ email, admin: false })

    if (user) {
      if (await verify(user.senha, password)) {
        req.body.user = {
          ...user,
          sub: user.id,
          admin: user.admin
        }
        return next()
      } else {
        throw new Error("Senha incorreta")
      }
    }
  }

  const { token } = req.signedCookies

  if (!token) {
    return res.status(401).send()
  }

  const payload = jwt.verify(token, config.JWT_SECRET) as jwt.JwtPayload

  if (payload.admin) {
    return res.status(404).send()
  }

  req.body.user = payload

  next()
}

export const adminMiddleware: Handler = async (req, res, next) => {
  if (config.NODE_ENV !== "PRODUCTION") {
    const [email, password] = Buffer.from(req.headers["authorization"]?.split(" ")[1] ?? " : ", "base64").toString().split(":")

    const user = await Usuario.findOne({ email, admin: true })

    if (user) {
      if (await verify(user.senha, password)) {
        req.body.user = {
          ...user,
          sub: user.id,
          admin: user.admin
        }
        return next()
      } else {
        throw new Error("Senha incorreta")
      }
    }
  }

  const { token } = req.signedCookies

  if (!token) {
    return res.status(401).send()
  }

  const payload = jwt.verify(token, config.JWT_SECRET) as jwt.JwtPayload

  if (!payload.admin) {
    return res.status(404).send()
  }

  req.body.user = payload

  next();
}
