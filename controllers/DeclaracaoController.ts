import { Request, Response } from "express";
import Declaracoes from "../models/Declaracao";
import DeclaracaoService from "../service/DeclaracaoService";
import crypto from "crypto";
import Museu from "../models/Museu";
import Bibliografico from "../models/Bibliografico";
import Museologico from "../models/Museologico";
import Arquivistico from "../models/Arquivistico";
import fs from "fs";
import path from "path";

class DeclaracaoController {
  private declaracaoService: DeclaracaoService;

  constructor() {
    this.declaracaoService = new DeclaracaoService();
    // Faz o bind do contexto atual para a função uploadDeclaracao
    this.uploadDeclaracao = this.uploadDeclaracao.bind(this);
    this.getDeclaracaoFiltrada = this.getDeclaracaoFiltrada.bind(this);
  }

  async getDeclaracaoAno(req: Request, res: Response) {
    try {
      const { anoDeclaracao } = req.params;
      const declaracao = await Declaracoes.findOne({ anoDeclaracao });

      if (!declaracao) {
        return res.status(404).json({ message: "Declaração não encontrada para o ano especificado." });
      }

      return res.status(200).json(declaracao);
    } catch (error) {
      console.error("Erro ao buscar declaração por ano:", error);
      return res.status(500).json({ message: "Erro ao buscar declaração por ano." });
    }
  }

  async getDeclaracao(req: Request, res: Response) {
    try {
      const declaracoes = await Declaracoes.find();
      return res.status(200).json(declaracoes);
    } catch (error) {
      console.error("Erro ao buscar declarações:", error);
      return res.status(500).json({ message: "Erro ao buscar declarações." });
    }
  }

  async getStatusEnum(req: Request, res: Response){
    const statusEnum = Declaracoes.schema.path('status');
    const status = Object.values(statusEnum)[0];
    return res.status(200).json(status);
  }

  async getDeclaracaoFiltrada(req: Request, res: Response) {
    try {
      const declaracoes = await this.declaracaoService.declaracaoComFiltros(req.body);
      return res.status(200).json(declaracoes);
    } catch (error) {
      console.error("Erro ao buscar declarações com filtros:", error);
      return res.status(500).json({ message: "Erro ao buscar declarações com filtros." });
    }
  }

  async uploadDeclaracao(req: Request, res: Response) {
    try {
      const { anoDeclaracao, museu: museu_id } = req.params;

      const museu = await Museu.findOne({ id: museu_id, usuario: req.body.user.id })

      if (!museu) {
        return res.status(400).json({ success: false, message: "Museu inválido" })
      }

      const files = req.files as any
      const arquivistico = files.arquivisticoArquivo;
      const bibliografico = files.bibliograficoArquivo;
      const museologico = files.museologicoArquivo;
      // Verificar se a declaração já existe para o ano especificado
      let declaracaoExistente = await this.declaracaoService.verificarDeclaracaoExistente(museu_id, anoDeclaracao);

      // Se não existir, criar uma nova declaração
      if (!declaracaoExistente) {
        declaracaoExistente = await this.declaracaoService.criarDeclaracao({
          anoDeclaracao,
          museu_id: museu.id,
          user_id: req.body.user.sub,
        });
        console.log("Declaração criada com sucesso.");
      } else {
        // Atualizar o museu na declaração existente se necessário
        declaracaoExistente.museu_id = (await Museu.findById(museu_id))!;
        await declaracaoExistente.save();
      }

      if (arquivistico) {
        const arquivisticoData = JSON.parse(req.body.arquivistico);

        const hashArquivo = crypto.createHash('sha256').update(JSON.stringify(arquivistico[0])).digest('hex');
        await this.declaracaoService.atualizarArquivistico(anoDeclaracao, {
          nome: arquivistico[0].filename,
          status: 'em análise',
          hashArquivo,
        });

        await Arquivistico.insertMany(arquivisticoData)
      }

      if (bibliografico) {
        const bibliograficoData = JSON.parse(req.body.bibliografico);

        const hashArquivo = crypto.createHash('sha256').update(JSON.stringify(bibliografico[0])).digest('hex');
        await this.declaracaoService.atualizarBibliografico(anoDeclaracao, {
          nome: bibliografico[0].filename,
          status: 'em análise',
          hashArquivo,
        });

        await Bibliografico.insertMany(bibliograficoData)
      }

      if (museologico) {
        const museologicoData = JSON.parse(req.body.museologico);

        const hashArquivo = crypto.createHash('sha256').update(JSON.stringify(museologico[0])).digest('hex');
        await this.declaracaoService.atualizarMuseologico(anoDeclaracao, {
          nome: museologico[0].filename,
          status: 'em análise',
          hashArquivo,
        });

        await Museologico.insertMany(museologicoData)
      }

      // Enviar arquivos para a fila e atualizar as declarações separadamente para cada tipo

      return res.status(200).json({ message: "Declaração enviada com sucesso!" });
    } catch (error) {
      console.error("Erro ao enviar arquivos para a declaração:", error);
      return res.status(500).json({ message: "Erro ao enviar arquivos para a declaração." });
    }
  }


  async downloadDeclaracao(req: Request, res: Response) {
    try {
      const { museu, anoDeclaracao, tipoArquivo } = req.params;
      const user_id = req.body.user.sub;
      const declaracao = await Declaracoes.findOne({ museu_id: museu, anoDeclaracao, responsavelEnvio: user_id});

      if (!declaracao) {
        return res.status(404).json({ message: "Declaração não encontrada para o ano especificado." });
      }

      let arquivo = null;
      if (tipoArquivo === 'arquivistico') {
        arquivo = declaracao.arquivistico;
      } else if (tipoArquivo === 'bibliografico') {
        arquivo = declaracao.bibliografico;
      } else if (tipoArquivo === 'museologico') {
        arquivo = declaracao.museologico;
      }

      if (!arquivo) {
        return res.status(404).json({ message: "Arquivo não encontrado para o tipo especificado." });
      }

      const filePath = path.join(__dirname, '..', 'uploads', arquivo.nome!);
      const file = fs.createReadStream(filePath);

      res.setHeader('Content-Disposition', `attachment; filename=${arquivo.nome}`);
      res.setHeader('Content-Type', 'application/octet-stream');

      file.pipe(res);
    } catch (error) {
      console.error("Erro ao baixar arquivo da declaração:", error);
      return res.status(500).json({ message: "Erro ao baixar arquivo da declaração." });
    }
  }
}

export default DeclaracaoController;
