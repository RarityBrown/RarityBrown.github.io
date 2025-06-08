/**
 * Filter Service - Handles all filtering functionality
 */

import dataStore from './dataService.js';
import { displayData } from './uiService.js';
import { sortDataArray } from './sortService.js';

// State for filters
const filterState = {
    activeFilters: {},
    selectedFilterOptions: {},
    
    // Initialize filter options
    initializeFilterOptions() {
        this.selectedFilterOptions = {
            year: {},
            category: {},
            number: {},
            authors: {},
            affiliation: {},
            direction: {}
        };
    }
};

/**
 * Apply column filter for a specific field
 * @param {string} field - The field to filter by
 */
function applyColumnFilter(field) {
    // Update active filters based on selected checkboxes
    const selectedValues = Object.keys(filterState.selectedFilterOptions[field]);
    
    if (selectedValues.length === 0) {
        // If nothing is selected, show no results for this field
        filterState.activeFilters[field] = [];
    } else {
        // If all values are selected, don't filter this field
        const allPossibleValues = new Set();
        dataStore.getData().forEach(entry => {
            if (field === 'direction' && Array.isArray(entry.direction)) {
                entry.direction.forEach(dir => allPossibleValues.add(String(dir)));
            } else if (entry[field]) {
                allPossibleValues.add(String(entry[field]));
            }
        });
        
        if (selectedValues.length === allPossibleValues.size) {
            delete filterState.activeFilters[field];
        } else {
            // Otherwise, filter by selected values
            filterState.activeFilters[field] = selectedValues;
        }
    }
    
    // Apply all filters
    applyFilters();
    
    // Add visual indicator to the header
    updateFilterIndicator(field);
}

/**
 * Clear column filter for a specific field
 * @param {string} field - The field to clear filter for
 */
function clearColumnFilter(field) {
    // Reset all checkboxes to checked
    const optionsContainer = document.getElementById(`${field}FilterOptions`);
    const checkboxes = optionsContainer.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
    });
    
    // Reset selected filter options
    filterState.selectedFilterOptions[field] = {};
    dataStore.getData().forEach(entry => {
        if (field === 'direction' && Array.isArray(entry.direction)) {
            entry.direction.forEach(dir => {
                if (dir) filterState.selectedFilterOptions[field][String(dir)] = true;
            });
        } else if (entry[field]) {
            const value = String(entry[field]);
            filterState.selectedFilterOptions[field][value] = true;
        }
    });
    
    // Remove this field from active filters
    delete filterState.activeFilters[field];
    
    // Apply all filters
    applyFilters();
    
    // Remove visual indicator from the header
    updateFilterIndicator(field);
}

/**
 * Update filter indicator on header
 * @param {string} field - The field to update indicator for
 */
function updateFilterIndicator(field) {
    const header = document.querySelector(`th[data-field="${field}"]`);
    const filterIcon = header.querySelector('.filter-icon');
    
    if (filterState.activeFilters[field]) {
        filterIcon.textContent = '🔍'; // Filtered icon
        filterIcon.style.color = '#0066cc';
    } else {
        filterIcon.textContent = '⚙'; // Default icon
        filterIcon.style.color = '#666';
    }
}

/**
 * Reset all filters
 */
function resetFilters() {
    // Reset all filter dropdowns
    document.querySelectorAll('.filter-options').forEach(container => {
        const field = container.id.replace('FilterOptions', '');
        const checkboxes = container.querySelectorAll('input[type="checkbox"]');
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
        
        // Reset selected filter options
        filterState.selectedFilterOptions[field] = {};
        dataStore.getData().forEach(entry => {
            if (field === 'direction' && Array.isArray(entry.direction)) {
                entry.direction.forEach(dir => {
                    if (dir) filterState.selectedFilterOptions[field][String(dir)] = true;
                });
            } else if (entry[field]) {
                const value = String(entry[field]);
                if (value) filterState.selectedFilterOptions[field][value] = true;
            }
        });
    });
    
    // Clear search input
    document.getElementById('searchInput').value = '';
    
    // Reset filter type to 'all'
    document.getElementById('filterType').value = 'all';
    
    // Reset year selector to 'all' if it exists
    const yearSelector = document.getElementById('yearSelector');
    if (yearSelector) {
        yearSelector.value = 'all';
    }
    
    // Clear active filters
    filterState.activeFilters = {};
    
    // Reset filter indicators
    document.querySelectorAll('.filter-icon').forEach(icon => {
        icon.textContent = '⚙';
        icon.style.color = '#666';
    });
    
    // Apply current sort if any, otherwise show all data
    applyFilters();
}

