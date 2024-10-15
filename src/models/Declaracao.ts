import mongoose, { Schema, Document } from "mongoose"
import { Status } from "../enums/Status"
import { TipoEnvio } from "../enums/tipoEnvio"

export interface Arquivo {
  nome?: string
  caminho?: string
  status: Status
  pendencias?: string[]
  quantidadeItens: number
  hashArquivo?: string
  tipoEnvio?: TipoEnvio
  dataEnvio?: Date
  versao: number
}

const ArquivoSchema = new Schema<Arquivo>(
  {
    nome: String,
    caminho: String,
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.NaoEnviado
    },
    pendencias: [String],
    quantidadeItens: { type: Number, default: 0 },
    hashArquivo: String,
    dataEnvio: { type: Date, default: Date.now() },
    versao: { type: Number, default: 0 }
  },
  { _id: false, versionKey: false }
)

export interface DeclaracaoModel extends Document {
  museu_id: mongoose.Types.ObjectId
  museu_nome: string
  anoDeclaracao: string
  responsavelEnvio: mongoose.Types.ObjectId
  hashDeclaracao: string
  dataCriacao?: Date
  dataAtualizacao?: Date
  salt: string
  totalItensDeclarados?: number
  status: Status
  arquivistico: Arquivo
  bibliografico: Arquivo
  museologico: Arquivo
  retificacao: boolean
  retificacaoRef: mongoose.Types.ObjectId
  versao: number
  createdAt?: Date
  updatedAt?: Date
  ultimaDeclaracao: boolean
  dataRecebimento?: Date
  dataEnvioAnalise?: Date
  responsavelEnvioAnalise?: mongoose.Types.ObjectId
  analistasResponsaveis?: mongoose.Types.ObjectId[]
  dataAnalise?: Date
  dataFimAnalise?: Date
}

export type ArquivoTypes =
  | "arquivisticoArquivo"
  | "bibliograficoArquivo"
  | "museologicoArquivo"

const DeclaracaoSchema = new Schema<DeclaracaoModel>(
  {
    museu_id: { type: Schema.Types.ObjectId, ref: "Museu", required: true },
    museu_nome: String,
    versao: { type: Number, default: 0 },
    anoDeclaracao: String,
    responsavelEnvio: {
      type: Schema.Types.ObjectId,
      ref: "usuarios",
      required: true
    },
    hashDeclaracao: String,
    dataCriacao: { type: Date, default: Date.now() },
    dataAtualizacao: { type: Date, default: Date.now() },
    retificacao: { type: Boolean, default: false },
    retificacaoRef: { type: Schema.Types.ObjectId, ref: "Declaracoes" },
    totalItensDeclarados: { type: Number },
    status: {
      type: String,
      enum: Object.values(Status),
      default: Status.Recebida
    },
    arquivistico: ArquivoSchema,
    bibliografico: ArquivoSchema,
    museologico: ArquivoSchema,
    ultimaDeclaracao: { type: Boolean, default: true },
    dataRecebimento: { type: Date },
    dataEnvioAnalise: { type: Date },
    analistasResponsaveis: [{ type: Schema.Types.ObjectId, ref: "usuarios" }],
    responsavelEnvioAnalise: { type: Schema.Types.ObjectId, ref: "usuarios" },
    dataAnalise: { type: Date },
    dataFimAnalise: { type: Date }
  },
  { timestamps: true, versionKey: false }
)

DeclaracaoSchema.pre("save", function (next) {
  if (this.dataCriacao) {
    this.dataCriacao = this.createdAt
  }
  this.dataCriacao = new Date()
  next()
})

export const Declaracoes = mongoose.model<DeclaracaoModel>(
  "Declaracoes",
  DeclaracaoSchema
)
