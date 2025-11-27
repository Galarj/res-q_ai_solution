/**
 * @file This file handles the Agora Real-Time Communication (RTC) service for audio calls.
 * It provides a class `AgoraCallService` to encapsulate the logic for joining, leaving,
 * and managing an audio call channel.
 */

import AgoraRTC from "agora-rtc-sdk-ng"
import {AgoraCredentials} from "../constants/index.js";

const appID = AgoraCredentials.AGORA_APP_ID;
const token = AgoraCredentials.AGORA_APP_CERT;

/**
 * @class AgoraCallService
 * @description A service class to manage Agora RTC audio calls.
 */
class AgoraCallService{
    constructor() {
        this.client = null;
        this.localAudioTrack = null;
        this.onConnectioStatChange = null;
        this.userID = null;
    }

    _initializeClient() {
        if(!appID || !channel || !token) {
            console.error("Missing credentials");
            return;
        }

        this.client = AgoraRTC.createClient({mode: "rtc", codec: "vp8"})
        // Note: `this` context will be incorrect here. See suggestions.
        this.setupEnvironmentListeners();
    }

    /**
     * Joins an Agora channel with the provided credentials.
     * @param {string} appID - The Agora App ID.
     * @param {string} channel - The channel name to join.
     * @param {string} token - The authentication token.
     * @param {number | null} uid - The user ID.
     * @returns {Promise<void>}
     */
    async joinChannel(appID, channel, token, uid = null)
    {
        if(!this.client) {
            this._initializeClient();
        }

        try {
            const joinedUID = await this.client.join(appID, channel, token, uid);
            console.log(`User ${joinedUID} has joined the channel ${channel}`);
            this.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack({
                encoderConfig: "speech_low_quality", //Optimize voice
            });
            await this.client.publish(this.localAudioTrack);
            console.log(`Publish success! user ${uid} has successfully joined ${channel} channel.`);
        }
        catch (error) {
            if(this.localAudioTrack) {
                this.localAudioTrack.close();
                this.localAudioTrack = null;
            }

            if(this.client) {
                await this.client.leave();
                this.client = null;
            }

            console.error(error + "Failed to join the channel");
        }
    }

    /**
     * Leaves the current Agora channel.
     * @returns {Promise<void>}
     */
    async leaveChannel() {
        if(!this.client) {
            console.error("Client not initialized or already left");
            return;
        }

        try {
            if(this.localAudioTrack) {
                this.localAudioTrack.close()
                this.localAudioTrack = null;
            }

            let uid = this.client.uid;
            await this.client.leave();
            console.log(`Leave success! user ${uid} has successfully left the  channel.`)
        }
        catch (error) {
            console.error(error, "Failed to leave the channel");
        }
        finally {
            this.client=null;
        }
    }

    /**
     * Sets up listeners for Agora client events.
     * Note: This function has a `this` context issue. It should be a method of the class
     * or have the client passed to it.
     */
    setupEnvironmentListeners() {
        // Event handler for when a remote user publishes a track.
        this.client.on("user-published", async (user, mediaType) => {
            await this.client.subscribe(user, mediaType);

            if(mediaType === "audio") {
                const remoteAudioTrack = user.audioTrack;
                remoteAudioTrack.play();
            }
        });

        // Event handler for when a remote user unpublishes a track.
        this.client.on("user-unpublished", async (user, mediaType) => {
            // Logic for when a remote user unpublishes can be added here.
        });


        // Event handler for when a remote user leaves the channel.
        this.client.on("user-left", (user) => {
            console.log(`${user.uid} has left the channel`)
            if(this.remoteUsers.has(user.uid)) {
                this.remoteUsers.delete(user.uid);
            }
        })

        // Event handler for connection state changes.
        this.client.on("connection-state-change", (curState, prev, reason) => {
            this.onConnectioStatChange?.(curState)
        })
    }

}


export default AgoraCallService;


///For future Implementations
//- initialize the client onload
