import { prisma } from "../database/prisma-client";
import { Contact, ContactCreate, ContactCreateData, ContactRepository } from "../interfaces/contacts.interface";

class ContactsRepositoryPrisma implements ContactRepository{
    async create(data: ContactCreateData): Promise<Contact> {
    const result = await prisma.contacts.create({
        data: {
            email: data.email,
            name: data.name,
            phone: data.phone,
            cep: data.cep,
            street: data.street,
            number: data.number,
            district: data.district,
            city: data.city,
            state: data.state,
            complement: data.complement,
            userId: data.userId,
        },
    });
    return result;
}
    async findByEmailOrPhone(email: string, phone:string ): Promise<Contact | null>{
        const result = await prisma.contacts.findFirst({
            where: {
               OR: [
                {
                    email,
                },
                { phone }, 
               ],
            },
        });
        return result || null;
    }
    async findAllContacts(userId: string): Promise<Contact[]> {
        const result = await prisma.contacts.findMany({
            where: {
                userId,
            },
        });

        return result;
    }
    async updateContact({id, name, email, phone, cep, street, number, district, city, state, complement}: Contact): Promise<Contact> {
        const result = await prisma.contacts.update({
            where: {
                id, 
            },
            data: {
                email,
                name, 
                phone,
                cep,
                street,
                number, 
                district,
                city,
                state,
                complement
            },
        });
        return result;
    }
    
  async delete(id: string): Promise<boolean> {
    try {
      await prisma.contacts.delete({ where: { id } });
      return true;
    } catch {
      return false;
    }
  }
}

export { ContactsRepositoryPrisma }