const { expect } = require('chai');
const sinon = require('sinon');

const UsersData = require('../../../data/users.data');
const User = require('../../../models/user');

describe('UsersData', () => {
    const db = {
        collection: () => { },
    };

    let users = [];
    let validator = {
        isValidUser: (userObj) => {
            return true;
        },
    };
    let data = null;
    const events = [{ title: 'Some event' }];
    const foundUsers = [{
        _id: '596b2a0ae6239d22044adb29',
        username: 'user1',
        password: '234567',
    }];

    const toArray = () => {
        return Promise.resolve(foundUsers);
    };
    const find = (user) => {
        return {
            toArray,
        };
    };

    const insertOne = (user) => {
        users.push(user);
    };

    const foundUser = { username: 'user', password: '123456', events: events };
    const findOne = (user) => {
        return Promise.resolve(foundUser);
    };
    const newEvent = { title: 'New event' };
    const update = (userObj) =>{
        users[0].events.push(newEvent);
    };
    beforeEach(() => {
        users = [{
            _id: '596b1d2cfef2e82704d679e4',
            username: 'user',
            password: '123456',
            events: events,
        },
        {
            _id: '596b2a0ae6239d22044adb29',
            username: 'user1',
            password: '234567',
        }];

        sinon.stub(db, 'collection')
            .callsFake(() => {
                return { findOne, find, insertOne, update };
            });

        data = new UsersData(db, validator);
    });

    afterEach(() => {
        db.collection.restore();
    });

    describe('getUserByPattern()', () => {
        it('expect to return users if users were found', () => {
            return data.getUserByPattern('r1')
                .then((found) => {
                    expect(found).to.deep.equal(foundUsers);
                });
        });
        it('expect to return null if users were not found', () => {
            return data.getUserByPattern('te')
                .then((user) => {
                    expect(user).to.deep.equal(foundUsers);
                });
        });
    });

    describe('getUser()', () => {
        it('expect to return user if user was found', () => {
            return data.getUser('user')
                .then((user) => {
                    expect(user).to.deep.equal(foundUser);
                });
        });

        it('expect to return empty object if user was not found', () => {
            const found = data.getUser('test');
            expect(found).to.be.empty;
        });
    });

    describe('getUserById()', () => {
        it('expect to return user if user was found', () => {
            return data.getUserById('596b1d2cfef2e82704d679e4')
                .then((user) => {
                    expect(user).to.deep.equal(foundUser);
                });
        });

        it('expect to return null if user was not found', () => {
            const found = data.getUserById('59765842ec26b73928903cb8');
            expect(found).to.be.empty;
        });
    });

    describe('login()', () => {
        it('expect to return user if user was found', () => {
            return data.login('user', '123456')
                .then((user) => {
                    expect(user).to.deep.equal(foundUser);
                });
        });

        it('expect to return empty object username does not match', () => {
            const found = data.login('test', '123456');
            expect(found).to.be.empty;
        });

        it('expect to return empty object password does not match', () => {
            const found = data.login('user', '1521');
            expect(found).to.be.empty;
        });
    });

    describe('create()', () => {
        it('expect to create user if isValidUser returns true', () => {
            const userToCreate = {
                username: 'testUser',
                password: '123456',
            };

            data.create(userToCreate);
            expect(users).to.deep.include(new User(userToCreate));
        });

        it('expect not to create user if isValidUser returns false', () => {
            validator = {
                isValidUser: (userObj) => {
                    return false;
                },
            };
            const userToCreate = {
                username: 'test',
                password: '123456',
            };
            data.create(userToCreate);

            expect(users).to.deep.include(new User(userToCreate));
        });
    });

    describe('getEvents()', () => {
        it('expect to return user\'s events', () => {
            data.getEvents('user1')
                .then((foundEvents) => {
                    expect(foundEvents).to.be.deep.equal(events);
                });
        });
    });

    describe('addEventToUser()', () => {
        it('expect add new event to user\'s list of events', () => {
            data.addEventToUser('user', newEvent);
            expect(users[0].events).to.deep.include(newEvent);
        });
    });
});
