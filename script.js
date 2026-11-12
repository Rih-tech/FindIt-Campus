
// ====================================
// FINDIT CAMPUS - COMPLETE JAVASCRIPT
// LOCAL STORAGE VERSION - NO FIREBASE
// ====================================

// Load saved reports
let items = JSON.parse(localStorage.getItem("campusItems")) || [];

let currentFilter = "all";

// Support reports created before this update
items.forEach(item => {
    if (!item.status) {
        item.status = "active";
    }
});

try {
    localStorage.setItem("campusItems", JSON.stringify(items));
} catch (error) {
    console.warn("Could not update saved reports:", error);
}


// ====================================
// OPEN REPORT FORM
// ====================================

function openForm(type) {
    document.getElementById("type").value = type;

    document.getElementById("reportSection")
        .scrollIntoView({ behavior: "smooth" });
}


// ====================================
// IMAGE COMPRESSION
// ====================================

function compressImage(file) {
    return new Promise((resolve, reject) => {

        if (!file || !file.type.startsWith("image/")) {
            reject(new Error("Please select a valid image."));
            return;
        }

        if (file.size > 8 * 1024 * 1024) {
            reject(new Error("Please choose an image smaller than 8 MB."));
            return;
        }

        const reader = new FileReader();

        reader.onload = () => {
            const image = new Image();

            image.onload = () => {

                const maxDimension = 1000;

                const scale = Math.min(
                    1,
                    maxDimension / Math.max(image.width, image.height)
                );

                const canvas = document.createElement("canvas");

                canvas.width = Math.max(
                    1,
                    Math.round(image.width * scale)
                );

                canvas.height = Math.max(
                    1,
                    Math.round(image.height * scale)
                );

                const context = canvas.getContext("2d");

                context.drawImage(
                    image,
                    0,
                    0,
                    canvas.width,
                    canvas.height
                );

                let quality = 0.78;

                let dataUrl = canvas.toDataURL(
                    "image/jpeg",
                    quality
                );

                while (dataUrl.length > 160000 && quality > 0.35) {
                    quality -= 0.08;

                    dataUrl = canvas.toDataURL(
                        "image/jpeg",
                        quality
                    );
                }

                if (dataUrl.length > 160000) {
                    reject(new Error(
                        "Image is still too large after compression. Please choose a smaller photo."
                    ));
                    return;
                }

                resolve(dataUrl);
            };

            image.onerror = () => {
                reject(new Error("Could not read this image."));
            };

            image.src = reader.result;
        };

        reader.onerror = () => {
            reject(new Error("Could not load the selected image."));
        };

        reader.readAsDataURL(file);
    });
}


// ====================================
// SUBMIT REPORT - LOCAL STORAGE
// ====================================

document.getElementById("itemForm")
    .addEventListener("submit", async function (e) {

        e.preventDefault();

        const name = document.getElementById("itemName").value.trim();
        const type = document.getElementById("type").value;
        const category = document.getElementById("category").value;
        const description = document.getElementById("description").value.trim();
        const location = document.getElementById("location").value.trim();
        const date = document.getElementById("date").value;
        const contact = document.getElementById("contact").value.trim();

        const photoFile = document.getElementById("photo").files[0];

        if (!name || !description || !location || !date || !contact) {
            alert("Please fill in all required fields!");
            return;
        }

        const submitButton = this.querySelector('button[type="submit"]');

        if (submitButton) {
            submitButton.disabled = true;
        }

        try {

            const photo = photoFile
                ? await compressImage(photoFile)
                : "";

            const newItem = {
                id: Date.now(),
                name: name,
                type: type,
                category: category,
                description: description,
                location: location,
                date: date,
                contact: contact,
                photo: photo,
                status: "active",
                createdAt: new Date().toISOString()
            };

            items.unshift(newItem);

            try {
                localStorage.setItem(
                    "campusItems",
                    JSON.stringify(items)
                );
            } catch (storageError) {

                items.shift();

                throw new Error(
                    "Browser storage is full. Try a smaller photo or remove old reports."
                );
            }

            displayItems();
            updateStats();

            alert("Your report has been saved successfully on this device!");

            this.reset();

            document.getElementById("items")
                .scrollIntoView({ behavior: "smooth" });

        } catch (error) {

            console.error("Report save error:", error);

            alert(
                error.message ||
                "Could not save the report. Please try again."
            );

        } finally {

            if (submitButton) {
                submitButton.disabled = false;
            }
        }
    });


