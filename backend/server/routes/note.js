const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const {authorizeRole} = require('../middleware/authMiddleware');

router.get("/all",authorizeRole("owner"), async (req, res) => {
    try {
        const notes = await Note.find().sort({createdAt:-1}) ;
        if(notes.length === 0 || !notes){
            return res.status(404).json({message:"No Notes Found"}) ;
        }
        return res.status(200).json(notes) ;
    }catch(error){
        return res.status(500).json(error) ;
    }
    
});

router.post('/add',authorizeRole("owner"), async (req, res, next) => {
    try {
      const { title, type, description } = req.body;
  
      if (!title || !type || !description) {
        return res.status(400).json({ message: 'All fields are required' });
      }
  
      const newNote = await Note.create({ title, type, description });
      res.status(201).json(newNote); // Return the created note
    } catch (error) {
      next(error);
    }
});
router.delete('/delete/:id',authorizeRole("owner"), async (req, res, next) => {
    try {
      const { id } = req.params;
      const deletedNote = await Note.findByIdAndDelete(id);
  
      if (!deletedNote) {
        return res.status(404).json({ message: 'Note not found' });
      }
  
      res.status(200).json({ message: 'Note deleted successfully', deletedNote });
    } catch (error) {
      next(error);
    }
});
router.put('/update/:id',authorizeRole("owner"), async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, type, description } = req.body;
  
      const updatedNote = await Note.findByIdAndUpdate(
        id,
        { title, type, description },
        { new: true, runValidators: true } // Return the updated document
      );
  
      if (!updatedNote) {
        return res.status(404).json({ message: 'Note not found' });
      }
  
      res.status(200).json(updatedNote);
    } catch (error) {
      next(error);
    }
});


  module.exports = router;