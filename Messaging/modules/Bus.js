/**
 * The message bus. Extracted so that the methods can later be replaced with Redis, etc.
 */
class Bus {
    constructor () {
        this.queues = {};
    }

    /**
     * Add a new queue to listen to
     * @param {string} name 
     */
    addQueue (name) {
        if (!this.queues[name]) {
            this.queues[name] = new Queue();
        }

        return this.queues[name];
    }

    /**
     * 
     * @param {string} name 
     * @param {string} address 
     */
    addSubscriber (name, address) {
        if (!this.queues[name]) {
            this.addQueue(name);
        }
        this.queues[name].addSubscriber(address);
    }

    /**
     * Add a message to a queue
     * @param {*} queueName 
     * @param {*} message 
     */
    postMessage (queueName, message) {
        if (this.queues[queueName]) this.queues[queueName].postMessage(message);
    }
}

class Queue {
    constructor () {
        this.messages = [];
        this.subscribers = [];
    }

    /**
     * Add the address of the subscriber so that we may reach them and notify
     * @param {string} address
     */
    addSubscriber (address) {
        this.subscribers.push(address);
    }

    /**
     * Remove what subscriber matches the current requested address
     * @param {string} address 
     */
    removeSubscriber (address) {
        const index = this.subscribers.indexOf(address);
        if (index > -1) this.subscribers = this.subscribers.splice(index, 1);
    }

    postMessage (message) {
        this.messages.push(message);
    }

    /**
     * Consume the message at the given index if possible by sending it out to subscribers
     * @param {number} i 
     */
    consumeMessage (i) {

    }
}

module.exports = Bus;
