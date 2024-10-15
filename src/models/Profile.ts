import mongoose, { Schema, Document, Types } from "mongoose"

interface IProfile extends Document {
  name: string
  description?: string
  permissions: Types.ObjectId[]
  isProtected: boolean
}

const ProfileSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    minlength: 4,
    maxlength: 30
  },
  description: { type: String },
  permissions: [{ type: Schema.Types.ObjectId, ref: "permissions" }],
  isProtected: { type: Boolean, default: false, select: false }
})

export const Profile = mongoose.model<IProfile>("profiles", ProfileSchema)
