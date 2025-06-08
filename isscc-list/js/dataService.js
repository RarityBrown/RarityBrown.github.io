/**
 * Data Service - Handles data fetching and processing
 */

// Data store
const dataStore = {
    originalData: [],
    schema: {
        directions: []
    },
    availableYears: [],
    
    // Load schema data
    async loadSchema() {
        try {
            const response = await fetch('data/schema.json');
            const schema = await response.json();
            if (schema.directions) {
                this.schema.directions = schema.directions;
            }
            // Also load years data if available in schema.json
            if (schema.years) {
                this.availableYears = schema.years.sort((a, b) => b - a); // Sort descending
            }
            return this.schema;
        } catch (error) {
            console.error('Error loading schema:', error);
            throw error;
        }
    },
    
    // Load data for a specific year
    async loadYearData(year) {
        try {
            const response = await fetch(`data/${year}.json`);
            const data = await response.json();
            
            // Validate and process entries
            const processedEntries = data.entries.map((entry, index) => {
                // Ensure direction is always an array
                let directions = entry.direction || [];
                if (!Array.isArray(directions)) {
                    directions = [directions];
                }
                
                // Strictly validate against schema - only keep valid directions
                directions = directions.filter(dir => this.schema.directions.includes(dir));
                
                // If no valid directions, assign the first available direction
                if (directions.length === 0 && this.schema.directions.length > 0) {
                    directions = [this.schema.directions[0]];
                }
                
                return {
                    ...entry,
                    direction: directions,
                    originalIndex: index
                };
            });
            
            return processedEntries;
        } catch (error) {
            console.error(`Error loading data for year ${year}:`, error);
            return [];
        }
    },
    
    // Discover available years from schema.json
    async discoverAvailableYears() {
        try {
            // Years are now loaded as part of the schema in loadSchema()
            // If they haven't been loaded yet, try to load them
            if (!this.availableYears || this.availableYears.length === 0) {
                await this.loadSchema();
            }
            
            // If we still don't have years, use the default
            if (!this.availableYears || this.availableYears.length === 0) {
                this.availableYears = [2025];
            }
            
            return this.availableYears;
        } catch (error) {
            console.error('Error discovering available years:', error);
            return [];
        }
    },
    
    // Load all data
    async loadData() {
        try {
            // First load the schema
            await this.loadSchema();
            
            // Discover available years
            await this.discoverAvailableYears();
            
            // Load data for each year
            this.originalData = [];
            for (const year of this.availableYears) {
                const yearData = await this.loadYearData(year);
                this.originalData = [...this.originalData, ...yearData];
            }
            
            return this.originalData;
        } catch (error) {
            console.error('Error loading all data:', error);
            throw error;
        }
    },
    
    // Get all data
    getData() {
        return this.originalData;
    },
    
    // Get available years
    getAvailableYears() {
        return this.availableYears;
    },
    
    // Get schema
    getSchema() {
        return this.schema;
    }
};

export default dataStore;
