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
        console.log("data contenttype", data)
        return data
    } catch (error) {
        console.log("error", error)
    }
}

module.exports = {
    getUserAuth,
    getDynamicStatusSlotHistory
}