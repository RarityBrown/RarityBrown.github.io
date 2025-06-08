/**
 * UI Service - Handles UI rendering and interactions
 */

import dataStore from './dataService.js';
import { filterState, applyColumnFilter, clearColumnFilter, filterDropdownOptions } from './filterService.js';
import { updateSortIndicators } from './sortService.js';

/**
 * Display data in the table
 * @param {Array} data - The data to display
 */
function displayData(data) {
    const tableBody = document.getElementById('tableBody');
    
    // Clear the table
    tableBody.innerHTML = '';
    
    if (data.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="9">No matching records found</td></tr>`;
        return;
    }
    
    // Add each entry to the table
    data.forEach(entry => {
        const row = document.createElement('tr');
        
        // Add data-year attribute for year-based styling
        row.setAttribute('data-year', entry.year);
        
        // Add data-category attribute for category-based styling
        row.setAttribute('data-category', entry.category);
        
        // Add title attributes for tooltips on hover
        row.innerHTML = `
            <td title="${entry.year}">${entry.year}</td>
            <td title="${entry.category}">${entry.category}</td>
            <td title="${entry.number}">${entry.number}</td>
            <td title="${entry.title}">${entry.title}</td>
            <td title="${entry.authors}">${entry.authors}</td>
            <td title="${entry.affiliation}">${entry.affiliation}</td>
            <td title="${Array.isArray(entry.direction) ? entry.direction.join(', ') : entry.direction}">${Array.isArray(entry.direction) ? entry.direction.join(', ') : entry.direction}</td>
            <td><a href="${entry.link}" target="_blank" title="Open entry link">Link</a></td>
            <td><a href="${entry.sscsLink}" target="_blank" title="${entry.sscsLink ? 'View SSCS resource' : ''}">${entry.sscsLink ? 'View' : ''}</a></td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Update sort indicators if sorting is active
    updateSortIndicators();
}

/**
 * Populate filter dropdowns
 * @param {Array} data - The data to populate dropdowns with
 */
function populateFilterDropdowns(data) {
    // Get unique values for each filterable field and count occurrences
    const uniqueValues = {
        year: new Set(),
        category: new Set(),
        number: new Set(),
        authors: new Set(),
        affiliation: new Set(),
        direction: new Set()
    };
    
    // Count occurrences of each value
    const valueCounts = {
        year: {},
        category: {},
        number: {},
        authors: {},
        affiliation: {},
        direction: {}
    };
    
    // Collect unique values from data and count occurrences
    data.forEach(entry => {
        // Add to unique values sets
        uniqueValues.year.add(entry.year);
        uniqueValues.category.add(entry.category);
        uniqueValues.number.add(entry.number);
        uniqueValues.authors.add(entry.authors);
        uniqueValues.affiliation.add(entry.affiliation);
        if (Array.isArray(entry.direction)) {
            entry.direction.forEach(dir => {
                uniqueValues.direction.add(dir);
                valueCounts.direction[dir] = (valueCounts.direction[dir] || 0) + 1;
            });
        } else if (entry.direction) { // Ensure entry.direction is not null or undefined
            uniqueValues.direction.add(entry.direction);
            valueCounts.direction[entry.direction] = (valueCounts.direction[entry.direction] || 0) + 1;
        }
        
        // Count occurrences for other fields
        valueCounts.year[entry.year] = (valueCounts.year[entry.year] || 0) + 1;
        valueCounts.category[entry.category] = (valueCounts.category[entry.category] || 0) + 1;
        valueCounts.number[entry.number] = (valueCounts.number[entry.number] || 0) + 1;
        valueCounts.authors[entry.authors] = (valueCounts.authors[entry.authors] || 0) + 1;
        valueCounts.affiliation[entry.affiliation] = (valueCounts.affiliation[entry.affiliation] || 0) + 1;
        // Direction counts are handled above for both array and string cases
    });
    
    // Initialize selected filter options
    filterState.initializeFilterOptions();
    
    // Populate each dropdown
    for (const [field, values] of Object.entries(uniqueValues)) {
        const optionsContainer = document.getElementById(`${field}FilterOptions`);
        if (optionsContainer) {
            // Convert to array, sort, and add options
            const sortedValues = Array.from(values).sort((a, b) => {
                // Sort years in descending order
                if (field === 'year') return b - a;
                // Sort text values in ascending order
                return String(a).localeCompare(String(b));
            });
            
            // Add "Select All" option
            const selectAllDiv = document.createElement('div');
            selectAllDiv.className = 'filter-option';
            selectAllDiv.innerHTML = `
                <input type="checkbox" id="${field}-selectAll" checked>
                <label for="${field}-selectAll">(Select All) (${data.length})</label>
            `;
            optionsContainer.appendChild(selectAllDiv);
            
            // Add event listener for Select All checkbox
            const selectAllCheckbox = document.getElementById(`${field}-selectAll`);
            selectAllCheckbox.addEventListener('change', (e) => {
                e.stopPropagation();
                const isChecked = selectAllCheckbox.checked;
                const checkboxes = optionsContainer.querySelectorAll('input[type="checkbox"]:not(#' + field + '-selectAll)');
                
                checkboxes.forEach(checkbox => {
                    checkbox.checked = isChecked;
                    const value = checkbox.value;
                    if (isChecked) {
                        filterState.selectedFilterOptions[field][value] = true;
                    } else {
                        delete filterState.selectedFilterOptions[field][value];
                    }
                });
                
                // Apply filter immediately
                applyColumnFilter(field);
            });
            
            // Add 'Deselect All' button to the filter actions
            const filterActions = document.querySelector(`#${field}FilterDropdown .filter-actions`);
            const deselectAllBtn = document.createElement('button');
            deselectAllBtn.className = 'filter-deselect-all';
            deselectAllBtn.textContent = 'Deselect All';
            deselectAllBtn.setAttribute('data-field', field);
            filterActions.appendChild(deselectAllBtn);
            
            // Add event listener for Deselect All button
            deselectAllBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Uncheck all checkboxes including Select All
                const allCheckboxes = optionsContainer.querySelectorAll('input[type="checkbox"]');
                allCheckboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
                
                // Clear selected filter options for this field
                filterState.selectedFilterOptions[field] = {};
                
                // Apply filter immediately
                applyColumnFilter(field);
            });
            
            // Add individual options
            sortedValues.forEach(value => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'filter-option';
                const optionId = `${field}-${value}`.replace(/\s+/g, '-');
                const count = valueCounts[field][value] || 0;
                
                optionDiv.innerHTML = `
                    <input type="checkbox" id="${optionId}" value="${value}" checked>
                    <label for="${optionId}">${value} (${count})</label>
                `;
                optionsContainer.appendChild(optionDiv);
                
                // Initialize all options as selected
                filterState.selectedFilterOptions[field][value] = true;
                
                // Add event listener for checkbox
                const checkbox = document.getElementById(optionId);
                checkbox.addEventListener('change', (e) => {
                    e.stopPropagation();
                    if (checkbox.checked) {
                        filterState.selectedFilterOptions[field][value] = true;
                    } else {
                        delete filterState.selectedFilterOptions[field][value];
                    }
                    
                    // Update Select All checkbox
                    const allChecked = optionsContainer.querySelectorAll('input[type="checkbox"]:not(#' + field + '-selectAll):checked').length === 
                                      optionsContainer.querySelectorAll('input[type="checkbox"]:not(#' + field + '-selectAll)').length;
                    selectAllCheckbox.checked = allChecked;
                    
                    // Apply filter immediately
                    applyColumnFilter(field);
                });
            });
        }
    }
}

