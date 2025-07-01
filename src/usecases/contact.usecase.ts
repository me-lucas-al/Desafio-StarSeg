import axios from "axios";
import { Contact, ContactCreate, ContactRepository } from "../interfaces/contacts.interface";
import { ContactsRepositoryPrisma } from "../repositories/contacts.repository";
import { UserRepositoryPrisma } from "../repositories/user.repository";

class ContactUseCase {
    private contactRepository: ContactRepository;
    private userRepository: UserRepositoryPrisma;
    constructor(){
        this.contactRepository = new ContactsRepositoryPrisma();
        this.userRepository = new UserRepositoryPrisma();
    }

private async getAddressByCEP(cep: string) {
  try {
    const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`);
    if (response.data.erro) throw new Error('CEP não encontrado');
    return response.data;
  } catch (error) {
    throw new Error('Falha ao buscar CEP: ' + (error as Error).message);
  }
}

async create({email, name, phone, cep, number, complement, userEmail}: ContactCreate) {
    const user = await this.userRepository.findByEmail(userEmail);
    if (!user) throw new Error("User not found");

    const contactExists = await this.contactRepository.findByEmailOrPhone(email, phone);
    if (contactExists) throw new Error("Contact already exists");

    const viaCEP = await this.getAddressByCEP(cep);

    return this.contactRepository.create({
        email,
        name,
        phone,
        cep,
        street: viaCEP.logradouro,
        number,
        district: viaCEP.bairro,
        city: viaCEP.localidade,
        state: viaCEP.uf,
        complement,
        userId: user.id,
    });
}
    async listAllContacts(userEmail: string) {
        const user = await this.userRepository.findByEmail(userEmail);

        if(!user) {
            throw new Error('User not found');
        }

        const contacts = await this.contactRepository.findAllContacts(user.id);

        return contacts;
    }

    async updateContact({id, name, email, phone}: Contact){
        const data = await this.contactRepository.updateContact({id, name, email, phone});

        return data;
    }

    async delete(id: string) {
        const data = await this.contactRepository.delete(id);

        return data;
    }
}

export { ContactUseCase };