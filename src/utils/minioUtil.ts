import { format } from "date-fns"
import minioClient from "../db/minioClient"
import { Readable } from "stream"

/**
 * Implementa regra de negócio para definição de nomenclatura dos arquivos.
 *
 * Para nomear o arquivo deve-se considerar o nome do documento,o identificador do museu o qual foi submetido,ano da declaração e o tipo de arquivo.
 * Deve ser chamado antes de fazer o upload para o Minio.
 *
 * @param {string} fileName - nome original do arquivo.
 * @param {string} museuId - id do museu o vinculado a submissão do documento.
 * @param {String} anoDeclaracao - ano de declaração do documento.
 * @param {String} tipoArquivo - Tipo de arquivo,considerando: museologico,bibliográfico e arquivístico.
 * @returns {String} - retorna o nome do arquivo obecedendo a regra de nomenclatura.

 */
export const generateFilePath = (
  fileName: string,
  museuId: string,
  declarationYear: string,
  archiveType: string
): string => {
  const now = Date.now()
  const timestamp = format(now, "dd_MM_yyyy_HH_mm_ss_SSS")

  const sanitizedFileName = fileName.replace(/\s+/g, "_")
  const uniqueFileName = `${timestamp}-${sanitizedFileName}`
  return `${museuId}/${declarationYear}/${archiveType}/${uniqueFileName}`
}

/**
 * Recupera o caminho do arquivo mais recente de um bucket e prefixo especificados no MinIO.
 *
 * Esta função lista todos os objetos no bucket e prefixo fornecidos, ordena-os pela data
 * de modificação mais recente e retorna o caminho do objeto mais recente.
 *
 * @param {string} bucketName - O nome do bucket no MinIO.
 * @param {string} prefix - O prefixo (caminho do diretório) para filtrar os objetos dentro do bucket.
 * @returns {Promise<string | null>} - O caminho do arquivo mais recente, ou null se nenhum objeto for encontrado.
 * @throws {Error} - Lança um erro se houver um problema ao listar os objetos no MinIO.
 */
export async function getLatestPathArchive(
  bucketName: string,
  prefix: string
): Promise<string | null> {
  try {
    const objects = []
    const stream = minioClient.listObjects(bucketName, prefix, true)
    for await (const obj of stream) {
      objects.push(obj)
    }

    objects.sort(
      (a, b) =>
        new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
    )

    return objects.length > 0 ? objects[0].name : null
  } catch (error) {
    throw new Error("Erro ao listar objetos no MinIO")
  }
}

/**
 * Faz upload de um arquivo para o MinIO.
 *
 * Esta função recebe um arquivo enviado via Express/Multer, constrói um caminho de arquivo
 * baseado nos parâmetros fornecidos, e envia o arquivo para o bucket especificado no MinIO.
 *
 * @param {Express.Multer.File} file - O arquivo a ser enviado, fornecido pelo Multer.
 * @param {string} museumId - O ID do museu, usado para compor o caminho do arquivo.
 * @param {string} declarationYear - O ano da declaração, usado para compor o caminho do arquivo.
 * @param {string} fileType - O tipo do arquivo (ex: 'archival', 'bibliographic', 'museological'), usado para compor o caminho do arquivo.
 * @returns {Promise<void>} - Resolve quando o upload é concluído.
 * @throws {Error} - Lança um erro se houver um problema durante o upload do arquivo.
 */
export const uploadFileToMinio = async (
  file: Express.Multer.File,
  museumId: string,
  declarationYear: string,
  fileType: string
) => {
  const objectPath = generateFilePath(
    file.originalname,
    museumId,
    declarationYear,
    fileType
  )

  const stream = Readable.from(file.buffer)

  await minioClient.putObject("inbcm", objectPath, stream, file.buffer.length, {
    "Content-Type": file.mimetype,
    "x-amz-acl": "public-read"
  })
}
