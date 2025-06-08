/**
 * Sort Service - Handles all sorting functionality
 */

import { applyFilters } from './filterService.js';

// Sorting state
const sortState = {
    currentSortField: '',
    currentSortDirection: 'asc',
    
    // Get current sort field
    getCurrentSortField() {
        return this.currentSortField;
    },
    
    // Get current sort direction
    getCurrentSortDirection() {
        return this.currentSortDirection;
    }
};

/**
 * Sort data by a specific field
 * @param {string} field - The field to sort by
 */
function sortData(field) {
    // If clicking the same header, toggle sort direction
    if (field === sortState.currentSortField) {
        sortState.currentSortDirection = sortState.currentSortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortState.currentSortField = field;
        sortState.currentSortDirection = 'asc';
    }
    
    // Apply all filters with the new sort
    applyFilters();
}

/**
 * Helper function to sort an array of data
 * @param {Array} data - The data to sort
 * @param {string} field - The field to sort by
 * @param {string} direction - The sort direction ('asc' or 'desc')
 * @returns {Array} Sorted data
 */
function sortDataArray(data, field, direction) {
    return [...data].sort((a, b) => {
        let valueA = a[field];
        let valueB = b[field];
        
        // Handle numeric fields
        if (field === 'year') {
            valueA = Number(valueA);
            valueB = Number(valueB);
        } else {
            // Convert to lowercase strings for string comparison
            valueA = String(valueA).toLowerCase();
            valueB = String(valueB).toLowerCase();
        }
        
        // Compare values
        if (valueA < valueB) {
            return direction === 'asc' ? -1 : 1;
        }
        if (valueA > valueB) {
            return direction === 'asc' ? 1 : -1;
        }
        
        // Use originalIndex as tie-breaker to ensure stable sorting
        return a.originalIndex - b.originalIndex;
    });
}

/**
 * Update sort indicators in the table headers
 */
function updateSortIndicators() {
    const sortableHeaders = document.querySelectorAll('th.sortable');
    
    // Remove all sort classes
    sortableHeaders.forEach(header => {
        header.classList.remove('sort-asc', 'sort-desc');
    });
    
    // Add sort class to the current sort header
    if (sortState.currentSortField) {
        const currentHeader = document.querySelector(`th[data-field="${sortState.currentSortField}"]`);
        if (currentHeader) {
            currentHeader.classList.add(`sort-${sortState.currentSortDirection}`);
        }
    }
}

export { 
    sortState, 
    sortData, 
    sortDataArray, 
    updateSortIndicators 
};
