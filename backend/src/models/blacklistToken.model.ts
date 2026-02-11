import mongoose from "mongoose";

/**
 * BlacklistToken Schema
 * 
 * This model stores invalidated JSON Web Tokens (JWTs) to prevent their reuse
 * after a user logs out or when a token has been compromised.
 * 
 * TTL Index:
 * The `createdAt` field utilizes MongoDB's TTL (Time To Live) index. Documents
 * are automatically deleted by MongoDB after 24 hours (86400 seconds), 
 * matching the typical maximum lifespan of an access token.
 */

const blacklistTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 86400 // 24 hours in seconds 
    }
})

const blacklistToken = mongoose.model("blacklistToken", blacklistTokenSchema)

export default blacklistToken
