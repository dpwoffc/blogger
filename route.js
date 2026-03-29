const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");
const UserDataPath = path.join(__dirname, "database", "user.json");
const AdminDataPath = path.join(__dirname, "database", "admin.json");
const DB_PATH = path.join(__dirname, "database", "category.json");
const NEWS_PATH = path.join(__dirname, "database", "news.json");
const DATA_FILE = path.join(__dirname, "articles.json");


function readUsers() {
    if (!fs.existsSync(UserDataPath)) {
        fs.writeFileSync(UserDataPath, "[]");
    }
    return JSON.parse(fs.readFileSync(UserDataPath, "utf8"));
}

function saveUsers(data) {
    fs.writeFileSync(UserDataPath, JSON.stringify(data, null, 2));
}

function readAdmins() {
    if (!fs.existsSync(AdminDataPath)) {
        fs.writeFileSync(AdminDataPath, "[]");
    }
    return JSON.parse(fs.readFileSync(AdminDataPath, "utf8"));
}

function saveAdmins(data) {
    fs.writeFileSync(AdminDataPath, JSON.stringify(data, null, 2));
}

const getData = () => {
  try {
    const raw = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
};

const getNews = () => {
  try {
    const raw = fs.readFileSync(NEWS_PATH, "utf8");
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
};

//  ADMIN
// DELETE category by ID (admin only)
router.delete("/api/v1/categories/:id", (req, res) => {
    const { id } = req.params;
    const session = req.cookies?.session;

    if (!session) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const admins = readAdmins();
    const currentAdmin = admins.find(a => a.cookies === session);

    if (!currentAdmin) {
        return res.status(403).json({ success: false, message: "Hanya admin yang bisa menghapus kategori" });
    }

    const data = getData();
    const index = data.findIndex(item => item.id === id);

    if (index === -1) {
        return res.status(404).json({ success: false, message: "Kategori tidak ditemukan" });
    }

    const removed = data.splice(index, 1)[0];

    // Simpan JSON kategori
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

    res.json({ success: true, message: `Kategori ${id} berhasil dihapus`, data: removed });
});

// Tambah kategori baru (hanya owner)
router.post("/api/v1/categories", (req, res) => {
    const session = req.cookies?.session;
    const { category } = req.body;

    if (!session) {
        return res.status(401).json({ success: false, message: "Unauthorized, session tidak ditemukan" });
    }

    const admins = readAdmins();
    const currentAdmin = admins.find(a => a.cookies === session);

    if (!currentAdmin) {
        return res.status(403).json({ success: false, message: "Hanya admin yang bisa menghapus kategori" });
    }

    if (!category || category.trim() === "") {
        return res.status(400).json({ success: false, message: "Nama kategori wajib diisi" });
    }

    const data = getData();

    // Cek duplikat kategori
    const exists = data.find(d => d.category.toLowerCase() === category.toLowerCase());
    if (exists) {
        return res.status(400).json({ success: false, message: "Kategori sudah ada" });
    }

    // Generate ID baru (misal pakai timestamp + random)
    const newCategory = {
        id: Date.now().toString(),
        category: category.trim()
    };

    data.push(newCategory);

    // Simpan ke file
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));

    res.json({ success: true, message: "Kategori berhasil ditambahkan", data: newCategory });
});

//  LOGIN DAN KAWAN-KAWAN NYA
router.post("/api/v1/auth/login",(req,res)=>{
    const { email, password } = req.body;
    const users = readUsers();
    const admins = readAdmins();
    const user = users.find(u=>u.email===email && u.password===password);
    const admin = admins.find(a=>a.email===email && a.password===password);

    if(!user && !admin){
        return res.json({success:false,message:"Email atau password salah"});
    }

    const session = crypto.randomUUID();

    if(user){
        user.cookies = session;
        saveUsers(users);
    }
    if(admin){
        admin.cookies = session;
        saveAdmins(admins);
    }
    res.cookie("session",session,{
        httpOnly:true,
        maxAge:2592000000
    });
    res.json({success:true, role: admin ? "admin":"user"});
});

router.get("/api/check-session",(req,res)=>{

    const session = req.cookies?.session;

    if(!session) return res.json({logged:false});

    const users = readUsers();
    const admins = readAdmins();

    const user = users.find(u=>u.cookies===session);
    const admin = admins.find(a=>a.cookies===session);

    if(!user && !admin){
        return res.json({logged:false});
    }

    res.json({
        logged: true,
        role: admin ? "admin" : "user",
        username: admin ? admin.username : user.username
    });

});

router.post("/api/logout",(req,res)=>{
    const session = req.cookies?.session;

    if(session){
        const users = readUsers();
        const admins = readAdmins();
        const user = users.find(u=>u.cookies===session);
        const admin = admins.find(a=>a.cookies===session);

        if(user){
            user.cookies="";
            saveUsers(users);
        }

        if(admin){
            admin.cookies="";
            saveAdmins(admins);
        }

    }

    res.clearCookie("session",{httpOnly:true,path:"/"});
    res.json({success:true});
});

