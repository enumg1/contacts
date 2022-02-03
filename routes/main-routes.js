const { ObjectID } = require('bson');
const {Router} = require('express');
const { Mongoose } = require('mongoose');
const contact = require('../models/contact');
const routes = Router();
const Contact = require('../models/contact');

routes.get('/contact/:id', async (req, res) => {
    const r = await Contact.findContactById(req.params.id);
    if(!r.e) {
        if(r.r)
            return res.json({success: true, contact: r.r});

        return res.status(404).json({success: false});
    }
    return res.status(500).json({success: false});
});

routes.get('/contacts/', async (req, res) => {
    const r = await Contact.findContacts(req.query);
    if(r.r)
        return res.json({success: true, contacts: r.r});
    return res.status(500).json({success: false});
});

routes.post('/contacts/', async (req, res) => {
    const r = await Contact.insertContacts(req.body);
    if(r.r)
        return res.json({success: true, response: r.r});
    return res.status(400).json({success: false, error: r.e});
});

routes.put('/contacts/', async (req, res) => {
    const r = await Contact.updateContacts(req.body);
    if(r.r)
        return res.json({success: true, response: r.r});
    else if(!r.eserv)
        return res.status(400).json({success: false, response: r.e});
    return res.status(500).json({success: false});
});

routes.delete('/contacts/', async (req, res) => {
    const r = await Contact.deleteContacts(req.body);
    if(r.r)
        return res.json({success: true, response: r});
    return res.status(400).json({success: false, e: r.e});
});

module.exports = routes;