const path = require('path')
const express = require('express');
const foldersRouter = express.Router();
const FoldersService = require('./service-folders')
const jsonParser = express.json();


foldersRouter
    .route('/') //should get the notes that are in the folder
    .get((req, res, next) => {
        const knexInstance = req.app.get('db')
        
        FoldersService.getAllFolders(knexInstance)
            .then(folders => res.json(folders))
            // .then(result => console.log(result))
            .catch(next)
    })
    .post(jsonParser, (req, res, next) => {
        const knexInstance = req.app.get('db')
        const { folder_name } = req.body
        const newFolder = { folder_name };

        if(!req.body.folder_name) {
            return res.status(400).json({
                error: { message: `Missing folder name`}
            })
        }

        FoldersService.insertFolder(knexInstance, newFolder)
            .then(folder => {
                res
                    .status(201)
                    .location(path.posix.join(req.originalUrl, `/${folder.id}`))
                    .json(folder)
            })
            .catch(next)
    })

    foldersRouter
        .route('/:folder_id')
        .all((req, res, next) => {
            FoldersService.getById(
                req.app.get('db'),
                req.params.folder_id
            )
                .then(folder => {
                    if(!folder) {
                        return res.status(404).json({
                            error: {message: 'Folder not found'}
                        })
                    }
                    res.folder = folder;
                    next()
                })
                .catch(next)
        })
        .get((req, res, next) => {
            res.json(res.folder)
        })
        .delete((req, res, next) => {
            FoldersService.deleteFolder(req.app.get('db'), req.params.folder_id)
                .then(result => res.status(204).end())
                .catch(next)
        })

    module.exports = foldersRouter;