//  LIST KATEGORI TERSEDIA
router.post("/api/v1/categories", (req, res) => {
  const data = getData();

  const result = data.map(item => ({
    id: item.id,
    category: item.category
  }));

  res.status(200).json({
    success: true,
    total: result.length,
    data: result
  });
});

router.get("/api/v1/categories", (req, res) => {
  const data = getData();

  const result = data.map(item => ({
    id: item.id,
    category: item.category
  }));

  res.status(200).json({
    success: true,
    total: result.length,
    data: result
  });
});

//  LIST BERITA DAN KAWAN-KAWANNYA
router.get("/api/v1/articles/list", (req, res) => {
  try {
    const data = getNews();

    res.status(200).json({
      success: true,
      total: data.length,
      data: data
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Gagal membaca data news"
    });
  }
});

router.get("/api/v1/articles/:id", (req, res) => {
  const id = req.params.id;

  try {
    const data = getNews();

    const found = data.find(item => item.id === id);

    if (!found) {
      return res.status(404).json({
        success: false,
        message: "Berita tidak ditemukan"
      });
    }

    // 🔥 ambil news pertama
    const news = found.news?.[0];

    res.status(200).json({
      success: true,
      data: {
        ...found,
        news: news
      }
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Gagal membaca data"
    });
  }
});

//  FUNGSI USER
// DELETE article by ID
router.delete("/api/v1/articles/:id", (req, res) => {
    const { id } = req.params;
    const session = req.cookies?.session;

    if (!session) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const users = readUsers();
    const admins = readAdmins();
    const currentUser = users.find(u => u.cookies === session) || admins.find(a => a.cookies === session);

    if (!currentUser) {
        return res.status(401).json({ success: false, message: "Session tidak valid" });
    }

    const data = getNews();
    const index = data.findIndex(item => item.id === id);

    if (index === -1) {
        return res.status(404).json({ success: false, message: "Artikel tidak ditemukan" });
    }

    const authorEmail = data[index].author?.[0]?.email;
    if (authorEmail !== currentUser.email) {
        return res.status(403).json({ success: false, message: "Tidak punya izin menghapus artikel ini" });
    }

    const removed = data.splice(index, 1)[0];

    // Simpan JSON
    fs.writeFileSync(NEWS_PATH, JSON.stringify(data, null, 2));

    // Hapus file txt jika ada
    if (removed.news?.[0]?.txtFile) {
        const txtPath = path.join(__dirname, removed.news[0].txtFile.replace("./public/", ""));
        if (fs.existsSync(txtPath)) fs.unlinkSync(txtPath);
    }

    res.json({ success: true, message: `Artikel ${id} berhasil dihapus` });
});

router.get("/api/v1/articles", (req, res) => {
  const session = req.cookies?.session;

  if (!session) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized"
    });
  }

  const users = readUsers();
  const admins = readAdmins();

  const user = users.find(u => u.cookies === session);
  const admin = admins.find(a => a.cookies === session);

  const currentUser = user || admin;

  if (!currentUser) {
    return res.status(401).json({
      success: false,
      message: "Session tidak valid"
    });
  }

  const newsData = getNews();
  const username = currentUser.username;

  const result = [];

  newsData.forEach(item => {
    const authorUsername = item.author?.[0]?.username;

    if (authorUsername === username && Array.isArray(item.news)) {
      item.news.forEach(news => {
        const rawThumb = news.mediaPath?.[0]?.["1"];

        result.push({
          id: news.id || item.id,
          title: news.title,
          author: authorUsername,
          date: news.date,
          // 🔥 FIX PATH BIAR BISA DIAKSES BROWSER
          thumbnail: rawThumb ? rawThumb.replace("./public", "") : null
        });
      });
    }
  });

  res.status(200).json({
    success: true,
    total: result.length,
    data: result
  });
});

router.get("/api/v1/articles/:id/content", (req, res) => {
  const id = req.params.id;

  try {
    const data = getNews();

    const found = data.find(item => item.id === id);

    if (!found) {
      return res.status(404).json({
        success: false,
        message: "Data tidak ditemukan"
      });
    }

    const news = found.news?.[0];

    if (!news) {
      return res.status(404).json({
        success: false,
        message: "Konten tidak tersedia"
      });
    }

    // 🔥 ambil thumbnail
    const rawThumb = news.mediaPath?.[0]?.["1"];

    res.status(200).json({
      success: true,
      title: news.title,
      author: found.author?.[0]?.username,
      date: news.date,
      description: news.description,
      category: news.category,
      thumbnail: rawThumb 
        ? rawThumb.replace("./public", "") 
        : null,
      media: news.mediaPath || [],
      txtPath: news.txtFile,
      endpoint: news.pageEndpoint
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Gagal mengambil data"
    });
  }
});

//

module.exports = router;