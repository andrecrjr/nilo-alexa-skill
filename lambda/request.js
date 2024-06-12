'use strict';
const axios = require("axios")
const apiBase = axios.create({ baseURL: "https://2e54-179-70-50-192.ngrok-free.app" })

const getUserAuth = async (accessToken) => {
    const data = await apiBase.get("/users/profile", {
        headers: {
            "Authorization": `Bearer ${accessToken}`
        }
    })
    return data;
}

module.exports = {
    getUserAuth
}