import { hash } from "@node-rs/argon2"
import { Usuario } from "../models/Usuario"
import { Profile } from "../models/Profile" // Importa o model Profile
import connect from "../db/conn"

const [email, nome, senha = "1234"] = process.argv.slice(2)

const createAdminUser = async () => {
  await connect()

  try {
    // Busca o perfil 'admin' no banco de dados
    const adminProfile = await Profile.findOne({ name: "admin" })

    if (!adminProfile) {
      throw new Error("Perfil 'admin' não encontrado")
    }

    // Criação do usuário admin com o profile vinculado
    const adminUser = new Usuario({
      email: email || "admin@gmail.com",
      senha: await hash(senha),
      admin: true,
      nome: nome || "admin",
      museus: [],
      profile: adminProfile._id, // Vincula o perfil 'admin'
      ativo: true
    })

    await adminUser.save()
    console.log("Usuário criado com sucesso!")
    process.exit(0)
  } catch (err) {
    console.error("Erro ao criar o usuário:", err)
    process.exit(1)
  }
}

createAdminUser()
