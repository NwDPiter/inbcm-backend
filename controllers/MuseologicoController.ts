import type { Request, Response } from "express";
import UploadService from "../service/declaracaoService/DeclaracaoService";

const uploadService = new UploadService();

class MuseologicoController {
  async uploadMuseologicoModel(req: Request, res: Response) {
    try {
      const file = req.file!;
      const tipoArquivo = "museologico"; // Definir o tipo de arquivo como 'museologico'

      // Chama a função de upload com o arquivo e o tipo de arquivo
      await uploadService.sendToQueue(file, tipoArquivo);

      return res.status(202).json({ message: "Declaração recebida com sucesso." });

    } catch (error) {
      console.error("Erro ao enviar arquivo museológico para a fila:", error);
      return res
        .status(500)
        .json({
          success: false,
          message: "Erro ao enviar arquivo museológico para a fila.",
        });
    }
  }
}

// Exporta a classe MuseologicoController como exportação padrão
export default MuseologicoController;
