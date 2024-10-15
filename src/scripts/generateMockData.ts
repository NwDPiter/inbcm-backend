import { fakerPT_BR } from "@faker-js/faker"
import { Museu, Usuario } from "../models"
import { Profile } from "../models/Profile"
import { hash } from "@node-rs/argon2"
import connect from "../db/conn"
;(async () => {
  await connect()

  const senha = await hash("1234")

  try {
    const declarantProfile = await Profile.findOne({ name: "declarant" })
    const analystProfile = await Profile.findOne({ name: "analyst" })

    if (!declarantProfile) {
      throw new Error("Perfil 'declarant' não encontrado")
    }

    if (!analystProfile) {
      throw new Error("Perfil 'analyst' não encontrado")
    }

    const users = await Usuario.insertMany(
      Array.from({ length: 2 }, () => {
        const nome = fakerPT_BR.person.fullName()
        const [firstName, lastName] = nome.split(" ")

        return {
          nome,
          email: fakerPT_BR.internet.email({ firstName, lastName }),
          senha,
          admin: false,
          museus: [],
          profile: declarantProfile._id,
          ativo: true
        }
      })
    )

    const analysts = await Usuario.insertMany(
      Array.from({ length: 2 }, () => {
        const nome = fakerPT_BR.person.fullName()
        const [firstName, lastName] = nome.split(" ")

        return {
          nome,
          email: fakerPT_BR.internet.email({ firstName, lastName }),
          senha,
          admin: false,
          profile: analystProfile._id,
          ativo: true
        }
      })
    )

    await Museu.insertMany(
      Array.from({ length: 4 }).map((_, index) => ({
        nome: `Museu Prof(a). ${fakerPT_BR.person.fullName()}`,
        endereco: {
          municipio: fakerPT_BR.location.city(),
          rua: fakerPT_BR.location.street(),
          UF: fakerPT_BR.location.state(),
          logradouro: fakerPT_BR.location.street(),
          numero: fakerPT_BR.location.buildingNumber(),
          complemento: fakerPT_BR.location.secondaryAddress(),
          bairro: fakerPT_BR.location.city(),
          cep: fakerPT_BR.location.zipCode(),
          uf: fakerPT_BR.location.state({ abbreviated: true })
        },
        esferaAdministraiva: "Privado",
        codIbram: index + 1,
        usuario: users[index % 2]._id
      }))
    )

    console.log("Usuários e museus criados com sucesso!")
    process.exit(0)
  } catch (error) {
    console.error("Erro ao criar usuários ou museus:", error)
    process.exit(1)
  }
})()
