import { Profile } from "../models/Profile"
import connect from "../db/conn"

const createProfiles = async () => {
  await connect()

  try {
    const adminExists = await Profile.findOne({ name: "admin" })
    if (!adminExists) {
      const adminProfile = new Profile({
        name: "admin",
        description: "Administrator do sistema.",
        permissions: [],
        isProtected: true
      })
      await adminProfile.save()
      console.log("Perfil 'admin' criado com sucesso!")
    } else {
      console.log("Perfil 'admin' já existe.")
    }

    const declarantExists = await Profile.findOne({ name: "declarant" })
    if (!declarantExists) {
      const declarantProfile = new Profile({
        name: "declarant",
        description: "Perfil para usuários declaradores de bens.",
        permissions: [],
        isProtected: true
      })
      await declarantProfile.save()
      console.log("Perfil 'declarant' criado com sucesso!")
    } else {
      console.log("Perfil 'declarant' já existe.")
    }

    const analystExists = await Profile.findOne({ name: "analyst" })
    if (!analystExists) {
      const analystProfile = new Profile({
        name: "analyst",
        description: "Perfil para analistas do sistema.",
        permissions: [],
        isProtected: true
      })
      await analystProfile.save()
      console.log("Perfil 'analyst' criado com sucesso!")
    } else {
      console.log("Perfil 'analyst' já existe.")
    }
  } catch (error) {
    console.error("Erro ao criar os perfis:", error)
    throw error
  }
}

createProfiles()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