// ====================================
// DISPLAY REPORTS
// ====================================

function displayItems() {

    const container = document.getElementById("itemContainer");

    const search = document.getElementById("searchInput")
        .value.toLowerCase();

    let filteredItems = items.filter(item => {

        const matchesFilter =
            currentFilter === "all" ||
            item.type === currentFilter;

        const searchableText = [
            item.name,
            item.category,
            item.description,
            item.location
        ].join(" ").toLowerCase();

        const matchesSearch = searchableText.includes(search);

        return matchesFilter && matchesSearch;
    });

    if (filteredItems.length === 0) {

        container.innerHTML = `
            <p>No reports found. Try another search!</p>
        `;

        return;
    }

    container.innerHTML = filteredItems.map(item => `

        <div class="item-card">

            ${item.photo
            ? `<img src="${item.photo}" alt="Item photo">`
            : `<div style="height:120px;background:#edf0ff;
                    display:grid;place-items:center;font-size:40px;">
                    📦
                   </div>`
        }

            <div class="item-card-content">

                <span class="status ${item.status === "returned"
            ? "found"
            : item.type
        }">

                    ${item.status === "returned"
            ? "RETURNED"
            : item.type.toUpperCase()
        }

                </span>

                <h3>${escapeHTML(item.name)}</h3>

                <p>${escapeHTML(item.description)}</p>

                <p>📍 ${escapeHTML(item.location)}</p>

                <p>📅 ${escapeHTML(item.date)}</p>

                <p>Category: ${escapeHTML(item.category)}</p>

                ${item.status !== "returned"
            ? `
                            <button class="primary-btn"
                                onclick="contactPerson('${item.id}')">
                                Contact
                            </button>

                            <button class="return-btn"
                                onclick="markReturned('${item.id}')">
                                Mark as Returned
                            </button>
                        `
            : `
                            <span class="status found">
                                SUCCESSFULLY RETURNED
                            </span>
                        `
        }

            </div>

        </div>

    `).join("");
}


// ====================================
// ESCAPE USER INPUT
// ====================================

function escapeHTML(value) {

    return String(value).replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);

}


// ====================================
// FILTER REPORTS
// ====================================

function filterItems(type) {

    currentFilter = type;

    displayItems();
}


// ====================================
// SEARCH REPORTS
// ====================================

document.getElementById("searchInput")
    .addEventListener("input", displayItems);


// ====================================
// UPDATE STATISTICS
// ====================================

function updateStats() {

    document.getElementById("totalItems").textContent =
        items.length;

    document.getElementById("lostItems").textContent =
        items.filter(item => item.type === "lost").length;

    document.getElementById("foundItems").textContent =
        items.filter(item => item.type === "found").length;
}


// ====================================
// CONTACT PERSON
// ====================================

function contactPerson(id) {

    const item = items.find(item => item.id == id);

    if (!item) return;

    alert("Contact number: " + item.contact);
}


// ====================================
// MARK ITEM AS RETURNED
// ====================================

function markReturned(id) {

    const item = items.find(
        item => String(item.id) === String(id)
    );

    if (!item || item.status === "returned") return;

    const confirmReturn = confirm(
        "Are you sure this item has been returned?"
    );

    if (!confirmReturn) return;

    item.status = "returned";

    item.returnedAt = new Date().toISOString();

    try {

        localStorage.setItem(
            "campusItems",
            JSON.stringify(items)
        );

        displayItems();
        updateStats();

        alert("Item successfully marked as returned!");

    } catch (error) {

        console.error("Could not update returned status:", error);

        alert(
            "Could not save the update. Browser storage may be full."
        );
    }
}


// ====================================
// SMART MATCHING ENGINE
// ====================================

// Convert text into useful keywords

