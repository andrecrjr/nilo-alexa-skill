'use strict';
const axios = require("axios")
const apiBase = axios.create({ baseURL: "https://7f39-179-70-50-192.ngrok-free.app" })

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

const getSearchContentInUserCollection = async (accessToken, query) => {
    try {
        const { data } = await apiBase.get(`/collection/search?q=${query}`, {
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        })
        return data ? data[0] : null
    } catch (error) {
        console.log("error", error)
    }
}


const updateTrackingStatus = async (accessToken, id, status) => {
    try {
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
    getSearchContentInUserCollection,
    updateTrackingStatus
}