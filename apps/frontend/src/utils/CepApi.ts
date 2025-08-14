// src/utils/CepApi.ts
export async function buscarEnderecoPorCep(cep: string) {
    const cepLimpo = cep.replace(/\D/g, "");
    const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
    const data = await response.json();

    if (data.erro) throw new Error("CEP não encontrado");
    return data; // logradouro, bairro, localidade, uf
}
