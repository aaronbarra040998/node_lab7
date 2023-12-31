import Note from "../models/Note.js";
import { format } from "date-fns"; // Importa la biblioteca date-fns solo una vez al comienzo del archivo

export const renderNoteForm = (req, res) => res.render("notes/new-note");

export const createNewNote = async (req, res) => {
  const { title, description, publicationDate } = req.body; // Asegúrate de que la fecha se envíe en el cuerpo de la solicitud.

  const errors = [];
  if (!title) {
    errors.push({ text: "Please Write a Title." });
  }
  if (!description) {
    errors.push({ text: "Please Write a Description" });
  }

  if (errors.length > 0) {
    return res.render("notes/new-note", {
      errors,
      title,
      description,
    });
  }

  const newNote = new Note({
    title,
    description,
    publicationDate, // Asigna la fecha de publicación desde la solicitud.
  });

  newNote.user = req.user.id;

  try {
    await newNote.save();
    req.flash("success_msg", "Note Added Successfully");
    res.redirect("/notes");
  } catch (error) {
    console.error(error);
    req.flash("error_msg", "An error occurred while adding the note.");
    res.redirect("/notes");
  }
};

export const renderNotes = async (req, res) => {
  const notes = await Note.find({ user: req.user.id })
    .select('title description createdAt')
    .sort({ createdAt: "desc" })
    .lean();

  // Formatea la fecha de creación en el formato deseado (año-mes-día)
  notes.forEach((note) => {
    note.createdAt = format(note.createdAt, "yyyy-MM-dd");
  });

  res.render("notes/all-notes", { notes });
};

export const renderEditForm = async (req, res) => {
  const note = await Note.findById(req.params.id).lean();
  if (note.user != req.user.id) {
    req.flash("error_msg", "Not Authorized");
    return res.redirect("/notes");
  }
  res.render("notes/edit-note", { note });
};

export const updateNote = async (req, res) => {
  const { title, description } = req.body;
  await Note.findByIdAndUpdate(req.params.id, { title, description });
  req.flash("success_msg", "Note Updated Successfully");
  res.redirect("/notes");
};

export const deleteNote = async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  req.flash("success_msg", "Note Deleted Successfully");
  res.redirect("/notes");
};
