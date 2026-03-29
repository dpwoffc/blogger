const container = document.querySelector(".container");

const list = document.createElement("div");
list.className = "news-list";
container.appendChild(list);

async function loadArticles() {
    try {
        const res = await fetch("/api/v1/articles", {
            credentials: "include"
        });

        const json = await res.json();

        if (!json.success) {
            list.innerHTML = "<p>Gagal ambil data</p>";
            return;
        }

        if (json.data.length === 0) {
            list.innerHTML = "<p>Tidak ada berita milik kamu 😔</p>";
            return;
        }

        list.innerHTML = "";

        json.data.forEach(item => {
            const box = document.createElement("div");
            box.className = "news-item";

            // 🌐 bikin base URL
            const protocol = window.location.protocol;
            const domain = window.location.host;

            const viewUrl = `${protocol}//${domain}/${item.author}/${item.id}`;

            box.innerHTML = `
                <img src="${item.thumbnail}" class="news-thumb" />
                
                <div class="news-content">
                    <div class="news-title">${item.title}</div>
                    <div class="news-meta">
                        ${item.author} • ${item.date}
                    </div>

                    <div class="news-actions">
                        <button class="share-btn">📤 Share</button>
                        <button class="edit-btn">✏️ Edit</button>
                        <button class="view-btn">👁️ View</button>
                    </div>
                </div>
            `;

            // ambil tombol
            const shareBtn = box.querySelector(".share-btn");
            const editBtn = box.querySelector(".edit-btn");
            const viewBtn = box.querySelector(".view-btn");

            // 📤 SHARE (copy link)
            shareBtn.onclick = async () => {
                try {
                    await navigator.clipboard.writeText(viewUrl);
                    alert("Link berhasil disalin 😎");
                } catch {
                    alert("Gagal copy link");
                }
            };

            // ✏️ EDIT
            editBtn.onclick = () => {
                location.href = `../edit/index.html?id=${item.id}`;
            };

            // 👁️ VIEW
            viewBtn.onclick = () => {
                window.open(viewUrl, "_blank");
            };

            list.appendChild(box);
        });

    } catch (err) {
        list.innerHTML = "<p>Error ambil data</p>";
    }
}

loadArticles();