const Event = require('../models/event');
const { ObjectID } = require('mongodb');

class EventsData {
    constructor(db, validator) {
        this.db = db;
        this.collection = this.db.collection('events');
        this.validator = validator;
    }

    create(eventObj) {
        if (this.validator.isValidEvent(eventObj)) {
            const newEvent = new Event(eventObj);
            this.collection.insert(newEvent);
        }
    }

    getByTitle(title) {
        return this.collection.findOne({ title: title });
    }

    getByDate(date) {
        return this.collection.find({ date: date })
            .toArray();
    }

    getAll() {
        return this.collection.find({})
            .toArray();
    }

    getById(id) {
        return this.collection.findOne({ _id: new ObjectID(id) });
    }

    getByTitlePattern(pattern) {
        return this.collection.find({
            'title': { $regex: pattern, $options: 'i' },
        }).toArray();
    }

    getUpcoming() {
        return this.collection.aggregate([
            { $sort: { date: 1 } },
            { $limit: 4 },
        ]).toArray();
    }

    update(eventTitle, date, time, place, details, photo) {
        this.collection.update(
            { title: eventTitle },
            { $set: {
                date: date,
                time: time,
                place: place,
                details: details,
                photo: photo,
            },
        }
        );
    }

    updateLikes(eventTitle, likes) {
        this.collection.update(
           { title: eventTitle },
            { $set: { likes: likes } }
        );
    }

    updatePhoto(eventTitle, photo) {
        this.collection.update(
           { title: eventTitle },
            { $set: { photo: photo } }
        );
    }

    remove(eventTitle) {
        this.collection.remove(
            { title: eventTitle }
        );
    }
}

module.exports = EventsData;
