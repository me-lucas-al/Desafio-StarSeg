import { ContactUseCase } from "../usecases/contact.usecase";
import { Contact, ContactCreate } from "../interfaces/contacts.interface";
import { authMiddleware } from "../middlewares/auth.middleware";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

export async function contactRoutes(fastify: FastifyInstance) {
  const contactUseCase = new ContactUseCase();
  fastify.addHook("preHandler", authMiddleware);
  
  fastify.post<{ Body: ContactCreate, Headers: { email: string } }>
  ("/",
  {
    schema: {
      tags: ["contacts"],
      summary: "Cria um novo contato com endereço",
      description: "Associa um contato ao usuário autenticado (via email no header) e completa automaticamente o endereço via CEP",
      headers: {
        type: "object",
        required: ["email"],
        properties: {
          email: {
            type: "string",
            format: "email",
            examples: ["usuario_logado@empresa.com"] 
          },
        },
      },
      body: {
        type: "object",
        required: ["name", "email", "phone", "cep", "number"],
        properties: {
          name: { type: "string" },
          email: { type: "string", format: "email" },
          phone: { type: "string" },
          cep: { type: "string", pattern: "^\\d{5}-?\\d{3}$", examples: ["01001000"] },
          number: { type: "string", examples: ["150"] },
          complement: { type: "string", examples: ["Apto 101"] }
        },
        examples: [ 
          {
            name: "Maria Souza",
            email: "maria@contato.com",
            phone: "11987654321",
            cep: "01001000",
            number: "150",
            complement: "Apto 101"
          }
        ]
      },
      response: {
        201: {
          description: "Contato criado com sucesso",
          type: "object",
          properties: {
            id: { type: "string", examples: ["2a69e5e1-0fba-4f1a-9e87-b67aacc68c88" ]},
            name: { type: "string", examples: ["Maria Souza" ]},
            email: { type: "string", examples: ["maria@contato.com" ]},
            phone: { type: "string", examples: ["11987654321"] },
            cep: { type: "string", examples: ["01001000"] },
            street: { type: "string", examples: ["Praça da Sé" ]},
            number: { type: "string", examples: ["150" ]},
            district: { type: "string", examples: ["Sé" ]},
            city: { type: "string", examples: ["São Paulo" ]},
            state: { type: "string", examples: ["SP" ]},
            complement: { type: "string", examples: ["Apto 101"] },
            userId: { type: "string", examples: ["90c1c791-4cf5-43d3-98b7-d59a943805eb" ]}
          }
           
        },
        400: {
          description: "Erro na requisição",
          type: "object",
          properties: {
            error: { type: "string" }
          },
          examples: [
            { error: "Cabeçalho 'email' ausente ou inválido" },
            { error: "CEP inválido ou não encontrado" }
          ]
        }
      }
    }
  },
     async (req: FastifyRequest<{ Body: ContactCreate, Headers: { email: string } }>, reply: FastifyReply) => {
      const { name, email, phone, cep, number, complement } = req.body;
      const emailUserHeader = req.headers["email"];

      if (!emailUserHeader || Array.isArray(emailUserHeader)) {
        return reply
          .status(400)
          .send({ error: "Cabeçalho 'email' ausente ou inválido" });
      }

      const emailUser = emailUserHeader as string;

      try {
        const data = await contactUseCase.create({
          email,
          name,
          phone,
          cep,
          number,
          complement,
          userEmail: emailUser,
        });
        return reply.status(201).send(data);;
      } catch (error) {
        reply.send(error);
      }
    }
  );

  fastify.get(
    "/",
    {
      schema: {
        tags: ["contacts"],
        summary: "Lista todos os contatos",
        description: "Retorna os contatos do usuário autenticado com endereços completos",
        headers: {
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              format: "email",
              examples: ["usuario_logado@empresa.com"]
            },
          },
        },
        response: {
          200: {
            description: "Lista de contatos",
            type: "array",
            items: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  examples: ["660e8400-e29b-41d4-a716-446655440000"]
                },
                name: { 
                  type: "string", 
                  examples: ["Maria Souza"]
                },
                email: { 
                  type: "string", 
                  examples: ["maria@contato.com"]
                },
                phone: { 
                  type: "string", 
                  examples: ["11987654321"]
                },
                cep: {
                  type: "string",
                  examples: ["01001000"]
                },
                street: {
                  type: "string",
                  examples: ["Praça da Sé"]
                },
                number: {
                  type: "string",
                  examples: ["150"]
                },
                district: {
                  type: "string",
                  examples: ["Sé"]
                },
                city: {
                  type: "string",
                  examples: ["São Paulo"]
                },
                state: {
                  type: "string",
                  examples: ["SP"]
                },
                complement: {
                  type: "string",
                  examples: ["Apto 101"]
                }
              },
            },
          },
          404: {
            description: "Usuário não encontrado",
            type: "object",
            properties: {
              error: {
                type: "string",
                examples: ["User not found"]
              },
            },
          },
        },
      },
    },
    async (req, reply) => {
      const emailUserHeader = req.headers["email"];

      if (!emailUserHeader || Array.isArray(emailUserHeader)) {
        return reply
          .status(400)
          .send({ error: "Cabeçalho 'email' ausente ou inválido" });
      }

      const emailUser = emailUserHeader as string;

      try {
        const data = await contactUseCase.listAllContacts(emailUser);
        return reply.status(200).send(data);;
      } catch (error) {
        reply.send(error);
      }
    }
  );

  fastify.put<{ Body: Contact, Params: { id: string },Headers: { email: string }}>(
    "/:id",
    {
      schema: {
        tags: ["contacts"],
        summary: "Atualiza um contato",
        description: "Edita os dados de um contato existente, incluindo endereço (se CEP for alterado)",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              examples: ["660e8400-e29b-41d4-a716-446655440000"]
            },
          },
        },
        body: {
          type: "object",
          required: ["name", "email", "phone"],
          properties: {
            name: { 
              type: "string", 
              examples: ["Maria Souza Costa"]
            },
            email: {
              type: "string",
              format: "email",
              examples: ["maria.nova@contato.com"]
            },
            phone: { 
              type: "string", 
              examples: ["11999998888"]
            },
            cep: {
              type: "string",
              pattern: "^\\d{5}-?\\d{3}$",
              examples: ["01001000"]
            },
            number: {
              type: "string",
              examples: ["200"]
            },
            complement: {
              type: "string",
              examples: ["Apto 201"]
            }
          },
        },
        response: {
          200: {
            description: "Contato atualizado",
            type: "object",
            properties: {
              id: {
                type: "string",
                examples: ["660e8400-e29b-41d4-a716-446655440000"]
              },
              name: { 
                type: "string", 
                examples: ["Maria Souza Costa"]
              },
              email: { 
                type: "string", 
                examples: ["maria.nova@contato.com"]
              },
              phone: { 
                type: "string", 
                examples: ["11999998888"]
              },
              cep: {
                type: "string",
                examples: ["01001000"]
              },
              street: {
                type: "string",
                examples: ["Praça da Sé"]
              },
              number: {
                type: "string",
                examples: ["200"]
              },
              district: {
                type: "string",
                examples: ["Sé"]
              },
              city: {
                type: "string",
                examples: ["São Paulo"]
              },
              state: {
                type: "string",
                examples: ["SP"]
              },
              complement: {
                type: "string",
                examples: ["Apto 201"]
              }
            },
          },
          404: {
            description: "Contato não encontrado",
            type: "object",
            properties: {
              error: {
                type: "string",
                examples: ["Contact not found"]
              },
            },
          },
        },
      },
    },
    async (req: FastifyRequest<{ Body: Contact, Params: { id: string }, Headers: { email: string } }>, reply: FastifyReply) => {
      const { id } = req.params;
      const { name, email, phone, cep, number, complement } = req.body;
      try {
      const data: Partial<Contact> = await contactUseCase.updateContact({
        id,
        name,
        email,
        phone,
        cep,
        street: "",       
        number,
        district: "",     
        city: "",         
        state: "",        
        complement
      });
        return reply.status(201).send(data);;
      } catch (error) {
        reply.send(error);
      }
    }
  );

  fastify.delete<{ Params: { id: string } }>(
    "/:id",
    {
      schema: {
        tags: ["contacts"],
        summary: "Remove um contato",
        description: "Deleta um contato existente",
        params: {
          type: "object",
          required: ["id"],
          properties: {
            id: {
              type: "string",
              examples: ["660e8400-e29b-41d4-a716-446655440000"]
            },
          },
        },
        response: {
          200: {
            description: "Confirmação de exclusão",
            type: "object",
            properties: {
              success: {
                type: "boolean",
                examples: [{
                  value: true
                }]
              },
              message: {
                type: "string",
                examples: ["Contact deleted"]
              },
            },
          },
          404: {
            description: "Contato não encontrado",
            type: "object",
            properties: {
              error: {
                type: "string",
                examples: ["Contact not found"]
              },
            },
          },
        },
      },
    },
    async (req, reply) => {
      const { id } = req.params;

      try {
        const data = await contactUseCase.delete(id);
        return reply.status(200).send(data);;
      } catch (error) {
        reply.send(error);
      }
    }
  );
}