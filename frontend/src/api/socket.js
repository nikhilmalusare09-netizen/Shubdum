import SockJS from 'sockjs-client';
import Stomp from 'stompjs';

class SocketManager {
  constructor() {
    this.stompClient = null;
    this.connected = false;
    this.subscribers = new Map();
    this.reconnectTimeout = null;
  }

  connect(onConnected) {
    if (this.stompClient && this.connected) {
      if (onConnected) onConnected();
      return;
    }

    try {
      const socket = new SockJS('/ws');
      this.stompClient = Stomp.over(socket);
      this.stompClient.debug = () => {}; // quiet in console

      this.stompClient.connect({}, () => {
        this.connected = true;
        // Resubscribe existing listeners
        this.subscribers.forEach((callbacks, topic) => {
          this.subscribeToTopic(topic);
        });
        if (onConnected) onConnected();
      }, (err) => {
        this.connected = false;
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = setTimeout(() => this.connect(), 4000);
      });
    } catch (e) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = setTimeout(() => this.connect(), 4000);
    }
  }

  subscribe(topic, callback) {
    if (!this.subscribers.has(topic)) {
      this.subscribers.set(topic, new Set());
    }
    this.subscribers.get(topic).add(callback);

    if (this.connected && this.stompClient) {
      this.subscribeToTopic(topic);
    } else {
      this.connect();
    }

    // Return unsubscribe function
    return () => {
      const set = this.subscribers.get(topic);
      if (set) {
        set.delete(callback);
        if (set.size === 0) {
          this.subscribers.delete(topic);
        }
      }
    };
  }

  subscribeToTopic(topic) {
    try {
      this.stompClient.subscribe(topic, (message) => {
        try {
          const data = JSON.parse(message.body);
          const callbacks = this.subscribers.get(topic);
          if (callbacks) {
            callbacks.forEach(cb => cb(data));
          }
        } catch (e) {
          console.error("Failed to parse websocket message", e);
        }
      });
    } catch (e) {
      console.warn("Error subscribing to topic", topic, e);
    }
  }

  disconnect() {
    if (this.stompClient && this.connected) {
      this.stompClient.disconnect();
      this.connected = false;
    }
  }
}

export const socketManager = new SocketManager();

