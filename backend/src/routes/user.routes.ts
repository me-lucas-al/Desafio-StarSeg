import { FastifyInstance } from "fastify";
import { UserUseCase } from "../usecases/user.usecase";
import { UserCreate } from "../interfaces/user.interface";

export async function userRoutes(fastify: FastifyInstance) {
  const userUseCase = new UserUseCase();
  
  console.log("✅ Rotas de usuário foram carregadas!");

  fastify.post<{ Body: UserCreate }>("/", {
    schema: {
      tags: ["users"],
      summary: "Cria um novo usuário",
      description: "Cadastra um novo usuário no sistema (email deve ser único)",
      body: {
        type: "object",
        required: ["name", "email"],
        properties: {
          name: { 
            type: "string",
            description: "Nome completo do usuário"
          },
          email: { 
            type: "string", 
            format: "email",
            description: "Email válido e único"
          }
        },
        examples: [
          {
            name: "Carlos Silva",
            email: "carlos@empresa.com"
          }
        ]
      },
      response: {
        201: {
          description: "Usuário criado com sucesso",
          type: "object",
          properties: {
            id: { 
              type: "string"
            },
            name: { 
              type: "string"
            },
            email: { 
              type: "string"
            },
            createdAt: { 
              type: "string", 
              format: "date-time"
            }
          },
          examples: [
            {
              id: "550e8400-e29b-41d4-a716-446655440000",
              name: "Carlos Silva",
              email: "carlos@empresa.com",
              createdAt: "2024-05-01T12:00:00Z"
            }
          ]
        },
        400: {
          description: "Erro na requisição",
          type: "object",
          properties: {
            error: { 
              type: "string"
            }
          },
          examples: [
            {
              error: "Usuário já existente"
            }
          ]
        }
      }
    }
  }, async (req, reply) => {
    const { name, email } = req.body;
    try {
      const data = await userUseCase.create({
        name,
        email,
      });
      return reply.status(201).send(data);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      
      return reply.status(400).send({
        error: error instanceof Error ? error.message : "Erro interno do servidor"
      });
    }
  });

    fastify.post<{ Body: { email: string } }>("/login", {
    schema: {
      tags: ["users"],
      summary: "Login do usuário",
      description: "Verifica se o e-mail existe no sistema",
      body: {
        type: "object",
        required: ["email"],
        properties: {
          email: {
            type: "string",
            format: "email",
          },
        },
        examples: [
          {
            email: "carlos@empresa.com",
          },
        ],
      },
      response: {
        200: {
          description: "Usuário encontrado",
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        404: {
          description: "Usuário não encontrado",
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
  }, async (req, reply) => {
    const { email } = req.body;

    try {
      const user = await userUseCase.findByEmail(email);
      if (!user) {
        return reply.status(404).send({ error: "Usuário não encontrado" });
      }
      return reply.status(200).send(user);
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      return reply.status(500).send({ error: "Erro interno no servidor" });
    }
  });

  fastify.get("/", {
    schema: {
      tags: ["users"],
      summary: "Health check",
      description: "Rota simples para testar se a API está funcionando",
      response: {
        200: {
          description: 'Verificação do funcionamento da API',
          type: 'string'
        }
      }
    }
  }, (req, reply) => {
    reply.send("hello world");
  });
}
