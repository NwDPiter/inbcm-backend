import { Status } from "../enums/Status"
import { createHashUpdate } from "../utils/hashUtils"
import {
  Declaracoes,
  Museu,
  Arquivo,
  Arquivistico,
  Bibliografico,
  Museologico,
  DeclaracaoModel,
  Usuario,
  IMuseu
} from "../models"
import { IUsuario } from "../models/Usuario"
import mongoose from "mongoose"
import {
  validate_museologico,
  validate_arquivistico,
  validate_bibliografico
} from "inbcm-xlsx-validator"
import { createHash } from "../utils/hashUtils"
import { Profile } from "../models/Profile"
import { DataUtils } from "../utils/dataUtils"

class DeclaracaoService {
  async declaracoesPorStatusPorAno() {
    try {
      const result = await Declaracoes.aggregate([
        {
          $group: {
            _id: {
              status: "$status",
              ano: "$anoDeclaracao"
            },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            status: "$_id.status",
            ano: "$_id.ano",
            count: "$count"
          }
        }
      ])

      const anos = result
        .map((item) => item.ano)
        .filter((value, index, self) => self.indexOf(value) === index)

      const statusEnum = Declaracoes.schema.path("status")
      const status = Object.values(statusEnum)[0]

      const data = anos.map((ano) => {
        const statusCount = status.reduce((acc, item) => {
          const statusItem = result.find(
            (resultItem) => resultItem.ano === ano && resultItem.status === item
          )
          acc.push(statusItem ? statusItem.count : 0)
          return acc
        }, [])

        const total = statusCount.reduce((acc, item) => acc + item, 0)

        return [ano, total, ...statusCount]
      })

      return data
    } catch (error) {
      console.error(
        "Erro ao realizar busca de declarações por status para o dashboard:",
        error
      )
      throw new Error(
        "Erro ao realizar busca de declarações por status para o dashboard."
      )
    }
  }

  async declaracoesPorStatus() {
    try {
      const result = await Declaracoes.aggregate([
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            status: "$_id",
            count: "$count"
          }
        }
      ])

      const statusCounts = result.reduce((acc, item) => {
        acc[item.status] = item.count
        return acc
      }, {})

