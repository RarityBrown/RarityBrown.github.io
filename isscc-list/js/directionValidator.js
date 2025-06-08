/**
 * Direction Validator - Ensures direction values are strictly validated against schema
 */

import dataStore from './dataService.js';

const directionValidator = {
    /**
     * Validate a direction value or array against the schema
     * @param {string|string[]} direction - Direction value(s) to validate
     * @returns {string[]} - Validated direction array
     */
    validateDirection(direction) {
        // Get valid directions from schema
        const validDirections = dataStore.getSchema().directions || [];
        
        // If no valid directions in schema, return empty array
        if (validDirections.length === 0) {
            return [];
        }
        
        // Ensure direction is an array
        let directionArray = direction || [];
        if (!Array.isArray(directionArray)) {
            directionArray = [directionArray];
        }
        
        // Filter out invalid directions
        let validatedDirections = directionArray.filter(dir => 
            dir && validDirections.includes(String(dir))
        );
        
        // If no valid directions, use first valid direction from schema
        if (validatedDirections.length === 0) {
            validatedDirections = [validDirections[0]];
        }
        
        return validatedDirections;
    },
    
    /**
     * Get all valid directions from schema
     * @returns {string[]} - Array of valid directions
     */
    getValidDirections() {
        return dataStore.getSchema().directions || [];
    },
    
    /**
     * Create a direction selector dropdown
     * @param {string[]} selectedDirections - Currently selected directions
     * @param {Function} onChange - Callback when selection changes
     * @returns {HTMLElement} - Direction selector element
     */
    createDirectionSelector(selectedDirections = [], onChange = null) {
        const validDirections = this.getValidDirections();
        
        // Create container
        const container = document.createElement('div');
        container.className = 'direction-selector';
        
        // Create checkboxes for each valid direction
        validDirections.forEach(direction => {
            const isSelected = selectedDirections.includes(direction);
            
            const option = document.createElement('div');
            option.className = 'direction-option';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `direction-${direction}`;
            checkbox.checked = isSelected;
            checkbox.value = direction;
            
            if (onChange) {
                checkbox.addEventListener('change', () => {
                    // Get all selected directions
                    const selected = Array.from(
                        container.querySelectorAll('input[type="checkbox"]:checked')
                    ).map(cb => cb.value);
                    
                    // Call onChange with selected directions
                    onChange(selected);
                });
            }
            
            const label = document.createElement('label');
            label.htmlFor = `direction-${direction}`;
            label.textContent = direction;
            
            option.appendChild(checkbox);
            option.appendChild(label);
            container.appendChild(option);
        });
        
        return container;
    }
};

export default directionValidator;
