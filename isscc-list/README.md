# ISSCC List

A simple web application to display and search ISSCC (International Solid-State Circuits Conference) tutorials, short courses, and forum entries in a table format.

## Features

- Responsive table display of ISSCC entries
- Search functionality across all fields
- Filter search by specific fields (year, category, number, title, authors, affiliation, direction)
- Sort by any column
- Filter by multiple criteria
- Year-based data organization for easier maintenance
- Strictly validated direction values

## How to Use

1. Open `index.html` in a web browser to view the application
2. Use the search box to find specific entries
3. Use the dropdown menu to filter your search by specific fields
4. Click on column headers to sort
5. Use filter icons (⚙) to filter by specific values in each column
6. Use the Year selector to view entries from specific years

## Data Organization

The application now uses a yearly data organization structure:

- `/data/` - Directory containing all data files
  - `/data/schema.json` - Contains the schema with predefined direction values
  - `/data/years.json` - Lists all available years
  - `/data/YYYY.json` - One file per year (e.g., 2024.json, 2025.json)

## How to Update Data

### Adding a New Year

1. Create a new file in the `/data/` directory named `YYYY.json` (e.g., `2026.json`)
2. Add the year to the `years` array in `/data/years.json`
3. Format the new year file as follows:

```json
{
  "entries": [
    {
      "year": 2026,
      "number": "1",
      "category": "Tutorial",
      "title": "Entry Title",
      "authors": "Author Names",
      "affiliation": "Institution Names",
      "direction": ["Direction1", "Direction2"],
      "link": "https://doi.org/...",
      "sscsLink": ""
    },
    // More entries...
  ]
}
```

### Direction Values

The `direction` field must use values from the predefined list in `schema.json`. Current valid values are:

```
"Analog", "AI/ML", "Biomedical", "Communications", "Data Conversion", 
"Design", "Digital", "Emerging", "Memory", "Power", "Quantum", 
"RF", "Security", "Sensing", "Systems"
```

To add new direction values, update the `directions` array in `/data/schema.json`.

## Project Structure

- `index.html` - Main HTML structure
- `styles.css` - CSS styling
- `/js/` - JavaScript modules
  - `dataService.js` - Handles data loading and processing
  - `filterService.js` - Manages filtering functionality
  - `sortService.js` - Handles table sorting
  - `uiService.js` - UI rendering and interactions
  - `main.js` - Application entry point
- `/data/` - Data files (as described above)
