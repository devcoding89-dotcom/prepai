import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const seedTsPath = path.join(process.cwd(), "src", "lib", "db", "seed.ts");
const dbPath = path.join(process.cwd(), "data", "db.json");

const content = fs.readFileSync(seedTsPath, "utf8");

// Extract the Q array from seed.ts
const qMatch = content.match(/const Q: QTuple\[\] = (\[[\s\S]*?\n\];)/);
if (!qMatch) {
  console.error("Could not find Q array in seed.ts");
  process.exit(1);
}

// Safely evaluate the Q array
const Q = eval(qMatch[1]);

const db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
const ts = new Date().toISOString();

const qList = Q.map(([exam, subject, topic, question_text, options, correct_answer, explanation, difficulty, year]) => ({
  id: crypto.randomUUID(),
  exam,
  subject,
  topic,
  question_text,
  options,
  correct_answer,
  explanation,
  difficulty,
  year,
  image_url: null,
  is_active: true,
  created_at: ts,
}));

db.questions = qList;

// Extract textbook chapters
const chapters = [];
const chapterRegex = /chapter\(\s*"([^"]+)",\s*"([^"]+)",\s*"([^"]+)",\s*([0-9]+),\s*"([^"]+)",\s*(\[[^\]]+\]),\s*"([^"]+)",\s*`([\s\S]*?)`\s*\)/g;
let match;
while ((match = chapterRegex.exec(content)) !== null) {
  const [_, exam, subject, book_title, chapter_num, title, tagsRaw, description, body] = match;
  let topic_tags = [];
  try {
    topic_tags = eval(tagsRaw);
  } catch {
    topic_tags = [title];
  }
  chapters.push({
    id: crypto.randomUUID(),
    exam,
    subject,
    book_title,
    chapter_number: parseInt(chapter_num, 10),
    title,
    topic_tags,
    description,
    content_html: body,
    file_path: null,
    page_count: null,
    is_published: true,
    created_at: ts,
  });
}

if (chapters.length > 0) {
  const existingUploaded = (db.textbooks || []).filter((t) => t.file_path);
  db.textbooks = [...chapters, ...existingUploaded];
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log(`✅ Successfully seeded db.json!\n   Questions: ${db.questions.length}\n   Textbooks: ${db.textbooks.length}`);
