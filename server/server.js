import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// middleware
app.use(cors());
app.use(express.json());

/* =====================
   MongoDB 連線
===================== */
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ MongoDB 連線失敗:", err));

/* =====================
   Schema (設計圖)
===================== */
const professorSchema = new mongoose.Schema({
  name: String,
  department: String,
  courses: { type: [String], default: [] },
  relatedProfessors: { type: [String], default: [] },
  photoUrl: { type: String, default: '' },
  photoHitUrl: { type: String, default: '' },
  comments: [
    {
      id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
      text: String,
      author: { type: String, default: '匿名同學' },
      courseName: String,
      date: String,
      metrics: {
        score: Number,
        sweety: Number,
        coolness: Number,
        knowledge: Number
      },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  beatenCount: { type: Number, default: 0 },
  heartCount: { type: Number, default: 0 },
  flowerCount: { type: Number, default: 0 },
  searchCount: { type: Number, default: 0 },
  avgMetrics: {
    score: { type: Number, default: 0 },
    sweety: { type: Number, default: 0 },
    coolness: { type: Number, default: 0 },
    knowledge: { type: Number, default: 0 }
  }
}, { 
  // 💡 這部分超重要：讓前端可以用 "id" 抓到資料，而不是 "_id"
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// 將 _id 虛擬對應到 id 欄位
professorSchema.virtual('id').get(function() {
  return this._id.toHexString();
});

const Professor = mongoose.model("Professor", professorSchema);

/* =====================
   Routes (路線)
===================== */

// 👉 取得全部教授
app.get("/api/professors", async (req, res) => {
  try {
    const data = await Professor.find();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👉 新增教授
app.post("/api/professors", async (req, res) => {
  try {
    const newProfessor = new Professor(req.body);
    await newProfessor.save();
    res.status(201).json(newProfessor);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👉 更新教授
app.put("/api/professors/:id", async (req, res) => {
  try {
    const updated = await Professor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👉 新增留言與自動計算平均分
app.post("/api/professors/:id/comments", async (req, res) => {
  try {
    const professor = await Professor.findById(req.params.id);

    if (!professor) {
      return res.status(404).json({ error: "Professor not found" });
    }

    const newComment = req.body;
    professor.comments.push(newComment);

    const all = professor.comments.map(c => c.metrics);

    // 💡 防止除以 0 的錯誤
    if (all.length > 0) {
      const avg = {
        score: all.reduce((s, m) => s + (m.score || 0), 0) / all.length,
        sweety: all.reduce((s, m) => s + (m.sweety || 0), 0) / all.length,
        coolness: all.reduce((s, m) => s + (m.coolness || 0), 0) / all.length,
        knowledge: all.reduce((s, m) => s + (m.knowledge || 0), 0) / all.length,
      };
      professor.avgMetrics = avg;
    }

    await professor.save();
    res.status(201).json(newComment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👉 被打次數++
app.put("/api/professors/:id/beaten", async (req, res) => {
  try {
    const professor = await Professor.findById(req.params.id);
    if (!professor) return res.status(404).json({ error: "Professor not found" });

    professor.beatenCount += 1;
    await professor.save();
    res.json({ beatenCount: professor.beatenCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👉 搜尋次數++
app.put("/api/professors/:id/search", async (req, res) => {
  try {
    const professor = await Professor.findById(req.params.id);
    if (!professor) return res.status(404).json({ error: "Professor not found" });

    professor.searchCount += 1;
    await professor.save();
    res.json({ searchCount: professor.searchCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👉 送愛心
app.put("/api/professors/:id/heart", async (req, res) => {
  try {
    const professor = await Professor.findById(req.params.id);
    if (!professor) return res.status(404).json({ error: "Professor not found" });

    professor.heartCount += 1;
    await professor.save();
    res.json({ heartCount: professor.heartCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 👉 送花
app.put("/api/professors/:id/flower", async (req, res) => {
  try {
    const professor = await Professor.findById(req.params.id);
    if (!professor) return res.status(404).json({ error: "Professor not found" });

    professor.flowerCount += 1;
    await professor.save();
    res.json({ flowerCount: professor.flowerCount });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* =====================
   啟動
===================== */
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
