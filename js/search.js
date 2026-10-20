
 // List of HTML pages that the search function will check
const pages = [
    "index.html",
    "about.html",
    "culture.html",
    "history.html",
    "contact.html"
];

// Get the search query from the URL and convert it to lowercase
// For example, search.html?q=Forest becomes "forest"
const params = new URLSearchParams(window.location.search);
const query = (params.get("q") || "").trim().toLowerCase();

// Get the HTML elements where the search results and message appear
const results = document.getElementById("searchResults");
const message = document.getElementById("searchMessage");
const searchInput = document.getElementById("searchInput");

// Put the user's original search back into the input box
searchInput.value = params.get("q") || "";

// Function that searches through the listed HTML pages
async function searchSite() {

    // Check whether the user entered a search term
    if (!query) {
        message.textContent = "Enter something to search for.";
        return;
    }

    // Tell the user that the search is running
    message.textContent = "Searching TrekOut...";

    // Store the pages that contain a match
    const matches = [];

    // Loop through every page in the pages array
    for (const page of pages) {
        try {
            // Fetch the HTML file from the website
            const response = await fetch(page);

            // Skip the page if it could not be loaded
            if (!response.ok) continue;

            // Read the page's HTML content
            const html = await response.text();

            // Convert the HTML into a document that JavaScript can read
            const doc = new DOMParser().parseFromString(
                html,
                "text/html"
            );

            // Get the page title
            const title = doc.title || page;

            // Extract the visible text and remove extra spaces
            const text = doc.body.textContent
                .replace(/\s+/g, " ")
                .trim();

            // Find the position of the search term in the page text
            const index = text.toLowerCase().indexOf(query);

            // If the term exists, save the page as a search result
            if (index !== -1) {

                // Get a short section of text around the matching term
                const start = Math.max(0, index - 60);
                const snippet = text.slice(start, index + 140);

                // Store the title, filename and matching text
                matches.push({
                    title,
                    page,
                    snippet
                });
            }

        } catch (error) {
            // Display an error if the page cannot be searched
            console.error("Could not search:", page, error);
        }
    }

    // Clear any previous search results
    results.replaceChildren();

    // Display a message if no pages contain the search term
    if (matches.length === 0) {
        message.textContent = `No results found for "${query}".`;
        return;
    }

    // Display how many matching pages were found
    message.textContent =
        `${matches.length} result(s) found for "${query}".`;

    // Create a result for each matching page
    matches.forEach(result => {

        // Create the HTML elements for the result
        const article = document.createElement("article");
        const heading = document.createElement("h2");
        const link = document.createElement("a");
        const description = document.createElement("p");

        // Set the link to the matching page
        link.href = result.page;
        link.textContent = result.title;

        // Show a short preview of the matching page's text
        description.textContent = "..." + result.snippet + "...";

        // Put the link inside the heading
        heading.appendChild(link);

        // Add the heading and preview to the result
        article.append(heading, description);

        // Display the result on the search page
        results.appendChild(article);
    });
}

// Run the search when the search page loads
searchSite();
