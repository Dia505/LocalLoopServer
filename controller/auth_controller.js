const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET_KEY = process.env.SECRET_KEY;
const EventExplorer = require("../model/event_explorer");
const EventOrganizer = require("../model/event_organizer");

const login = async (req, res) => {
  const { email, password } = req.body;

  let cred = await EventExplorer.findOne({ email }) 
            || await EventOrganizer.findOne({ email });

  if (!cred) {
    return res.status(403).json({ field: "email", message: "Incorrect email address" });
  }

  const isMatch = await bcrypt.compare(password, cred.password);
  if (!isMatch) {
    return res.status(403).json({ field: "password", message: "Incorrect password" });
  }

  const token = jwt.sign(
    { id: cred._id, email: cred.email, role: cred.role },
    SECRET_KEY,
    { expiresIn: "1h" }
  );

  res.json({
    token,
    role: cred.role,
    userId: cred._id, 
  });
};

module.exports = { login };