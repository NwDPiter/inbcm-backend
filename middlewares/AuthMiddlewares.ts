import type { Handler } from "express"
import jwt from "jsonwebtoken"
import { Usuario } from "../models/Usuario"
import { Profile } from "../models/Profile"
import { Permission } from "../models/Permission"
import { verify } from "@node-rs/argon2"
import config from "../config"
import { rateLimit } from 'express-rate-limit'

const limiter = rateLimit({
	windowMs: 2 * 60 * 1000,
	limit: 50,
  keyGenerator: (req) => req.body.user?.sub ?? "anonymous"
})

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
    if (!user) {
      return res.status(401).send('Usuário não identificado.');
    }

    const profile_id = user.profile.toString();
    const profile = await Profile.findOne({ _id: profile_id })
    if (!profile) {
      return res.status(401).send('Profile não identificado.');
    }

    const permissions = await Permission.find({ _id: { $in: profile.permissions } });
    const permissionsNames = permissions.map(permission => permission.name);

    console.log(permissionsNames);

    if (!permissionsNames.includes(permission)) {
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

  limiter(req, res, next)
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

  limiter(req, res, next)
}
