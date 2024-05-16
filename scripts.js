// Import necessary data and constants from the data.js file.
import { books, authors, genres, BOOKS_PER_PAGE } from "./data.js";

// Initialize page number and matches array.
let page = 1;
let matches = books;

// Functiom to get DOM elements.
const getElement = (selector) => document.querySelector(selector);

const createBookPreviews = (books, container) => {
  // Create a document fragment to hold the previous temporarily for efficient DOM manipulation.
  const fragment = document.createDocumentFragment();
  // Iterate over each book in the array.
  books.forEach(({ author, id, image, title }) => {
    // Create a button element for each book.
    const element = document.createElement("button");
    // Set class and date attributes for styling and identification.
    element.classList = "preview";
    element.setAttribute("data-preview", id);
    // Set inner HTML for the button, including book image, title and author.
    element.innerHTML = `
        <img
            class="preview__image"
            src="${image}"
        />
        
        <div class="preview__info">
            <h3 class="preview__title">${title}</h3>
            <div class="preview__author">${authors[author]}</div>
        </div>
    `;
    // Append the button element to the fragment.
    fragment.appendChild(element);
  });
  // Append all preview elements from the fragment to the container at once for better performance.
  container.appendChild(fragment);
};

// Create select options dynamically based on the provided data.
const createOptions = (options, defaultOption, container) => {
  // Create a document fragment to hold the options temporarily for efficient DOM manipulation.
  const fragment = document.createDocumentFragment();
  // Create the first option element with default text and value.
  const firstOption = document.createElement("option");
  firstOption.value = "any";
  firstOption.innerText = defaultOption;
  genreHtml.appendChild(firstOption);
  Object.entries(options).forEach(([id, name]) => {
    const element = document.createElement("option");
    element.value = id;
    element.innerText = name;
    fragment.appendChild(element);
  });
  container.appendChild(fragment);
};

const applyTheme = (theme) => {
    const isNight = theme === "night";
    document.documentElement.style.setProperty(
        "--color-dark",
        isNight ? "10, 10, 20" : "255, 255, 255"
    );
    document.documentElement.style.setProperty(
        "--color-light",
        isNight ? "10, 10, 20" : "255, 255, 255"
    ); 
};

const updateShowMoreButton = () => {
    const remainingBooks = matches.length - page * BOOKS_PER_PAGE;
    const button = getElement("[data-list-button]");
    button.innerText = Show more (${remainingBooks});
    button.disabled = remainingBooks <= 0;
    button.innerHTML = `
    <span>Show more</span>
    <span class="list__remaining">${remainingBooks > 0 ? remainingBooks : 0}</span>`;
}

const closeOverlay = (selector) => {
  getElement(selector).open = false;
};

const openOverlay = (selector, focusSelector = null) => {
  getElement(selector).open = true;
  if (focusSelector) getElement(focusSelector).focus();
};

const applySearchFilters = (filters) => {
  return books.filter((book) => {
    const titleMatch = 
    filters.title.trim() === "" ||
    book.title.toLowerCase().includes(filters.title.toLowerCase());
    const authorMatch = filters.author === "any" || book.author === filters.author;
    const genreMatch = filters.genre === "any" || book.genres.includes(filters.genre)
    return titleMatch && authorMatch && genreMatch;
  });
};

const handleSearchCancel = () => closeOverlay ("[data-search-overlay]");

const handleSettingsCancel = () => closeOverlay ("[data-settings-overlay]");

const handleHeaderSearch = () => openOverlay("[data-search-overlay]", "[data-search-title]");

const handleSubmitSettings = (event) => {
event.preventDefault();
const formData = new FormData(event.target);
const { theme } = Object.fromEntries(formData);
applyTheme(theme);
closeOverlay("[data-settings-overlay]");
};

const handleSubmitSearch = (event) => {
event.preventDefault();
const formData = new FormData(event.target);
const filters = Object.fromEntries(formData);
matches = applySearchFilters(filters);
page = 1;
const listMessage = getElement("[data-list-message]");
listMessage.classList.toggle("list_message_show", matches.length < 1);
getElement("[data-list-items]").innerHTML = "";
createBookPreviews(
  matches.slice(0, BOOKS_PER_PAGE),
  getElement("[data-list-items]")
);
updateShowMoreButton();
window.scrollTo({ top: 0, behavior: "smooth"});
closeOverlay("[data-search-overlay]")
};

