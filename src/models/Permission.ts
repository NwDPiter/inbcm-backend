import mongoose, { Schema, Document } from "mongoose"

interface IPermission extends Document {
  name: string
  label: string
  description: string
}

const PermissionSchema: Schema = new Schema({
  name: { type: String, required: true, unique: true }, // Define o campo name como único
  label: { type: String, required: true }, // Label descritivo para exibição
  description: { type: String, required: true } // Descrição detalhada da permissão
})

export const Permission = mongoose.model<IPermission>(
  "permissions",
  PermissionSchema
)
