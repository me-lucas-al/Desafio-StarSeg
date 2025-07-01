export interface Contact {
  id: string;
  email: string;
  name: string;
  phone: string;
  cep?: string;
  street?: string;
  number?: string;
  district?: string;
  city?: string;
  state?: string;
  complement?: string | null;
  userId?: string | null;
}

export interface ContactCreate {
  email: string;
  name: string;
  phone: string;
  cep: string;
  number: string;
  complement?: string | null;
  userEmail: string;
}

export interface ContactCreateData {
  email: string;
  name: string;
  phone: string;
  cep: string;
  street: string;
  number: string;
  district: string;
  city: string;
  state: string;
  complement?: string | null;
  userId: string;
}

export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complement?: string | null;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

export interface ContactRepository {
  create(data: ContactCreateData): Promise<Contact>;
  findByEmailOrPhone(email: string, phone: string): Promise<Contact | null>;
  findAllContacts(userId: string): Promise<Contact[]>;
  updateContact({
    id,
    name,
    email,
    phone,
    cep,
    street,
    number,
    district,
    city,
    state,
    complement
  }: Contact): Promise<Contact>;
  delete(id: string): Promise<boolean>;
}
