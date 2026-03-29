const titleEl = document.getElementById("title");
const metaEl = document.getElementById("meta");
const contentEl = document.getElementById("content");
const mediaContainer = document.getElementById("media");

async function loadArticle() {
    try {
        const pathParts = window.location.pathname.split("/").filter(Boolean);
        const username = pathParts[0] || "user1";
        const category = pathParts[1] || "teknologi";
        const id = pathParts[2] || "1";

        // URL txt langsung ke /database
        const txtUrl = `/database/${username}/news/${category}/${id}.txt`;
        console.log("Fetching:", txtUrl);

        const res = await fetch(txtUrl);
        if (!res.ok) {
            titleEl.innerText = "Berita tidak ditemukan 😔";
            return;
        }

        const text = await res.text();

        // judul <b>
        const titleMatch = text.match(/<b>(.*?)<\/b>/i);
        if (titleMatch) titleEl.innerText = titleMatch[1];

        // semua <img>
        const imgMatches = [...text.matchAll(/<img\s+src=["'](.*?)["']/gi)];
        mediaContainer.innerHTML = "";
        mediaContainer.style.textAlign = "center";

        imgMatches.forEach((m, i) => {
            let src = m[1].replace(/(\.\.\/)+img\//, `/database/${username}/img/`);
            const img = document.createElement("img");
            img.src = src;
            img.alt = `Media ${i+1}`;
            img.style.maxWidth = "200px";
            img.style.margin = "5px";
            img.style.borderRadius = "8px";
            mediaContainer.appendChild(img);
        });

        // content <p>
        const paragraphs = [...text.matchAll(/<p>(.*?)<\/p>/gi)];
        contentEl.innerHTML = paragraphs.map(p => p[0]).join("\n");

        metaEl.innerText = `Oleh ${username} • ${new Date().toLocaleDateString()}`;

    } catch (err) {
        titleEl.innerText = "Error loading artikel";
        console.error(err);
    }
}

loadArticle();