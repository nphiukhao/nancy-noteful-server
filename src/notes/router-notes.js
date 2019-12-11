const path = require('path')
const express = require('express');
const notesRouter = express.Router();
const jsonParser = express.json();
const NotesService = require('./service-notes');

notesRouter
    .route('/')
    .get((req, res, next) => {
        const knexInstance = req.app.get('db');
        NotesService.getAllNotes(knexInstance)
            .then(notes => res.json(notes))
            //.then(result => console.log(result))
            .catch(next)

    })
    .post(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db');
        const { note_title, note_content, folder_id } = req.body;
        const newNote = { note_title, note_content, folder_id } //folder_id is optional
        const required = { note_title, note_content }

        for (const [key, value] of Object.entries(required))
            if (value == null)
                return res.status(400).json({
                    error: { message: `Missing '${key}' in request body` }
                })

        NotesService.insertNote(knexInstance, newNote)
            .then(note => {
                res.status(201).location(path.posix.join(req.originalUrl, `/${note.id}`))
                    .json(note)

            })
            // .then(result => console.log(result))
            .catch(next)
    })

notesRouter
    .route('/:notes_id')
    .all((req, res, next) => {
        const knexInstance = req.app.get('db');
        NotesService.getById(knexInstance, req.params.notes_id)
            .then(note => {
                if (!note) {
                    return res.status(404).json({
                        error: { message: 'Note does not exist' }
                    })
                }
                res.note = note;
                next()
            })
            .catch(next)
    })

    .get((req, res, next) => {
        res.json(res.note)
    })

    .delete((req, res, next) => {
        const knexInstance = req.app.get('db');
        NotesService.deleteNote(knexInstance, req.params.notes_id)
            .then(note => {
                res.status(204).end();
            })
            .catch(next)
    })


module.exports = notesRouter;