function getWords(text) {

    const stopWords = [
        "the", "a", "an", "is", "was", "were",
        "with", "near", "at", "in", "on", "and",
        "of", "to", "my", "found", "lost"
    ];

    return String(text)
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, " ")
        .split(/\s+/)
        .filter(word =>
            word.length > 1 &&
            !stopWords.includes(word)
        );
}


// ====================================
// TEXT SIMILARITY
// ====================================

function textSimilarity(text1, text2) {

    const words1 = new Set(getWords(text1));
    const words2 = new Set(getWords(text2));

    if (words1.size === 0 || words2.size === 0) {
        return 0;
    }

    const intersection = [...words1].filter(
        word => words2.has(word)
    );

    const union = new Set([
        ...words1,
        ...words2
    ]);

    return intersection.length / union.size;
}


// ====================================
// CALCULATE MATCHING SCORE
// ====================================

function calculateMatch(lost, found) {

    const nameScore = textSimilarity(
        lost.name,
        found.name
    );

    const descriptionScore = textSimilarity(
        lost.description,
        found.description
    );

    const categoryScore =
        lost.category.toLowerCase() === found.category.toLowerCase()
            ? 1
            : 0;

    const locationScore = textSimilarity(
        lost.location,
        found.location
    );

    const finalScore = (
        nameScore * 35 +
        descriptionScore * 35 +
        categoryScore * 15 +
        locationScore * 15
    );

    return Math.round(finalScore);
}


// ====================================
// FIND POSSIBLE MATCHES
// ====================================

function findMatches() {

    const results = document.getElementById("matchResults");

    results.innerHTML = "";

    // Ignore returned items
    const lostReports = items.filter(
        item =>
            item.type === "lost" &&
            item.status !== "returned"
    );

    const foundReports = items.filter(
        item =>
            item.type === "found" &&
            item.status !== "returned"
    );

    if (lostReports.length === 0 || foundReports.length === 0) {

        results.innerHTML = `
            <div class="match-card">
                <h3>Not enough reports yet!</h3>

                <p>
                    Please add at least one active lost report
                    and one active found report to discover matches.
                </p>
            </div>
        `;

        return;
    }

    let matches = [];

    lostReports.forEach(lost => {

        foundReports.forEach(found => {

            const score = calculateMatch(lost, found);

            if (score >= 30) {

                matches.push({
                    lost: lost,
                    found: found,
                    score: score
                });
            }
        });
    });

    matches.sort((a, b) => b.score - a.score);

    if (matches.length === 0) {

        results.innerHTML = `
            <div class="match-card">
                <h3>No possible matches found.</h3>

                <p>
                    Try adding more details or checking again
                    when new reports are available.
                </p>
            </div>
        `;

        return;
    }

    results.innerHTML = matches.map(match => `

        <div class="match-card">

            <span class="status found">
                POTENTIAL MATCH
            </span>

            <h3>
                ${escapeHTML(match.lost.name)}
                ↔
                ${escapeHTML(match.found.name)}
            </h3>

            <h2 style="color:#5267ed;margin:12px 0;">
                ${match.score}% Similarity
            </h2>

            <p>
                <strong>Lost at:</strong>
                ${escapeHTML(match.lost.location)}
            </p>

            <p>
                <strong>Found at:</strong>
                ${escapeHTML(match.found.location)}
            </p>

            <p>
                <strong>Lost description:</strong>
                ${escapeHTML(match.lost.description)}
            </p>

            <p>
                <strong>Found description:</strong>
                ${escapeHTML(match.found.description)}
            </p>

            <button class="primary-btn"
                onclick="contactPerson('${match.found.id}')">
                Contact Finder
            </button>

        </div>

    `).join("");
}


// ====================================
// INITIAL LOADING
// ====================================

// Restore older reports that may not have a status field.

items.forEach(item => {
    if (!item.status) {
        item.status = "active";
    }
});

try {

    localStorage.setItem(
        "campusItems",
        JSON.stringify(items)
    );

} catch (error) {

    console.warn(
        "Could not refresh LocalStorage cache:",
        error
    );
}

displayItems();
updateStats();
