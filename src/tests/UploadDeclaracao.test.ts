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

beforeAll(async () => {
  await setupTestEnvironment()
})

afterAll(async () => {
  await teardownTestEnvironment()
})

const filePathMuseologico2itens = path.join(
  __dirname,
  "./assets/museologico2itens.xlsx"
)
const filePathArquivistico4itens = path.join(
  __dirname,
  "./assets/arquivistico4itens.xlsx"
)
const filePathBibliografico3itens = path.join(
  __dirname,
  "./assets/bibliografico3itens.xlsx"
)

describe("POST /uploads/:museu/:anoDeclaracao", () => {
  it("Deve enviar um arquivo Excel museológico, arquivistico e bibliográfico e verificar se a resposta recebe status code 200 e contém os dados corretos do museu, ano da declaração e status", async () => {
    const response = await request(app)
      .post(`/uploads/${museuMock._id}/2024`)
      .set("Authorization", `Bearer mocked-token`)
      .attach("museologico", filePathMuseologico2itens)
      .attach("arquivistico", filePathArquivistico4itens)
      .attach("bibliografico", filePathBibliografico3itens)
      .expect(200)

    const museuId = museuMock._id as unknown as mongoose.Types.ObjectId

    expect(response.body).toHaveProperty("museu_id", museuId.toString())
    expect(response.body).toHaveProperty("anoDeclaracao", "2024")
    expect(response.body).toHaveProperty("status", "Recebida")
    expect(response.body.museologico.quantidadeItens).toBe(2)
    expect(response.body.arquivistico.quantidadeItens).toBe(4)
    expect(response.body.bibliografico.quantidadeItens).toBe(3)
  })

  it("Deve retornar erro 406 se tentar criar uma declaração com ano referência e museu já utilizados", async () => {
    const response = await request(app)
      .post(`/uploads/${museuMock._id}/2024`)
      .set("Authorization", `Bearer mocked-token`)
      .attach("museologico", filePathMuseologico2itens)
      .expect(406)
  })
})