/**
 * Setup event listeners for UI elements
 */
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    const filterType = document.getElementById('filterType');
    const yearSelector = document.getElementById('yearSelector');
    const sortableHeaders = document.querySelectorAll('th.sortable');
    const filterIcons = document.querySelectorAll('.filter-icon');
    const filterDropdowns = document.querySelectorAll('.filter-dropdown');
    const resetFiltersBtn = document.getElementById('resetFilters');

    // Prevent clicks inside filter dropdowns from triggering header sort
    filterDropdowns.forEach(dropdown => {
        dropdown.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    });
    
    // Import functions from other modules
    const { resetFilters, filterData } = window.filterModule;
    const { sortData } = window.sortModule;
    
    // Add event listeners for search and filter
    searchInput.addEventListener('input', filterData);
    filterType.addEventListener('change', filterData);
    
    // Add event listener for year selector
    if (yearSelector) {
        yearSelector.addEventListener('change', function() {
            const selectedYear = this.value;
            // If 'all' is selected, show all years
            if (selectedYear === 'all') {
                applyFilters();
                return;
            }
            
            // Otherwise filter by the selected year
            const yearValue = parseInt(selectedYear);
            filterState.activeFilters['year'] = [String(yearValue)];
            applyFilters();
        });
    }
    
    // Add event listeners for sortable headers
    sortableHeaders.forEach(header => {
        header.addEventListener('click', (e) => {
            // Only sort if we didn't click on the filter icon
            if (!e.target.classList.contains('filter-icon')) {
                const field = header.getAttribute('data-field');
                sortData(field);
            }
        });
    });
    
    // Add event listeners for filter icons
    filterIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent sorting when clicking filter icon
            
            const field = icon.closest('th').getAttribute('data-field');
            const dropdown = document.getElementById(`${field}FilterDropdown`);
            
            // Close all other dropdowns
            filterDropdowns.forEach(d => {
                if (d.id !== dropdown.id) {
                    d.classList.remove('show');
                }
            });
            
            // Toggle this dropdown
            dropdown.classList.toggle('show');
        });
    });
    
    // Since we're applying filters in real-time, the Apply buttons will just close the dropdown
    document.querySelectorAll('.filter-apply').forEach(button => {
        button.addEventListener('click', () => {
            const field = button.getAttribute('data-field');
            document.getElementById(`${field}FilterDropdown`).classList.remove('show');
        });
    });
    
    // Add event listeners for filter clear buttons
    document.querySelectorAll('.filter-clear').forEach(button => {
        button.addEventListener('click', () => {
            const field = button.getAttribute('data-field');
            clearColumnFilter(field);
            document.getElementById(`${field}FilterDropdown`).classList.remove('show');
        });
    });
    
    // Add event listener for filter search inputs
    document.querySelectorAll('.filter-search-input').forEach(input => {
        input.addEventListener('input', () => {
            const field = input.getAttribute('data-field');
            const searchTerm = input.value.toLowerCase();
            filterDropdownOptions(field, searchTerm);
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.filter-dropdown') && !e.target.closest('.filter-icon')) {
            filterDropdowns.forEach(dropdown => {
                dropdown.classList.remove('show');
            });
        }
    });
    
    // Add event listener for reset filters button
    resetFiltersBtn.addEventListener('click', resetFilters);
}

export { 
    displayData, 
    populateFilterDropdowns, 
    setupEventListeners 
};