      return statusCounts
    } catch (error) {
      console.error(
        "Erro ao realizar busca de declarações por status para o dashboard:",
        error
      )
      throw new Error(
        "Erro ao realizar busca de declarações por status para o dashboard."
      )
    }
  }

  async declaracoesPorUF() {
    try {
      const result = await Declaracoes.aggregate([
        {
          $lookup: {
            from: "museus",
            localField: "museu_id",
            foreignField: "_id",
            as: "museu"
          }
        },
        {
          $unwind: "$museu"
        },
        {
          $group: {
            _id: "$museu.endereco.uf",
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            uf: "$_id",
            count: "$count"
          }
        }
      ])

      const ufs = result.reduce((acc, item) => {
        acc[item.uf] = item.count
        return acc
      }, {})

      return ufs
    } catch (error) {
      console.error(
        "Erro ao realizar busca de declarações por UF para o dashboard:",
        error
      )
      throw new Error(
        "Erro ao realizar busca de declarações por UF para o dashboard."
      )
    }
  }

  async declaracoesPorRegiao() {
    try {
      const result = await Declaracoes.aggregate([
        {
          $lookup: {
            from: "museus",
            localField: "museu_id",
            foreignField: "_id",
            as: "museu"
          }
        },
        {
          $unwind: "$museu"
        },
        {
          $group: {
            _id: {
              regiao: {
                $switch: {
                  branches: [
                    {
                      case: {
                        $in: [
                          "$museu.endereco.uf",
                          ["AC", "AP", "AM", "PA", "RO", "RR", "TO"]
                        ]
                      },
                      then: "Norte"
                    },
                    {
                      case: {
                        $in: [
                          "$museu.endereco.uf",
                          ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"]
                        ]
                      },
                      then: "Nordeste"
                    },
                    {
                      case: {
                        $in: ["$museu.endereco.uf", ["DF", "GO", "MT", "MS"]]
                      },
                      then: "Centro-Oeste"
                    },
                    {
                      case: {
                        $in: ["$museu.endereco.uf", ["ES", "MG", "RJ", "SP"]]
                      },
                      then: "Sudeste"
                    },
                    {
                      case: { $in: ["$museu.endereco.uf", ["PR", "RS", "SC"]] },
                      then: "Sul"
                    }
                  ],
                  default: "Desconhecida"
                }
              },
              status: "$status"
            },
            count: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            regiao: "$_id.regiao",
            status: "$_id.status",
            count: "$count"
          }
        }
      ])

      let regioes = ["Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul"]
      const statusEnum = Declaracoes.schema.path("status")
      const status = Object.values(statusEnum)[0]

      // [[regiao, total, ...status], ...]
      // Exemplo: [["Norte", 10, 2, 3, 5], ["Nordeste", 15, 4, 6, 5], ...]
      regioes = regioes.map((regiao) => {
        const regiaoStatus = result
          .filter((item) => item.regiao === regiao)
          .reduce((acc, item) => {
            acc[item.status] = item.count
            return acc
          }, {})

        const total = Object.values(regiaoStatus).reduce(
          (acc, item) => acc + item,
          0
        )

        const statusCount = status.reduce((acc, item) => {
          acc.push(regiaoStatus[item] || 0)
          return acc
        }, [])

        return [regiao, total, ...statusCount]
      })

      return regioes
    } catch (error) {
      console.error(
        "Erro ao realizar busca de declarações por região para o dashboard:",
        error
      )
      throw new Error(
        "Erro ao realizar busca de declarações por região para o dashboard."
      )
    }
  }

  async declaracoesPorAnoDashboard() {
    try {
      const result = await Declaracoes.aggregate([
        {
          $group: {
            _id: "$anoDeclaracao",
            count: { $sum: 1 }
          }
        },
        {
          $sort: { _id: 1 } // Ordenar por ano, se necessário
        }
      ])

      // Transformar o resultado em um objeto com anos como chaves
      const formattedResult = result.reduce((acc, item) => {
        acc[item._id] = item.count
        return acc
      }, {})

      return formattedResult
    } catch (error) {
      console.error(
        "Erro ao buscar declarações por ano para o dashboard:",
        error
      )
      throw new Error("Erro ao buscar declarações por ano para o dashboard.")
    }
  }

  async declaracaoComFiltros({
    anoReferencia,
    status,
    nomeMuseu,
    dataInicio,
    dataFim,
    regiao,
    uf,
    ultimaDeclaracao = true
  }: {
    anoReferencia: string
    status: string
    nomeMuseu: string
    dataInicio: number
    dataFim: number
    regiao: string
    uf: string
    ultimaDeclaracao: boolean
  }) {
    try {
      let query = Declaracoes.find()
      if (ultimaDeclaracao || ultimaDeclaracao == null) {
        query = query.where("ultimaDeclaracao").equals(true)
      }

      //Lógica para extrair os tipos de status do model e verificar se foi enviado um status válido para filtrar
      const statusEnum = Declaracoes.schema.path("status")
      const statusArray = Object.values(statusEnum)[0]
      const statusExistente = statusArray.includes(status)
      const statusCount: Record<string, number> = {}
      if (statusExistente) {
        query = query.where("status").equals(status)
      } else {
        // Cria os campos de count atribuindo 0 para cada status em statusCount
        statusArray.forEach((statusItem: string) => {
          statusCount[statusItem] = 0
        })
      }

      // Filtro para UF
      if (uf) {
        const museus = await Museu.find({ "endereco.uf": uf })
        const museuIds = museus.map((museu) => museu._id)
        query = query.where("museu_id").in(museuIds)
      }

      // Definindo o mapeamento de regiões para UFs
      const regioesMap: { [key: string]: string[] } = {
        norte: ["AC", "AP", "AM", "PA", "RO", "RR", "TO"],
        nordeste: ["AL", "BA", "CE", "MA", "PB", "PE", "PI", "RN", "SE"],
        "centro-oeste": ["GO", "MT", "MS", "DF"],
        sudeste: ["ES", "MG", "RJ", "SP"],
        sul: ["PR", "RS", "SC"]
      }
      // Filtro por cada região
      if (regiao) {
        const lowerCaseRegiao = regiao.toLowerCase()
        if (lowerCaseRegiao in regioesMap) {
          const ufs = regioesMap[lowerCaseRegiao]
          const museus = await Museu.find({ "endereco.uf": { $in: ufs } })
          const museuIds = museus.map((museu) => museu._id)
          query = query.where("museu_id").in(museuIds)
        }
      }

      //Filtro para ano da declaração
      if (anoReferencia) {
        query = query.where("anoDeclaracao").equals(anoReferencia)
      }

      //Filtro por data
      if (dataInicio && dataFim) {
        const endDate = new Date(dataFim)
        endDate.setHours(23, 59, 59, 999) // Definir o final do dia para a data de fim

        query = query.where("dataCriacao").gte(dataInicio).lte(dataFim)
      }

      //Filtro para o nome do museu
      if (nomeMuseu) {
        const museus = await Museu.find({ nome: nomeMuseu })
        const museuIds = museus.map((museu) => museu._id)
        query = query.where("museu_id").in(museuIds)
      }
      const result = await query
        .populate([{ path: "museu_id", model: Museu, select: [""] }])
        .sort("-dataCriacao")
        .exec()

      let [bemCount, museologicoCount, bibliograficoCount, arquivisticoCount] =
        [0, 0, 0, 0]

      const data = result.map((d) => {
        const data = d.toJSON()
        // @ts-expect-error - O campo museu_id é um objeto, não uma string
        data.museu_id.endereco.regiao =
          // @ts-expect-error - O campo museu_id é um objeto, não uma string
          regioesMap[data.museu_id.endereco.uf as keyof typeof regioesMap]
        if (!statusExistente && data.status in statusCount) {
          statusCount[data.status] += 1
        }
        // Adicionando contagem dos bens
        if (data.museologico) {
          museologicoCount += data.museologico.quantidadeItens || 0
        }
        if (data.bibliografico) {
          bibliograficoCount += data.bibliografico.quantidadeItens || 0
        }
        if (data.arquivistico) {
          arquivisticoCount += data.arquivistico.quantidadeItens || 0
        }
        bemCount +=
          (data.museologico?.quantidadeItens || 0) +
          (data.bibliografico?.quantidadeItens || 0) +
          (data.arquivistico?.quantidadeItens || 0)
        return data
      })

      return {
        declaracaoCount: data.length,
        statusCount,
        bemCount,
        museologicoCount,
        bibliograficoCount,
        arquivisticoCount,
        data
      }
    } catch (error) {
      throw new Error("Erro ao buscar declarações com filtros.")
    }
  }

  async verificarDeclaracaoExistente(museu: string, anoDeclaracao: string) {
    const declaracaoExistente = await Declaracoes.findOne({
      anoDeclaracao,
      museu_id: museu
    })

    return declaracaoExistente
  }

  /**
   * Processa e atualiza um tipo específico de bem (arquivístico, bibliográfico ou museológico) em uma declaração.
   *
   * @param anoDeclaracao - ano de criacao da declaracao.
   * @param responsavelEnvio  - usuario logado responsavel pelo envio da declaracao
   * @param museu_id - id do museu o qual deseja-se criar uma declaracao.
   * @param muse_nome - nome do museu o qual deseja-se criar uma declaracao
   *
   * @returns retorna uma nova declaracao ou um erro ao tentar criar uma declaracao
   */
  async criarDadosDeclaracao(
    museu: typeof Museu,
    responsavelEnvio: IMuseu,
    anoDeclaracao: string,
    declaracaoExistente: DeclaracaoModel,
    novaVersao: number,
    salt: string,
    dataRecebimento: Date
  ) {
    return declaracaoExistente
      ? {
          museu_id: declaracaoExistente.museu_id,
          museu_nome: declaracaoExistente.museu_nome,
          anoDeclaracao: declaracaoExistente.anoDeclaracao,
          responsavelEnvio: declaracaoExistente.responsavelEnvio,
          totalItensDeclarados: declaracaoExistente.totalItensDeclarados,
          status: declaracaoExistente.status,
          retificacao: true,
          retificacaoRef: declaracaoExistente._id as mongoose.Types.ObjectId,
          versao: novaVersao,
          hashDeclaracao: createHash(
            declaracaoExistente._id as mongoose.Types.ObjectId,
            salt
          ),
          dataRecebimento: dataRecebimento
        }
      : {
          anoDeclaracao,
          museu_id: museu,
          museu_nome: museu.nome,
          responsavelEnvio: responsavelEnvio,
          retificacao: false,
          versao: novaVersao,
          status: Status.Recebida,
          hashDeclaracao: createHash(new mongoose.Types.ObjectId(), salt),
          dataRecebimento: dataRecebimento
        }
  }

  /**
   * Processa e atualiza o histórico da declaração de um tipo específico de bem (arquivístico, bibliográfico ou museológico) em uma declaração.
   *
   * @param arquivos - Lista de arquivos enviados (pode ser indefinida).
   * @param dados - String JSON contendo os dados do bem.
   * @param erros - String JSON contendo os erros relacionados ao bem.
   * @param declaracao - A declaração que está sendo atualizada.
   * @param tipo - O tipo de bem a ser processado ("arquivistico", "bibliografico" ou "museologico").
   *
   * @returns Uma promessa que resolve quando o processamento e a atualização são concluídos com sucesso.
   */
  async updateDeclaracao(
    arquivos: Express.Multer.File[] | undefined,
    novaDeclaracao: DeclaracaoModel,
    tipo: "arquivistico" | "bibliografico" | "museologico",
    arquivoAnterior: Arquivo | null,
    novaVersao: number
  ) {
    try {
      if (arquivos && arquivos.length > 0) {
        const novoHashBemCultural = createHashUpdate(
          arquivos[0].path,
          arquivos[0].filename
        )

        let validate = validate_arquivistico
        if (tipo === "bibliografico") {
          validate = validate_bibliografico
        } else if (tipo === "museologico") {
          validate = validate_museologico
        }

        const { data: arquivoData, errors: pendencias } = await validate(
          arquivos[0].buffer
        )

        const dadosAlterados: Partial<Arquivo> = {
          nome: arquivos[0].filename,
          status: novaDeclaracao.status,
          hashArquivo: novoHashBemCultural,
          pendencias,
          quantidadeItens: arquivoData.length,
          versao: novaVersao
        }
        novaDeclaracao[tipo] = {
          ...arquivoAnterior,
          ...dadosAlterados
        } as Arquivo

        arquivoData.forEach((item: { [key: string]: unknown }) => {
          item.declaracao_ref = novaDeclaracao._id
          item.versao = novaVersao
        })

        let Modelo
        switch (tipo) {
          case "arquivistico":
            Modelo = Arquivistico
            break
          case "bibliografico":
            Modelo = Bibliografico
            break
          case "museologico":
            Modelo = Museologico
            break
          default:
            throw new Error("Tipo de declaração inválido")
        }

        await Modelo.insertMany(arquivoData)
      } else if (arquivoAnterior) {
        novaDeclaracao[tipo] = { ...arquivoAnterior } as Arquivo
      }

      if (novaDeclaracao.retificacaoRef) {
        const declaracaoAnterior = (await Declaracoes.findById(
          novaDeclaracao.retificacaoRef
        ).exec()) as DeclaracaoModel | null

        if (declaracaoAnterior) {
          novaDeclaracao.retificacaoRef =
            declaracaoAnterior._id as mongoose.Types.ObjectId
          novaDeclaracao.retificacao = true
        }
      }

      await novaDeclaracao.save()
    } catch (error) {
      console.error("Erro ao atualizar a declaração:", error)
      throw new Error("Erro ao atualizar a declaração: " + error)
    }
  }

  async listarAnalistas() {
    const analistaProfile = await Profile.findOne({ name: "analyst" })

    if (!analistaProfile) {
      throw new Error("Perfil de analista não encontrado.")
    }

    const analistas: IUsuario[] = await Usuario.find({
      profile: analistaProfile._id
    })

    return analistas
  }

  async enviarParaAnalise(
    id: string,
    analistas: string[],
    adminId: string
  ): Promise<void> {
    const objectId = new mongoose.Types.ObjectId(id)
    const declaracao = await Declaracoes.findById(objectId)

    if (!declaracao) {
      throw new Error("Declaração não encontrada.")
    }

    if (declaracao.status !== Status.Recebida) {
      throw new Error("Declaração não está no estado adequado para envio.")
    }

    const analistasList: IUsuario[] = await this.listarAnalistas()
    const analistasIds = analistasList.map((analista) => analista._id)

    for (const analistaId of analistas) {
      if (!analistasIds.toString().includes(analistaId)) {
        throw new Error(`Usuário com ID ${analistaId} não é um analista.`)
      }
    }

    declaracao.analistasResponsaveis = analistas.map(
      (id) => new mongoose.Types.ObjectId(id)
    )
    declaracao.status = Status.EmAnalise
    declaracao.dataEnvioAnalise = DataUtils.getCurrentData()
    declaracao.responsavelEnvioAnalise = new mongoose.Types.ObjectId(adminId)

    await declaracao.save({ validateBeforeSave: false })
  }

  async concluirAnalise(id: string, status: Status): Promise<DeclaracaoModel> {
    const declaracaoId = new mongoose.Types.ObjectId(id)
    const declaracao = await Declaracoes.findById(declaracaoId)
    let evento = ""

    if (!declaracao) {
      throw new Error("Declaração não encontrada.")
    }

    if (![Status.EmConformidade, Status.NaoConformidade].includes(status)) {
      evento
      throw new Error("Status inválido.")
    }

    if (status === Status.EmConformidade) {
      evento = Status.EmConformidade
    } else if (status === Status.NaoConformidade) {
      evento = Status.NaoConformidade
    }
    declaracao.status = status
    declaracao.dataFimAnalise = DataUtils.getCurrentData()

    await declaracao.save()

    return declaracao
  }

  /**
   * Processa e atualiza o histórico da declaração de um tipo específico de bem (arquivístico, bibliográfico ou museológico) em uma declaração.
   *
   * @param museuId - String  contendo um  id de museu.
   * @param ano - String contendo um ano de declaracao.
   * @param userId - String  contendo id de usuario
   * @param tipoItem - String contenado  tipo de bem a ser buscado ("Arquivistico", "Bibliografico" ou "Museologico").
   *
   *
   * @returns Uma promessa que resolve uma listagem de itens de um determinado tipo de bem.
   */
  async buscarItensPorTipo(
    museuId: string,
    ano: string,
    userId: string,
    tipoItem: string
  ) {
    // Verificar se o museu pertence ao usuário específico
    const museu = await Museu.findOne({ _id: museuId, usuario: userId })

    if (!museu) {
      throw new Error("Museu inválido ou você não tem permissão para acessá-lo")
    }

    // Definir o modelo e os campos de projeção com base no tipo de item
    let Model: typeof Arquivistico | typeof Bibliografico | typeof Museologico
    let retornoPorItem: string

    switch (tipoItem) {
      case "arquivistico":
        Model = Arquivistico
        retornoPorItem = "_id coddereferencia titulo nomedoprodutor" // Defina os campos específicos para arquivistico
        break
      case "bibliografico":
        Model = Bibliografico
        retornoPorItem = "_id nderegistro situacao titulo localdeproducao" // Defina os campos específicos para bibliografico
        break
      case "museologico":
        Model = Museologico
        retornoPorItem = "_id nderegistro autor situacao denominacao" // Defina os campos específicos para museologico
        break
      default:
        throw new Error("Tipo de item inválido")
    }

    // Primeira agregação: encontrar a maior versão
    const maxVersaoResult = await Model.aggregate([
      {
        $lookup: {
          from: "declaracoes",
          localField: "declaracao_ref",
          foreignField: "_id",
          as: "declaracoes"
        }
      },
      {
        $unwind: "$declaracoes"
      },
      {
        $match: {
          "declaracoes.museu_id": new mongoose.Types.ObjectId(museuId),
          "declaracoes.anoDeclaracao": ano,
          "declaracoes.responsavelEnvio": new mongoose.Types.ObjectId(userId)
        }
      },
      {
        $group: {
          _id: null,
          maxVersao: { $max: "$versao" }
        }
      }
    ])

    const maxVersao = maxVersaoResult[0]?.maxVersao

    if (maxVersao === undefined) {
      return [] // Se não houver versão encontrada, retornar array vazio
    }

    // Segunda agregação: buscar os itens do tipo especificado da maior versão encontrada
    const result = await Model.find({
      versao: maxVersao,
      declaracao_ref: {
        $in: await Declaracoes.find({
          museu_id: new mongoose.Types.ObjectId(museuId),
          anoDeclaracao: ano,
          responsavelEnvio: new mongoose.Types.ObjectId(userId)
        }).select("_id")
      }
    }).select(retornoPorItem)

    return result
  }
}

export default DeclaracaoService
