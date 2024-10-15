import mongoose, { Schema, Types, Document } from "mongoose"

export interface IUsuario extends Document {
  nome: string
  email: string
  museus: string[]
  admin: boolean
  senha: string
  profile: Types.ObjectId
  ativo: boolean
}

const UsuarioSchema = new Schema<IUsuario>({
  nome: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  admin: { type: Boolean, default: false },
  senha: { type: String, required: true },
  profile: { type: Schema.Types.ObjectId, required: true, ref: "profiles" },
  ativo: { type: Boolean, default: true }
})

interface IRefreshToken extends Document {
  expiresAt: Date
  user: Types.ObjectId
}

const RefreshTokenSchema = new Schema<IRefreshToken>({
  expiresAt: { type: Date, required: true },
  user: { type: Schema.Types.ObjectId, requied: true, ref: "usuarios" }
})

export const Usuario = mongoose.model("usuarios", UsuarioSchema)
export const RefreshToken = mongoose.model("refreshToken", RefreshTokenSchema)
export default Usuario
