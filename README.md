# FindIt Campus 🎒

**A Smart Campus Lost and Found Management System**

FindIt Campus is a web-based application designed to help students report lost and found belongings on campus. It makes it easier to discover missing items, connect with the people who found them, and return belongings to their rightful owners.

## 🚀 Features

- **Report Lost Items:** Students can submit details about items they have lost.
- **Report Found Items:** Students can upload details and photographs of items they have found.
- **Photo Uploads:** Attach images to item reports.
- **Search:** Search for items by name, description, category, or location.
- **Filters:** View lost items, found items, or all reports.
- **Smart Matching:** A rule-based matching algorithm compares lost and found reports using item names, descriptions, categories, and locations.
- **Contact Finder:** View the contact information provided in a report.
- **Mark as Returned:** Update an item when it has been successfully returned.
- **Statistics:** View the total number of reports, lost items, and found items.

## 🛠️ Technologies Used

- HTML
- CSS
- JavaScript
- Browser LocalStorage

## 💻 How to Run the Project

1. Download or clone this repository.
2. Open the project folder in Google Antigravity or another code editor.
3. Run `index.html` using a local development server.
4. Open the local website in your browser.

You can also use the Live Server extension if available in your editor.

## 📂 Project Structure

```text
FindIt-Campus/
│
├── index.html
├── style.css
├── script.js
└── README.md
```

## 🧠 How Smart Matching Works

FindIt Campus uses a rule-based similarity algorithm to compare lost and found reports.

The matching score considers:

- Item name similarity — 35%
- Description similarity — 35%
- Category match — 15%
- Location similarity — 15%

Reports with a similarity score of 30% or higher are displayed as potential matches.

**Note:** These are suggested matches, not guaranteed identifications. Users should verify an item before claiming it.

## 💾 Data Storage

This version uses browser LocalStorage to save reports and item information.

- No Firebase database is required.
- Reports remain available in the same browser on the same computer.
- Data is not automatically shared between different devices or browsers.
- Clearing browser data may remove saved reports.

## 🎯 Project Goal

The goal of FindIt Campus is to reduce the difficulty of finding lost belongings in college environments and make the process of reporting, matching, and returning items easier for students.

## 👥 Team

**Project:** FindIt Campus  
**Developed for:** Hackathon

## 📌 Future Improvements

- AI-powered image verification for uploaded item photographs.
- Shared cloud database for multiple users and devices.
- User authentication and secure contact management.
- Notifications when a possible match is found.

---

**FindIt Campus — Helping lost belongings find their way home.**