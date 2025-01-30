// ==Penguin==
// @name         PenGuin API: Scheduled Messages
// @namespace    https://discord.com
// @version      1.0
// @description  A BetterDiscord plugin to schedule messages for future sending, including server and channel selection.
// @author       Rotes
// @match        *://discord.com/*
// @grant        none
// ==/Penguin==

(function() {
    'use strict';

    const fs = require('fs');

    function init() {
        createScheduledMessagePanel();
        checkScheduledMessages();
    }

    function createScheduledMessagePanel() {
        const panel = document.createElement('div');
        panel.id = 'scheduled-messages-panel';
        panel.style.position = 'fixed';
        panel.style.bottom = '20px';
        panel.style.right = '20px';
        panel.style.padding = '10px';
        panel.style.backgroundColor = '#2f3136';
        panel.style.color = 'white';
        panel.style.borderRadius = '8px';
        panel.style.boxShadow = '0px 4px 10px rgba(0, 0, 0, 0.5)';
        panel.innerHTML = `
            <h3>PenGuin API: Scheduled Messages</h3>
            <button id="create-message-button">Create Message</button>
            <ul id="scheduled-messages-list"></ul>
        `;
        document.body.appendChild(panel);

        document.getElementById('create-message-button').addEventListener('click', () => {
            showCreateMessageForm();
        });

        loadScheduledMessages();
    }

    function showCreateMessageForm() {
        const form = document.createElement('div');
        form.id = 'create-message-form';
        form.style.position = 'fixed';
        form.style.top = '20%';
        form.style.left = '50%';
        form.style.transform = 'translateX(-50%)';
        form.style.padding = '20px';
        form.style.backgroundColor = '#2f3136';
        form.style.color = 'white';
        form.style.borderRadius = '8px';
        form.style.boxShadow = '0px 4px 10px rgba(0, 0, 0, 0.5)';
        form.innerHTML = `
            <h3>Create Scheduled Message</h3>
            <textarea id="message-content" placeholder="Enter your message here..." style="width: 100%; height: 80px; padding: 10px; background-color: #3b3f47; color: white;"></textarea><br><br>
            <label for="message-time">Time (yyyy-mm-dd hh:mm):</label>
            <input type="text" id="message-time" placeholder="2025-01-30 20:00" style="width: 100%; padding: 10px; background-color: #3b3f47; color: white;" />
            <br><br>
            <label for="message-server">Select Server:</label>
            <select id="message-server" style="width: 100%; padding: 10px; background-color: #3b3f47; color: white;">
                <option value="">--Select Server--</option>
            </select>
            <br><br>
            <label for="message-channel">Select Channel:</label>
            <select id="message-channel" style="width: 100%; padding: 10px; background-color: #3b3f47; color: white;">
                <option value="">--Select Channel--</option>
            </select>
            <br><br>
            <button id="save-message-button">Save Message</button>
            <button id="cancel-button">Cancel</button>
        `;
        document.body.appendChild(form);

        populateServers();

        document.getElementById('save-message-button').addEventListener('click', () => {
            const content = document.getElementById('message-content').value;
            const time = document.getElementById('message-time').value;
            const serverId = document.getElementById('message-server').value;
            const channelId = document.getElementById('message-channel').value;
            saveScheduledMessage(content, time, serverId, channelId);
            form.remove();
        });

        document.getElementById('cancel-button').addEventListener('click', () => {
            form.remove();
        });

        document.getElementById('message-server').addEventListener('change', (e) => {
            updateChannels(e.target.value);
        });
    }

    function populateServers() {
        const servers = getServers();
        const serverSelect = document.getElementById('message-server');
        servers.forEach(server => {
            const option = document.createElement('option');
            option.value = server.id;
            option.textContent = server.name;
            serverSelect.appendChild(option);
        });
    }

    function updateChannels(serverId) {
        const channels = getChannelsByServer(serverId);
        const channelSelect = document.getElementById('message-channel');
        channelSelect.innerHTML = '<option value="">--Select Channel--</option>';

        channels.forEach(channel => {
            const option = document.createElement('option');
            option.value = channel.id;
            option.textContent = channel.name;
            channelSelect.appendChild(option);
        });
    }

    function saveScheduledMessage(content, time, serverId, channelId) {
        const scheduledMessage = {
            content: content,
            time: time,
            serverId: serverId,
            channelId: channelId
        };

        const messages = JSON.parse(localStorage.getItem('scheduledMessages') || '[]');
        messages.push(scheduledMessage);
        localStorage.setItem('scheduledMessages', JSON.stringify(messages));

        loadScheduledMessages();
    }

    function loadScheduledMessages() {
        const messages = JSON.parse(localStorage.getItem('scheduledMessages') || '[]');
        const list = document.getElementById('scheduled-messages-list');
        list.innerHTML = '';

        messages.forEach((message, index) => {
            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <strong>Message:</strong> ${message.content} <br>
                <strong>Time:</strong> ${message.time} <br>
                <strong>Server:</strong> ${message.serverId} <br>
                <strong>Channel:</strong> ${message.channelId} <br>
                <button onclick="removeScheduledMessage(${index})">Remove</button>
            `;
            list.appendChild(listItem);
        });
    }

    function removeScheduledMessage(index) {
        const messages = JSON.parse(localStorage.getItem('scheduledMessages') || '[]');
        messages.splice(index, 1);
        localStorage.setItem('scheduledMessages', JSON.stringify(messages));
        loadScheduledMessages();
    }

    function checkScheduledMessages() {
        setInterval(() => {
            const currentTime = new Date();
            const messages = JSON.parse(localStorage.getItem('scheduledMessages') || '[]');

            messages.forEach((message, index) => {
                const scheduledTime = new Date(message.time);
                if (scheduledTime <= currentTime) {
                    sendMessageToChannel(message.content, message.serverId, message.channelId);
                    messages.splice(index, 1);
                }
            });

            localStorage.setItem('scheduledMessages', JSON.stringify(messages));
        }, 60000);
    }

    function sendMessageToChannel(content, serverId, channelId) {
        const server = getServerById(serverId);
        const channel = server.channels.find(c => c.id === channelId);
        if (channel) {
            channel.send(content);
        }
    }

    function getServers() {
        // Real API call to get servers, for now it is mocked
        return [
            { id: 'server1', name: 'Server 1' },
            { id: 'server2', name: 'Server 2' }
        ];
    }

    function getChannelsByServer(serverId) {
        // Real API call to get channels based on serverId
        if (serverId === 'server1') {
            return [
                { id: 'channel1', name: 'General', hasPermission: true },
                { id: 'channel2', name: 'Announcements', hasPermission: false }
            ];
        } else {
            return [
                { id: 'channel3', name: 'Chat', hasPermission: true },
                { id: 'channel4', name: 'News', hasPermission: true }
            ];
        }
    }

    const config = require('./PenGuinAPI.config.js');

    if (config.serverID) {
    console.log("Server: " + config.serverID);
    } else {
    console.log("Not found server.");
    }
 

    function getServerById(serverId) {
        // Get server data based on the serverId
        return {
            id: serverId,
            channels: getChannelsByServer(serverId).filter(channel => channel.hasPermission)
        };
    }

    init();
})();