const handleShowMore = () => {
  createBookPreviews(
    matches.slice(page * BOOKS_PER_PAGE, (page + 1) * BOOKS_PER_PAGE),
    getElement("[data-list-items]")
  );
  page += 1;
  updateShowMoreButton();
};

const handleListItemClick = (event) => {
  const pathArray = Array.from(event.composedPath());
  const active = pathArray.find((node) => node?.dataset?.preview);
  if (active) {
    const book = books.find((book) => book.id === active.dataset.preview);
    if (book) {
      getElement("[data-list-active]").open = true;
      getElement("[data-list-blur]").src = book.image;
      getElement("[data-list-image]").src = book.image;
      getElement("[data-list-title]").innerText = book.title;
      getElement("[data-list-subtitle]").innerText = `${authors[book.author]} (${new Date().getFullYear()})`;
      getElement("[data-list-description]").innerText = book.description;
    }
  }
};

// Initial setup
createOptions(genres, "All Genres", getElement("[data-search-genres]"));
createOptions(authors, "All Authors", getElement("[data-search-authors]"));
applyTheme(window.matchMedia("(prefers-colors-scheme: dark)").matches ? "night" : "day");
createBookPreviews(matches.slice(0, BOOKS_PER_PAGE), getElement("[data-list-items]"));
updateShowMoreButton();

// Event listeners
getElement("[data-search-cancel]").addEventListener("click", handleSearchCancel);
getElement("[data-setting-cancel]").addEventListener("click", handleSettingsCancel);
getElement("[data-header-search]").addEventListener("click", handleHeaderSearch);
getElement("[data-header-settings]").addEventListener("click", handleHeaderSettings);
getElement("[data-list-close]").addEventListener("click",() => closeOverlay("[data-list-active]"));
getElement("[data-setting-form]").addEventListener("submit", handleSubmitSettings);
getElement("[data-search-form]").addEventListener("submit", handleSubmitSearch);
getElement("[data-list-button]").addEventListener("click", handleShowMore);
getElement("[data-list-items]").addEventListener("click", handleListItemClick);

