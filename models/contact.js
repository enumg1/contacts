const {Schema, model} = require('mongoose');
const { ObjectID } = require('bson');

const schema = new Schema({
    name: {
        type: String,
        required: true
    },
    city: {
        type: String,
        default: ''
    },
    company: {
        type: String,
        default: ''
    },
    position: {
        type: String,
        default: ''
    },
    phone: {
        type: String,
        required: true
    },
    group: {
        type: String,
        default: ''
    },
    image: {
        type: String,
        default: ''
    }
});

class ContactClass {
    static incorrect = "Invalid parameters";
    static async findContactById(id) {
        if(ObjectID.isValid(id)) {
            try {
                const c = await this.findById(id);
                if(c)
                    return {r: c};
            } catch(err) {
                return {e: err.message};
            }
        } 
        return {r: null};
    }

    static async findContacts(query) {
        const q = {};

        if(query.city) 
            q.city = query.city;
        else if(query.company)
            q.company = query.company;
        else if(query.group)
            q.group = query.group;
        else if(parseInt(query.duplicates) == 1)
            q.dup = [
                {
                    $group: {
                        _id: "$phone",
                        "dup_ids": {
                            "$push": "$_id"
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $match: {
                        count: { $gt: 1 }
                    }
                }
            ];
        
        try {
            const cs = !q.dup ? await this.find(q) : await this.aggregate(q.dup);
            return {r: !q.dup ? cs : cs.map( c => ({phone: c._id, dup_ids: c.dup_ids, count: c.count}) )};
        } catch(err) {
            return {e: err.message};
        }
    }

    static async insertContacts(params) {
        if(Array.isArray(params.contacts)) {
            try {
                const r = await this.insertMany(params.contacts);
                return {r: r.map(el => el._id)};
            } catch(err) {
                return {e: err.message};
            }
        } else if(typeof params.contact == 'object' && params.contact !== null) {
            const c = new this(params.contact);
            try{
                const r = await c.save();
                return {r: r._id};
            } catch(err) {
                return {e: err.message};
            }
        }
        return {e: this.incorrect};
    }

    static async updateContacts(params) {
        if(Array.isArray(params.contacts)) {
            const cs = params.contacts.filter(c => ObjectID.isValid(c._id) && (c.name || !c.hasOwnProperty('name')) && (c.phone || !c.hasOwnProperty('phone')));
            if(cs.length) {
                try {
                    const r = await this.bulkWrite(cs.map((c) => {
                        const {_id, ...props} = c;
                        return {
                            updateOne: {
                                filter: {'_id': _id},
                                update: props
                            }
                        };
                    }));
    
                    return {r: r};
                } catch(err) {
                    return {e: err.message, eserv: true};
                }
            }
        } else if(typeof params.contact == 'object' && params.contact !== null) {
            const {_id, ...props} = params.contact;
            if(ObjectID.isValid(_id) && (props.name || !props.hasOwnProperty('name')) && (props.phone || !props.hasOwnProperty('phone'))) {
                try {
                    const r = await this.updateOne({'_id': _id}, { $set: props });
                    return {r: r};
                } catch(err) {
                    return {e: err.message, eserv: true};
                }
            }
        }
        return {e: this.incorrect};
    }

    static async deleteContacts(params) {
        if(Array.isArray(params.contact_ids)) {
            const cs = params.contact_ids.filter(c => ObjectID.isValid(c));
    
            try {
                const r = await this.deleteMany( { '_id': { $in: cs } } );
                return {r: r};
            } catch(err) {
                return {e: err.message};
            }
        } else if(ObjectID.isValid(params.contact_id)) {
            try {
                const r = await this.deleteOne({'_id': params.contact_id});
                return {r: r};
            } catch(err) {
                return {e: err.message};
            }
        }
        return {e: this.incorrect};
    }
}

schema.loadClass(ContactClass);

module.exports = model('Contact', schema);