/**
 * Apply all active filters
 */
function applyFilters() {
    // Start with search filter
    let filteredData = applySearchFilter(dataStore.getData());
    
    // Apply column filters
    if (Object.keys(filterState.activeFilters).length > 0) {
        filteredData = filteredData.filter(entry => {
            // Entry must match all active filter conditions
            return Object.entries(filterState.activeFilters).every(([field, values]) => {
                // If values is an array, check if entry's field value is in the array
                if (field === 'direction' && Array.isArray(entry.direction)) {
                    // If entry.direction is an array, check if any of its values are in the selected filter values
                    return entry.direction.some(dir => values.includes(String(dir)));
                } else if (Array.isArray(values)) {
                    // For other fields, or if entry.direction is not an array but values is (should not happen for single value fields)
                    return values.includes(String(entry[field]));
                }
                // Fallback for old format or single value check (should ideally not be hit if values is always an array from activeFilters)
                return String(entry[field]) === String(values);
            });
        });
    }
    
    // Apply current sort if any
    const sortService = window.sortService;
    if (sortService.getCurrentSortField()) {
        filteredData = sortDataArray(
            filteredData, 
            sortService.getCurrentSortField(), 
            sortService.getCurrentSortDirection()
        );
    }
    
    // Display the filtered data
    displayData(filteredData);
}

/**
 * Apply search filter only
 * @param {Array} data - The data to filter
 * @returns {Array} Filtered data
 */
function applySearchFilter(data) {
    const searchInput = document.getElementById('searchInput');
    const filterType = document.getElementById('filterType');
    const searchTerm = searchInput.value.toLowerCase();
    const filterValue = filterType.value;
    
    if (searchTerm === '') {
        return data;
    }
    
    return data.filter(entry => {
        if (filterValue === 'all') {
            // Search in all fields
            return Object.entries(entry).some(([key, value]) => {
                if (key === 'direction' && Array.isArray(value)) {
                    return value.some(dir => String(dir).toLowerCase().includes(searchTerm));
                }
                return String(value).toLowerCase().includes(searchTerm);
            });
        } else {
            // Search in the specific field
            if (filterValue === 'direction' && Array.isArray(entry.direction)) {
                return entry.direction.some(dir => String(dir).toLowerCase().includes(searchTerm));
            }
            return String(entry[filterValue]).toLowerCase().includes(searchTerm);
        }
    });
}

/**
 * Filter dropdown options based on search input
 * @param {string} field - The field to filter options for
 * @param {string} searchTerm - The search term
 */
function filterDropdownOptions(field, searchTerm) {
    const optionsContainer = document.getElementById(`${field}FilterOptions`);
    const options = optionsContainer.querySelectorAll('.filter-option:not(:first-child)'); // Skip Select All
    
    options.forEach(option => {
        const label = option.querySelector('label').textContent.toLowerCase();
        if (label.includes(searchTerm)) {
            option.style.display = 'flex';
        } else {
            option.style.display = 'none';
        }
    });
}

/**
 * Filter data based on search input and filter type
 */
function filterData() {
    // Apply all filters
    applyFilters();
}

export { 
    filterState, 
    applyColumnFilter, 
    clearColumnFilter, 
    resetFilters, 
    applyFilters, 
    filterDropdownOptions, 
    filterData 
};