/* const authorsHtml = document.createDocumentFragment();
const firstAuthorElement = document.createElement("option");
firstAuthorElement.value = "any";
firstAuthorElement.innerText = "All Authors";
authorsHtml.appendChild(firstAuthorElement);

for (const [id, name] of Object.entries(authors)) {
  const element = document.createElement("option");
  element.value = id;
  element.innerText = name;
  authorsHtml.appendChild(element);
}

document.querySelector("[data-search-authors]").appendChild(authorsHtml);

if (
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches
) {
  document.querySelector("[data-settings-theme]").value = "night";
  document.documentElement.style.setProperty("--color-dark", "255, 255, 255");
  document.documentElement.style.setProperty("--color-light", "10, 10, 20");
} else {
  document.querySelector("[data-settings-theme]").value = "day";
  document.documentElement.style.setProperty("--color-dark", "10, 10, 20");
  document.documentElement.style.setProperty("--color-light", "255, 255, 255");
}

document.querySelector("[data-list-button]").innerText = `Show more (${
  books.length - BOOKS_PER_PAGE
})`;
document.querySelector("[data-list-button]").disabled =
  matches.length - page * BOOKS_PER_PAGE > 0;

document.querySelector("[data-list-button]").innerHTML = `
    <span>Show more</span>
    <span class="list__remaining"> (${
      matches.length - page * BOOKS_PER_PAGE > 0
        ? matches.length - page * BOOKS_PER_PAGE
        : 0
    })</span>
`;

document.querySelector("[data-search-cancel]").addEventListener("click", () => {
  document.querySelector("[data-search-overlay]").open = false;
});

document
  .querySelector("[data-settings-cancel]")
  .addEventListener("click", () => {
    document.querySelector("[data-settings-overlay]").open = false;
  });

document.querySelector("[data-header-search]").addEventListener("click", () => {
  document.querySelector("[data-search-overlay]").open = true;
  document.querySelector("[data-search-title]").focus();
});

document
  .querySelector("[data-header-settings]")
  .addEventListener("click", () => {
    document.querySelector("[data-settings-overlay]").open = true;
  });

document.querySelector("[data-list-close]").addEventListener("click", () => {
  document.querySelector("[data-list-active]").open = false;
});

document
  .querySelector("[data-settings-form]")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const { theme } = Object.fromEntries(formData);

    if (theme === "night") {
      document.documentElement.style.setProperty(
        "--color-dark",
        "255, 255, 255"
      );
      document.documentElement.style.setProperty("--color-light", "10, 10, 20");
    } else {
      document.documentElement.style.setProperty("--color-dark", "10, 10, 20");
      document.documentElement.style.setProperty(
        "--color-light",
        "255, 255, 255"
      );
    }

    document.querySelector("[data-settings-overlay]").open = false;
  });

document
  .querySelector("[data-search-form]")
  .addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const filters = Object.fromEntries(formData);
    const result = [];

    for (const book of books) {
      let genreMatch = filters.genre === "any";

      for (const singleGenre of book.genres) {
        if (genreMatch) break;
        if (singleGenre === filters.genre) {
          genreMatch = true;
        }
      }

      if (
        (filters.title.trim() === "" ||
          book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
        (filters.author === "any" || book.author === filters.author) &&
        genreMatch
      ) {
        result.push(book);
      }
    }

    page = 1;
    matches = result;

    if (result.length < 1) {
      document
        .querySelector("[data-list-message]")
        .classList.add("list__message_show");
    } else {
      document
        .querySelector("[data-list-message]")
        .classList.remove("list__message_show");
    }

    document.querySelector("[data-list-items]").innerHTML = "";
    const newItems = document.createDocumentFragment();

    for (const { author, id, image, title } of result.slice(
      0,
      BOOKS_PER_PAGE
    )) {
      const element = document.createElement("button");
      element.classList = "preview";
      element.setAttribute("data-preview", id);

      element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `;

      newItems.appendChild(element);
    }

    document.querySelector("[data-list-items]").appendChild(newItems);
    document.querySelector("[data-list-button]").disabled =
      matches.length - page * BOOKS_PER_PAGE < 1;

    document.querySelector("[data-list-button]").innerHTML = `
        <span>Show more</span>
        <span class="list__remaining"> (${
          matches.length - page * BOOKS_PER_PAGE > 0
            ? matches.length - page * BOOKS_PER_PAGE
            : 0
        })</span>
    `;

    window.scrollTo({ top: 0, behavior: "smooth" });
    document.querySelector("[data-search-overlay]").open = false;
  });

document.querySelector("[data-list-button]").addEventListener("click", () => {
  const fragment = document.createDocumentFragment();

  for (const { author, id, image, title } of matches.slice(
    page * BOOKS_PER_PAGE,
    (page + 1) * BOOKS_PER_PAGE
  )) {
    const element = document.createElement("button");
    element.classList = "preview";
    element.setAttribute("data-preview", id);

    element.innerHTML = `
            <img
                class="preview__image"
                src="${image}"
            />
            
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `;

    fragment.appendChild(element);
  }

  document.querySelector("[data-list-items]").appendChild(fragment);
  page += 1;
});

document
  .querySelector("[data-list-items]")
  .addEventListener("click", (event) => {
    const pathArray = Array.from(event.path || event.composedPath());
    let active = null;

    for (const node of pathArray) {
      if (active) break;

      if (node?.dataset?.preview) {
        let result = null;

        for (const singleBook of books) {
          if (result) break;
          if (singleBook.id === node?.dataset?.preview) result = singleBook;
        }

        active = result;
      }
    }

    if (active) {
      document.querySelector("[data-list-active]").open = true;
      document.querySelector("[data-list-blur]").src = active.image;
      document.querySelector("[data-list-image]").src = active.image;
      document.querySelector("[data-list-title]").innerText = active.title;
      document.querySelector("[data-list-subtitle]").innerText = `${
        authors[active.author]
      } (${new Date(active.published).getFullYear()})`;
      document.querySelector("[data-list-description]").innerText =
        active.description;
    }
  });
