const fs = require('fs');
const path = require('path');
const express = require('express');
// const { notesArr } = require('./db/db.json');

const PORT = process.env.PORT || 3003;
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

//publish entire array to database
function publishNotes(newNotesArr) {
    fs.writeFileSync(
        path.join(__dirname, './db/db.json'),
        JSON.stringify(newNotesArr)
    );
}

//read notes from saved json file
function readNotes() {
    const data = fs.readFileSync(path.join(__dirname, './db/db.json'));
    const notesArr = JSON.parse(data);
    return notesArr;
}

//add note to array and publish
function writeNote(note) {
    const notesArr = readNotes();
    console.log(notesArr);
    console.log(note);
    notesArr.push(note);
    console.log('newnotesarray:', notesArr);
    publishNotes(notesArr);
}

//replace note that needs to be deleted with blank value and send to establish all other ids
function deleteNote(deleteId) {
    const notesArr = readNotes();
    const updatedNotes = notesArr.filter(note => note.id != deleteId);
    console.log(updatedNotes);
    publishNotes(updatedNotes);
}

//add id to new note
function idNote(note) {
    note.id = Math.random();
    return note;
}

//verify data and return as note if verified
function verifyNote(body) {
    if (!body.title || typeof body.title !== 'string') {
        return false;
    }
    if (!body.text || typeof body.text !== 'string') {
        return false;
    }
    return true;
}

//write app.get /api/notes to read db.json and return all saved notes as JSON
app.get('/api/notes', (req, res) => {
    const notesArr = readNotes();
    if (!notesArr) {
        return;
    }
    res.json(notesArr);
});

//write app.post /api/notes to receive new note, add id, add to json file, and return the note.
app.post('/api/notes', (req, res) => {
    if (!verifyNote(req.body)) {
        res.status(400).send('Your request is bad and you should feel bad');
    } else {
        const note = idNote(req.body);
        console.log("note:", note);
        writeNote(note);
        res.json(note);
    }
});

//write app.delete /api/notes/:id, read all new notes, and return new ids.  
app.delete('/api/notes/:id', (req, res) => {
    const deleteId = req.params.id;
    console.log(deleteId);
    deleteNote(deleteId);
    res.json({message:req.params.id + ' has been deleted'});
});

//write app.get /notes to return notes.html
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './public/notes.html'));
});

//write app.get * to return index.html 
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});

//listen:
app.listen(PORT, () => {
    console.log(`API server now on port ${PORT}!`);
});