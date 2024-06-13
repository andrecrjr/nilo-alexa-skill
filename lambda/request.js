'use strict';
const axios = require("axios")
const apiBase = axios.create({ baseURL: "https://2e54-179-70-50-192.ngrok-free.app" })

const getUserAuth = async (accessToken) => {
    const { data } = await apiBase.get("/users/profile", {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    })
    return data;
}

const getDynamicStatusSlotHistory = async (accessToken) => {
    try {
        const { data } = await apiBase.get("/contenttype", {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        })
        return data
    } catch (error) {
        console.log("error", error)
    }
}

// // Função para encontrar o ID do item pelo nome
// const findItemIdByName = async (itemName) => {
//     // Substitua com a lógica para buscar o ID baseado no nome
//     // Exemplo: Busca na base de dados ou API
//     try {
//         const response = await database.findItemByName(itemName);
//         if (response && response.id) {
//             return response.id;
//         } else {
//             return null; // Nenhum item encontrado
//         }
//     } catch (error) {
//         console.error('Erro ao buscar o item:', error);
//         return null;
//     }
// };

const updateCollectionStatus = async (accessToken, queryContentSlot, status) => {
    try {
        // Primeiro, buscamos o ID usando o valor do slot 'queryContentSlot'
        const searchResponse = await apiBase.get(`/collection/search?q=${queryContentSlot}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });
        const { id } = searchResponse.data; // Assumindo que a resposta contém um objeto 'data' com a propriedade 'id'

        // Em seguida, usamos o ID obtido para atualizar o status na coleção
        const updateResponse = await apiBase.patch(`/collection/page`, {
            id,
            currentStatusTrack: status
        }, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });
        const data = updateResponse.data; // Assumindo que a resposta contém um objeto 'data' com as informações atualizadas

        return data; // Retornamos os dados atualizados
    } catch (error) {
        console.error("error", error);
        throw new Error(error); // Lançamos o erro para ser tratado por quem chamou a função
    }
}


module.exports = {
    getUserAuth,
    getDynamicStatusSlotHistory,
    updateCollectionStatus
}