import multer, { MulterError } from "multer"
import { Request, RequestHandler } from "express"
import { uploadFileToMinio } from "../utils/minioUtil"

const upload = multer({
  limits: { fileSize: 1024 * 1024 * 1024 }
}).fields([
  { name: "arquivistico", maxCount: 1 },
  { name: "bibliografico", maxCount: 1 },
  { name: "museologico", maxCount: 1 }
])

interface SubmissionRequest extends Request {
  files: {
    arquivistico?: Express.Multer.File[]
    bibliografico?: Express.Multer.File[]
    museologico?: Express.Multer.File[]
  }
}

const uploadMiddleware: RequestHandler = async (req, res, next) => {
  upload(req, res, async (err: any) => {
    if (err) {
      const errorMessage =
        err instanceof MulterError
          ? "Erro ao fazer submissão do(s) arquivo(s): " + err.message
          : "Erro não mapeado ao fazer submissão do(s) arquivo(s): " +
            err.message
      return res
        .status(err instanceof MulterError ? 400 : 500)
        .json({ message: errorMessage })
    }

    const uploadReq = req as SubmissionRequest

    const { arquivistico, bibliografico, museologico } = uploadReq.files

    if (!arquivistico && !bibliografico && !museologico) {
      return res
        .status(400)
        .json({ message: "Pelo menos um arquivo deve ser enviado." })
    }

    const { museu, anoDeclaracao } = req.params

    try {
      if (arquivistico && arquivistico.length > 0) {
        await uploadFileToMinio(
          arquivistico[0],
          museu,
          anoDeclaracao,
          "arquivistico"
        )
      }

      if (bibliografico && bibliografico.length > 0) {
        await uploadFileToMinio(
          bibliografico[0],
          museu,
          anoDeclaracao,
          "bibliografico"
        )
      }

      if (museologico && museologico.length > 0) {
        await uploadFileToMinio(
          museologico[0],
          museu,
          anoDeclaracao,
          "museologico"
        )
      }

      next()
    } catch (uploadError) {
      return res.status(500).json({
        message: "Erro ao fazer upload para MinIO",
        error: uploadError
      })
    }
  })
}

export default uploadMiddleware
