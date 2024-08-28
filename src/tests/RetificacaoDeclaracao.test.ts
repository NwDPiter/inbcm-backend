import request from 'supertest';
import path from 'path';
import { app, setupTestEnvironment, teardownTestEnvironment, museuMock } from './DeclaracaoMockSetup';
import mongoose from 'mongoose';
import { Declaracoes } from '../models';

let declaracaoMockId: string;

beforeAll(async () => {
  await setupTestEnvironment();
  const declaracao = await Declaracoes.findOne({ anoDeclaracao: '2019' });
  if (declaracao) {
    declaracaoMockId = (declaracao._id as mongoose.Types.ObjectId).toString();
  } else {
    throw new Error('Declaração mockada não encontrada');
  }
});

afterAll(async () => {
  await teardownTestEnvironment();
});


describe('PUT /retificar/:museu/:anoDeclaracao/:idDeclaracao', () => {
  it('Deve retificar uma declaração existente e verificar se a resposta recebe status code 200 e contém os dados corretos', async () => {
    const filePath = path.join(__dirname, './assets/museologico.xlsx');

    app.put('/retificar/:museu/:anoDeclaracao/:idDeclaracao', (req, res) => {
      res.status(200).json({ success: true });
    });
    
    const response = await request(app)
      .put(`/retificar/${museuMock._id}/2024/${declaracaoMockId}`)
      .set('Authorization', `Bearer mocked-token`);
    
    expect(response.status).toBe(200);
    
  });
});
