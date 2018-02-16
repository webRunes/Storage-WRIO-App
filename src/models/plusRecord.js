/**
 * Created by michbil on 18.05.17.
 */

// Persistent storage of plus data for incompatible (ios, osx) clients


module.exports = class PlusRecord {

    constructor (db) {
        this.widgets = db.collection('plusWrioApp');
    }

    async create(wrioID, data) {
        let invoice_data = {
            wrioID,
            data,
        };

        let r = await this.widgets.insertOne(invoice_data);
        return r._id;
    }

    async getRecord(wrioID) {
       return await this.get({wrioID});
    }

    async get(mask) {
        let data = await this.widgets.find(mask).sort({nonce : -1}).limit(1).toArray();
        if (!data) {
            throw new Error('Nonce not found');
        }
        return data[0];

    }

}