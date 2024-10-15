## BACKEND - INBCM

# API REST para o Inventário Nacional de Bens Culturais Musealizados (INBCM)

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-orange) 

## Sobre  o projeto

A API REST para o Inventário Nacional de Bens Culturais Musealizados (INBCM) é parte do sistema que visa construir a plataforma do Inventário Nacional de Bens Culturais Musealizados, uma iniciativa que busca catalogar, documentar e preservar o patrimônio cultural do Brasil. Este repositório contém o backend da plataforma, responsável por fornecer os serviços necessários para gerenciar e acessar as informações sobre os bens culturais musealizados em todo o país.

A plataforma do INBCM tem como objetivo principal centralizar e facilitar o acesso às informações sobre os bens culturais musealizados, permitindo que instituições, pesquisadores e o público em geral possam consultar e contribuir para a preservação desse importante patrimônio cultural.

## Funcionalidades Principais

- **Submissão de Declarações de Inventário**: Os museus e instituições culturais podem submeter declarações de inventário contendo informações detalhadas sobre os bens culturais que possuem.
  
- **Recebimento de Recibos de Envio de Declaração**: Após a submissão de uma declaração de inventário, os usuários recebem um recibo de envio que confirma a submissão bem-sucedida.

- **Consulta de Declarações Anuais**: A plataforma permite a consulta de declarações anuais dos museus, facilitando a análise e a geração de relatórios sobre o estado e a diversidade do patrimônio cultural musealizado em diferentes regiões do país.

## Tecnologias Utilizadas

- **Node.js e Express.js**: Para construir a infraestrutura da API REST.
  
- **TypeScript**: Para adicionar tipagem estática ao JavaScript, tornando o código mais robusto e legível.
  
- **MongoDB**: Como banco de dados NoSQL para armazenar os dados sobre os bens culturais e as declarações de inventário.

- **RabbitMQ**: Para a implementação de mensageria assíncrona e processamento de tarefas em segundo plano.

- **Jest**: Utilizado na implementação de testes automatizados, garantindo a qualidade e a cobertura do código.



# Pré requisitos para execução do projeto:

### Docker:
  Certifique-se de ter o Docker e o Docker Compose instalados em seu sistema. Você pode encontrar instruções de instalação nos sites oficiais: 
      - https://docs.docker.com/get-started/overview/ 
      - https://docs.docker.com/compose/install/.

### Pnpm:
  Certifique-se de ter o pnpm instalado em seu sistema. O pnpm é um gerenciador de pacotes rápido, eficiente e economiza espaço em disco ao compartilhar pacotes entre projetos. Você pode instalar o pnpm globalmente usando o npm com o seguinte comando:

```bash
  npm install -g pnpm
```


# Configuração do projeto:

Depois de instalar todas as ferramentas necessárias, você está pronto para executar a API do Inventário Nacional de Bens Culturais Musealizados (INBCM). Siga as etapas abaixo para iniciar o servidor e começar a usar a API:

## 1. Clonando o Repositório

Clone o repositório do projeto para o seu ambiente de desenvolvimento. Você pode fazer isso usando o Git com o seguinte comando:

```bash
  git clone  https://github.com/Nocs-lab/inbcm-backend-upload.git
```

## 2.  Instalando as Dependências
Navegue até o diretório do projeto clonado e instale todas as dependências do Node.js usando o pnpm. Isso pode ser feito com o seguinte comando:

```bash
cd inbcm-backend
pnpm install
```

## 3.Configurando o Arquivo .env
 Dentro do diretório inbcm-backend,crie um arquivo .env para configurar as variáveis de ambiente. Abaixo,visualize o template desse arquivo.
```bash
DB_USER=
DB_PASS=
KEYCLOAK_DB_PASSWORD=
DB_URL=
QUEUE_URL=
JWT_SECRET=
PUBLIC_SITE_URL="https://localhost:5174"
ADMIN_SITE_URL="https://localhost:5173"

```
# Executando a API:
[![Run in Insomnia}](https://insomnia.rest/images/run.svg)](https://insomnia.rest/run/?label=Nocs-INBCM&uri=https%3A%2F%2Fraw.githubusercontent.com%2Fbrunopithon%2Ftesteinsomnia%2Frefs%2Fheads%2Fmain%2FNocs1.json)


   Dentro do diretório do projeto,siga os seguintes passos:
  - 1 Inicialize o docker.
  - 2 Execute script para criar usuários mockados(opcional).
  - 4 Execute script para criar usuários mockados(opcional).
  - 5 Inicialize o serviço.

### Inicializando o docker:
 Dentro do diretório inbcm_backend,execute:
```bash
  pnpm run start:docker:dev

```


## Executando scripts para popular o banco
É **imprescindível** executar o script de profile anteriormente aos demais scripts para assegurar que os usuários criados sejam vinculados ao seu respectivo perfil.

### Adicionando os perfis padrão do sistema:

``` bash
  pnpm run create:default-profiles
```

### Criando mocks de usuários e museus:

``` bash
  pnpm run create:data
```
### Criando mock para usuário administrador:

``` bash
  pnpm run create:admin-user
```

### Adicionando as permissões:

``` bash
  pnpm run create:permissions
```

### Rodando todos os scripts de uma só vez
``` bash
pnpm run create:default-profiles && pnpm run create:admin-user && pnpm run create:data && pnpm run create:permissions
```

## Inicializando os serviços:
```bash
  pnpm run dev
```

# Acessando o database:
 Para acessar o mongo-express e visualizar esquema de documentos,bem como os dados persistidos,acesse localhost:8081,passando as seguintes credenciais :

 ```bash
  user: admin
  pwd: admin
 ```

 # Rodando os testes com jest:
 Para rodar os testes unitários e testes de feature:

 ```bash
  pnpm jest
 ```

  Para rodar os testes unitários e testes de feature com mais detalhes:

 ```bash
  pnpm jest --verbose
 ```

 Para verificar a cobertura de testes:

  ```bash
  pnpm jest --coverage
 ```



# Contribuições e Pull Requests
 Para contribuir com esse projeto, crie uma branch ramificada de 'development',registre suas alterações,suba essa branch para repositório remoto e crie um pull request.


# Revisão e Aprovação
Depois de criar o seu Pull Request, um dos mantenedores do projeto revisará suas alterações. Eles podem pedir modificações ou melhorias antes de aceitar o PR. Siga as orientações e faça os ajustes necessários. Assim que todas as revisões forem resolvidas e o PR for aprovado, suas alterações serão mescladas na branch principal do repositório.
