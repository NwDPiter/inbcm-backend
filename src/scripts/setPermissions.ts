import connect from "../db/conn"
import { Permission } from "../models/Permission"

const setPermissions = async () => {
  await connect()

  const permissions = [
    {
      name: "createProfile",
      label: "Criar Perfil",
      description: "Permite criar novos perfis de usuário"
    },
    {
      name: "getProfiles",
      label: "Listar Perfis",
      description: "Permite visualizar a lista de perfis de usuário"
    },
    {
      name: "getProfileById",
      label: "Visualizar Perfil",
      description: "Permite visualizar detalhes de um perfil de usuário"
    },
    {
      name: "updateProfile",
      label: "Atualizar Perfil",
      description: "Permite atualizar as informações de um perfil de usuário"
    },
    {
      name: "deleteProfile",
      label: "Deletar Perfil",
      description: "Permite excluir um perfil de usuário"
    },
    {
      name: "addPermissions",
      label: "Adicionar Permissões",
      description:
        "Permite adicionar ou modificar permissões em perfis de usuário"
    }
  ]

  try {
    for (const permission of permissions) {
      // Verifica pelo nome se a permissão já existe
      const existingPermission = await Permission.findOne({
        name: permission.name
      })

      if (!existingPermission) {
        await Permission.create(permission)
        console.log(`Permissão "${permission.name}" criada com sucesso!`)
      } else {
        console.log(`Permissão "${permission.name}" já existe. Ignorando...`)
      }
    }

    process.exit(0)
  } catch (error) {
    console.error("Erro ao criar permissões:", error)
    process.exit(1)
  }
}

setPermissions()
