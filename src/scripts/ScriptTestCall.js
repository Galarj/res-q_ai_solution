// ScriptTestCall.js - Handles form functionality for testcall.html

import AgoraCallService from "./AgoraCall.js";

class TestCallController {
    constructor() {
        this.forms = document.querySelectorAll('form');
        this.initializeEventListeners();
        this.agoraService = new AgoraCallService();
    }

    initializeEventListeners() {
        this.forms.forEach((form, index) => {
            const joinBtn = form.querySelector('button[value="join"]');
            const leaveBtn = form.querySelector('button[value="leave"]');
            const idInput = form.querySelector('input[name="ID"]');
            const channelInput = form.querySelector('input[name="Channel"]');

            if (joinBtn) {
                joinBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleJoin(index, idInput.value, channelInput.value);
                });
            }

            if (leaveBtn) {
                leaveBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleLeave(index);
                });
            }
        });
    }

    handleJoin(formIndex, id, channel) {
        if (!id || !channel) {
            alert('Please fill in both ID and Channel');
            return;
        }

        console.log(`Form ${formIndex + 1} - Join clicked:`, { id, channel });
        
        if (formIndex === 0) {
            // First form - Agora Call
            console.log('Joining Agora Call...', { id, channel });
            this.agoraService.joinChannel(channel, id).catch(err => alert("Failed to join Agora Call. Check console."));
        } else if (formIndex === 1) {
            // This part remains as a placeholder
            // Second form - Conversational AI
            console.log('Joining Conversational AI...');
            alert(`Joining Conversational AI\nID: ${id}\nChannel: ${channel}`);
        }
    }

    handleLeave(formIndex) {
        console.log(`Form ${formIndex + 1} - Leave clicked`);
        
        if (formIndex === 0) {
            // First form - Agora Call
            console.log('Leaving Agora Call...');
            this.agoraService.leaveChannel().catch(err => alert("Failed to leave Agora Call. Check console."));
        } else if (formIndex === 1) {
            // This part remains as a placeholder
            // Second form - Conversational AI
            console.log('Leaving Conversational AI...');
            alert('Left Conversational AI');
        }
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TestCallController();
});
