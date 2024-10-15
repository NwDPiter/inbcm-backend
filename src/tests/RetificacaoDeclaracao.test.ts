import request from "supertest"
import path from "path"
import {
  app,
  setupTestEnvironment,
  teardownTestEnvironment,
  museuMock
} from "./DeclaracaoMockSetup"
import mongoose from "mongoose"

let declaracaoId: string
let retificacao1: string
let retificacao2: string

const filePathArquivistico8itens = path.join(
  __dirname,
  "./assets/arquivistico8itens.xlsx"
)
const filePathBibliografico8itens = path.join(
  __dirname,
  "./assets/bibliografico8itens.xlsx"
)
const filePathMuseologico8itens = path.join(
  __dirname,
  "./assets/museologico8itens.xlsx"
)
const filePathArquivistico4itens = path.join(
  __dirname,
  "./assets/arquivistico4itens.xlsx"
)
const filePathBibliografico3itens = path.join(
  __dirname,
  "./assets/bibliografico3itens.xlsx"
)
const filePathMuseologico2itens = path.join(
  __dirname,
  "./assets/museologico2itens.xlsx"
)

beforeAll(async () => {
  await setupTestEnvironment()
})

afterAll(async () => {
  await teardownTestEnvironment()
})

describe("POST /uploads/:museu/:anoDeclaracao", () => {
  it("Deve-se enviar um arquivo Excel contendo 8 itens para cada tipo de bem (museológico, arquivístico e bibliográfico), verificando se a resposta retorna o status code 200 e se inclui os dados corretos do museu, ano da declaração, status e versão.", async () => {
    const response = await request(app)
      .post(`/uploads/${museuMock._id}/2024`)
      .set("Authorization", `Bearer mocked-token`)
      .attach("museologico", filePathMuseologico8itens)
      .attach("arquivistico", filePathArquivistico8itens)
      .attach("bibliografico", filePathBibliografico8itens)
      .expect(200)

    const museuId = museuMock._id as unknown as mongoose.Types.ObjectId

    expect(response.body).toHaveProperty("museu_id", museuId.toString())
    expect(response.body).toHaveProperty("anoDeclaracao", "2024")
    expect(response.body).toHaveProperty("status", "Recebida")
    expect(response.body.museologico.quantidadeItens).toBe(8)
    expect(response.body.arquivistico.quantidadeItens).toBe(8)
    expect(response.body.bibliografico.quantidadeItens).toBe(8)
    expect(response.body.versao).toBe(1)
    expect(response.status).toBe(200)

    declaracaoId = response.body._id
  })
})

describe("PUT /retificar/:museu/:anoDeclaracao/:idDeclaracap", () => {
  it("Deve retificar uma declaração existente, alterarando o bem arquivístico com quatro itens e verificar se a resposta recebe status code 200 bem como os resultados correspondentes de quantidade de itens, versão do bem e da retificação", async () => {
    const url = `/retificar/${museuMock._id}/2024/${declaracaoId}`
    const response = await request(app)
      .put(`/retificar/${museuMock._id}/2024/${declaracaoId}`)
      .set("Authorization", `Bearer mocked-token`)
      .attach("arquivistico", filePathArquivistico4itens)
    expect(response.body.arquivistico.quantidadeItens).toBe(4)
    expect(response.body.bibliografico.quantidadeItens).toBe(8)
    expect(response.body.museologico.quantidadeItens).toBe(8)
    expect(response.body.arquivistico.versao).toBe(2)
    expect(response.body.bibliografico.versao).toBe(1)
    expect(response.body.museologico.versao).toBe(1)
    expect(response.body.versao).toBe(2)
    expect(response.status).toBe(200)

    retificacao1 = response.body._id
  })

  it("Deve-se retificar uma declaração existente, atualizando o bem bibliográfico com três itens, e verificar se a resposta retorna o status code 200, além de validar se os resultados incluem a quantidade correta de itens, a versão atualizada do bem e da retificação.", async () => {
    const url = `/retificar/${museuMock._id}/2024/${retificacao1}`
    const response = await request(app)
      .put(`/retificar/${museuMock._id}/2024/${retificacao1}`)
      .set("Authorization", `Bearer mocked-token`)
      .attach("bibliografico", filePathBibliografico3itens)
    expect(response.body.arquivistico.quantidadeItens).toBe(4)
    expect(response.body.bibliografico.quantidadeItens).toBe(3)
    expect(response.body.museologico.quantidadeItens).toBe(8)
    expect(response.body.arquivistico.versao).toBe(2)
    expect(response.body.bibliografico.versao).toBe(3)
    expect(response.body.museologico.versao).toBe(1)
    expect(response.body.versao).toBe(3)
    expect(response.status).toBe(200)

    retificacao2 = response.body._id
  })

  it("Deve-se retificar uma declaração existente, atualizando o bem museológico com dois itens, e verificar se a resposta retorna o status code 200, além de validar a quantidade correta de itens, a versão atualizada do bem e da retificação.", async () => {
    const url = `/retificar/${museuMock._id}/2024/${retificacao2}`
    const response = await request(app)
      .put(`/retificar/${museuMock._id}/2024/${retificacao2}`)
      .set("Authorization", `Bearer mocked-token`)
      .attach("museologico", filePathMuseologico2itens)
    expect(response.body.arquivistico.quantidadeItens).toBe(4)
    expect(response.body.bibliografico.quantidadeItens).toBe(3)
    expect(response.body.museologico.quantidadeItens).toBe(2)
    expect(response.body.arquivistico.versao).toBe(2)
    expect(response.body.bibliografico.versao).toBe(3)
    expect(response.body.museologico.versao).toBe(4)
    expect(response.body.versao).toBe(4)
    expect(response.status).toBe(200)
  })

  it("Deve tentar retificar uma declaração que não é a mais recente e retornar um erro com status code 406.", async () => {
    const url = `/retificar/${museuMock._id}/2024/${retificacao2}`
    const response = await request(app)
      .put(`/retificar/${museuMock._id}/2024/${retificacao2}`)
      .set("Authorization", `Bearer mocked-token`)
      .attach("museologico", filePathMuseologico2itens)
    expect(response.status).toBe(406)
  })
})
