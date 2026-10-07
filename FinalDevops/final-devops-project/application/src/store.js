const fs = require('fs');
const path = require('path');

// File-backed note store. DATA_DIR is a mounted PersistentVolume in Kubernetes,
// so notes survive pod restarts.
class NoteStore {
  constructor(dataDir) {
    this.dataDir = dataDir;
    this.file = path.join(dataDir, 'notes.json');
    fs.mkdirSync(dataDir, { recursive: true });
    this.notes = fs.existsSync(this.file) ? JSON.parse(fs.readFileSync(this.file, 'utf8')) : [];
  }

  persist() {
    fs.writeFileSync(this.file, JSON.stringify(this.notes));
  }

  list() {
    return this.notes;
  }

  add(text) {
    const note = { id: this.notes.length + 1, text, createdAt: new Date().toISOString() };
    this.notes.push(note);
    this.persist();
    return note;
  }

  clear() {
    this.notes = [];
    this.persist();
  }
}

module.exports = { NoteStore };
