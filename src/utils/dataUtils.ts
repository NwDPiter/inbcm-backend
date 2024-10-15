export class DataUtils {
  static getCurrentData() {
    return new Date()
  }

  static gerarDataFormatada(data: Date = new Date()): string {
    return data.toLocaleDateString("pt-BR")
  }

  static gerarHoraFormatada(data: Date = new Date()): string {
    return data.toLocaleTimeString("pt-BR")
  }
}
