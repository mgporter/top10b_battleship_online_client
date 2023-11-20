const EventEmitter = {
  eventList: {},

  dispatch(event, data) {
    if (!this.eventList[event]) return;
    Object.values(this.eventList[event]).forEach((callback) => {
      callback(data);
    });
  },

  subscribe(event, id, callback) {
    if (!this.eventList[event]) this.eventList[event] = {};
    this.eventList[event][id] = callback;
    // console.log(`EVENT EMITTER: sub to ${event} with id ${id}`);
  },

  unsubscribe(event, id) {
    if (!this.eventList[event]) return;
    delete this.eventList[event][id];
    // console.log(`EVENT EMITTER: unSub to ${event} with id ${id}`);
  }
}

export default EventEmitter;