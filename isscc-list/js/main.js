/**
 * Main Application Entry Point
 */

import dataStore from './dataService.js';
import { filterState, applyColumnFilter, clearColumnFilter, resetFilters, applyFilters, filterDropdownOptions, filterData } from './filterService.js';
import { sortState, sortData, sortDataArray, updateSortIndicators } from './sortService.js';
import { displayData, populateFilterDropdowns, setupEventListeners } from './uiService.js';

// Make services available globally for cross-module references
window.dataStore = dataStore;
window.filterModule = { 
    filterState, 
    applyColumnFilter, 
    clearColumnFilter, 
    resetFilters, 
    applyFilters, 
    filterDropdownOptions, 
    filterData 
};
window.sortModule = { 
    sortState, 
    sortData, 
    sortDataArray, 
    updateSortIndicators 
};
window.sortService = sortState;

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Load data and initialize UI
        const data = await dataStore.loadData();
        
        // Update year filter dropdown if we have multiple years
        const yearSelector = document.getElementById('yearSelector');
        if (yearSelector) {
            const availableYears = dataStore.getAvailableYears();
            if (availableYears.length > 1) {
                yearSelector.innerHTML = '';
                yearSelector.innerHTML = '<option value="all">All Years</option>';
                availableYears.forEach(year => {
                    yearSelector.innerHTML += `<option value="${year}">${year}</option>`;
                });
                yearSelector.style.display = 'inline-block';
            } else {
                yearSelector.style.display = 'none';
            }
        }
        
        // Populate filter dropdowns
        populateFilterDropdowns(data);
        
        // Display initial data
        displayData(data);
        
        // Setup event listeners
        setupEventListeners();
    } catch (error) {
        console.error('Error initializing application:', error);
        const tableBody = document.getElementById('tableBody');
        tableBody.innerHTML = `<tr><td colspan="9">Error loading data. Please try again later.</td></tr>`;
    }
});
