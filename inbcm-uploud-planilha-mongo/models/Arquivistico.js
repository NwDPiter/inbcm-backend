import mongoose from 'mongoose';
import Bem from './BemCultural.js';

// Modelo específico para documentos arquivísticos
const ArquivisticoSchema = new mongoose.Schema({
  nivelDescricao: { type: Number, enum: [0, 1], required: true },
  dimensaoSuporte: { type: String, required: true },
  codigoReferencia: { type: String, required: true },
  nomeProdutor: { type: String, required: true },
  historiaAdministrativaBiografia: { type: String },
  historiaArquivistica: { type: String },
  procedencia: { type: String },
  ambitoConteudo: { type: String },
  sistemaArranjo: { type: String },
  existenciaLocalizacaoOriginais: { type: String },
  notasConservacao: { type: String },
  pontosAcessoIndexacaoAssuntos: { type: String },
});

// Use discriminadores para distinguir os modelos
const Arquivistico = Bem.discriminator('Arquivistico', ArquivisticoSchema);

// Exporte o modelo Arquivistico
export default Arquivistico;
