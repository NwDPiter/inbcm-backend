import express from "express"
import { Request, Response, NextFunction } from "express"
import mongoose from "mongoose"
import { MongoMemoryServer } from "mongodb-memory-server"
import { Museu, IMuseu } from "../models/Museu"
import uploadMiddleware from "../middlewares/UploadMiddleware"
import DeclaracaoController from "../controllers/DeclaracaoController"
import { DeclaracaoModel, Declaracoes } from "../models"
import path from "path"

const app = express()
app.use(express.json())

const mockAuthMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  req.signedCookies = { token: "mocked-token" }
  req.user = { id: userId, admin: false }
  next()
}

app.use(mockAuthMiddleware)

const declaracaoController = new DeclaracaoController()

app.post(
  "/uploads/:museu/:anoDeclaracao",
  uploadMiddleware,
  declaracaoController.uploadDeclaracao
)

app.put(
  "/retificar/:museu/:anoDeclaracao/:idDeclaracao",
  uploadMiddleware,
  declaracaoController.retificarDeclaracao.bind(declaracaoController)
)

let mongoServer: MongoMemoryServer
let mongoUri: string
let userId: string
let museuMock: IMuseu
let declaracaoMock: DeclaracaoModel

const setupTestEnvironment = async () => {
  mongoServer = await MongoMemoryServer.create()
  mongoUri = mongoServer.getUri()
  await mongoose.connect(mongoUri)

  userId = new mongoose.Types.ObjectId().toHexString()

  museuMock = await Museu.create({
    codIbram: "66b201c52f84b3f8b048f7a5",
    nome: "Museu Camara Cascudo",
    esferaAdministraiva: "Estadual",
    endereco: {
      logradouro: "Rua Hermes da Fonseca",
      numero: "1398",
      bairro: "Tirol",
      cep: "59020-650",
      municipio: "Natal",
      uf: "RN"
    },
    usuario: userId
  })
  declaracaoMock = await Declaracoes.create({
    museu_id: museuMock._id,
    museu_nome: museuMock.nome,
    anoDeclaracao: "2019",
    responsavelEnvio: userId,
    status: "Recebida",
    retificacao: false,
    totalItensDeclarados: 0,
    museologico: {
      nome: "museologico",
      caminho: path.join(__dirname, "assets/museologico.xlsx")
    }
  })
}

const teardownTestEnvironment = async () => {
  await mongoose.disconnect()
  await mongoServer.stop()
}

export {
  app,
  setupTestEnvironment,
  teardownTestEnvironment,
  museuMock,
  declaracaoMock,
  userId
}
