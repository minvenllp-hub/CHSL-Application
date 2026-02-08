// CHSL Expense Categories Module - FINAL IMPROVED VERSION
// Includes all feedback improvements

// Embedded data with your requirements
const embeddedCSVData = [
    // No sub-levels (Level2 = "None")
    { level1: "BMC Water Charges", level2: "None", level3: "None", level4: "None", status: "Active" },
    { level1: "Audit Fees", level2: "None", level3: "None", level4: "None", status: "Active" },
    { level1: "Security Charges", level2: "None", level3: "None", level4: "None", status: "Active" },
    { level1: "Federation/Subscription", level2: "None", level3: "None", level4: "None", status: "Active" },
    { level1: "Insurance Expenses", level2: "None", level3: "None", level4: "None", status: "Active" },
    
    // With sub-levels - Property Tax
    { level1: "Property Tax", level2: "Society Common Areas", level3: "None", level4: "None", status: "Active" },
    { level1: "Property Tax", level2: "Parking", level3: "None", level4: "None", status: "Active" },
    
    // With sub-levels - Electricity
    { level1: "Electricity", level2: "Meter 1", level3: "Power Bill", level4: "Monthly", status: "Active" },
    { level1: "Electricity", level2: "Meter 2", level3: "Power Bill", level4: "Monthly", status: "Active" },
    
    // Other categories
    { level1: "Housekeeping", level2: "Monthly Contract", level3: "None", level4: "None", status: "Active" },
    { level1: "Lift Maintenance", level2: "AMC", level3: "Contractual", level4: "None", status: "Active" },
    { level1: "Accounting", level2: "Monthly Fees", level3: "None", level4: "None", status: "Active" },
    { level1: "Salaries", level2: "Gym Trainer", level3: "None", level4: "None", status: "Active" },
    { level1: "Gardening", level2: "Maintenance", level3: "None", level4: "None", status: "Active" },
    { level1: "Pest Control", level2: "Monthly Service", level3: "None", level4: "None", status: "Active" },
    
    // Bank Charges
    { level1: "Bank Charges", level2: "Recoverable", level3: "None", level4: "None", status: "Active" },
    { level1: "Bank Charges", level2: "Locker Rent", level3: "None", level4: "None", status: "Active" },
    
    // Free Format examples
    { level1: "Fixed Assets", level2: "Water Pump", level3: "Free Format", level4: "Free Format", status: "Active" },
    { level1: "Fixed Assets", level2: "Furniture", level3: "Free Format", level4: "Free Format", status: "Active" },
    
    // Repairs & Maintenance
    { level1: "Repairs", level2: "AMC Expenses", level3: "Water Pump", level4: "Free Format", status: "Active" },
    { level1: "Repairs", level2: "AMC Expenses", level3: "Electrical", level4: "Free Format", status: "Active" }
];

// Load categories from localStorage or initialize empty
let categories = JSON.parse(localStorage.getItem('chsl_categories')) || [];
let nextId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
let uploadedData = [];

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    initCategories();
    renderCategories();
    updateStats();
    updateExportButton();
    
    showMessage('Expense Categories Management System ready. Click "Load Default Categories" to start.', 'info');
});

// Load default embedded data
function loadDefaultData() {
    if (categories.length > 0 && !confirm('This will replace existing data with default categories. Continue?')) {
        return;
    }
    
    categories = [];
    nextId = 1;
    
    embeddedCSVData.forEach(row => {
        const level1 = row.level1;
        const level2 = row.level2 === "None" ? "" : row.level2;
        const level3 = row.level3 === "None" ? "" : row.level3;
        const level4 = row.level4 === "None" ? "" : row.level4;
        const status = row.status;
        
        const finalLevel3 = level3 === "Free Format" ? "_freeformat" : level3;
        const finalLevel4 = level4 === "Free Format" ? "_freeformat" : level4;
        
        categories.push({
            id: nextId++,
            level1: level1,
            level2: level2,
            level3: finalLevel3,
            level4: finalLevel4,
            status: status,
            hasFreeFormatL3: level3 === "Free Format",
            hasFreeFormatL4: level4 === "Free Format"
        });
    });
    
    localStorage.setItem('chsl_categories', JSON.stringify(categories));
    
    initCategories();
    renderCategories();
    updateStats();
    updateExportButton();
    
    showMessage(`Loaded ${categories.length} default expense types.`, 'success');
}

function initCategories() {
    const level1Select = document.getElementById('level1');
    level1Select.innerHTML = '<option value="">Select Major Expense Head</option>';
    
    const level1Values = [...new Set(categories.map(c => c.level1).filter(l1 => l1))];
    
    level1Values.sort().forEach(level1 => {
        const option = document.createElement('option');
        option.value = level1;
        option.textContent = level1;
        level1Select.appendChild(option);
    });
    
    const newOption = document.createElement('option');
    newOption.value = "_new";
    newOption.textContent = "➕ Add New Major Expense Head...";
    level1Select.appendChild(newOption);
    
    // Add input handler for new entries
    level1Select.addEventListener('change', function() {
        if (this.value === "_new") {
            const input = promptWithValidation('Enter new Major Expense Head (max 25 characters):', '', true);
            if (input && input.trim()) {
                const validatedInput = validateAndTrimInput(input);
                if (validatedInput) {
                    // Add the new value
                    const option = document.createElement('option');
                    option.value = validatedInput;
                    option.textContent = validatedInput;
                    option.selected = true;
                    
                    // Insert after the first option
                    const firstOption = level1Select.querySelector('option:first-child');
                    level1Select.insertBefore(option, firstOption.nextSibling);
                    
                    // Remove the "_new" option temporarily
                    const newOption = level1Select.querySelector('option[value="_new"]');
                    newOption.remove();
                    
                    updateLevel2();
                    
                    // Re-add the "_new" option
                    level1Select.appendChild(newOption);
                }
            } else if (input === "") {
                // User cancelled or entered empty
                this.value = "";
            }
        }
    });
}

function updateLevel2() {
    const level1 = document.getElementById('level1').value;
    const level2Select = document.getElementById('level2');
    const level3Row = document.getElementById('level3-row');
    
    level2Select.innerHTML = '<option value="">Select Minor Expense Head</option>';
    level3Row.style.display = 'none';
    document.getElementById('level3').innerHTML = '<option value="">Select Minor Expense Head first</option>';
    document.getElementById('level4').innerHTML = '<option value="">Select Why Spent first</option>';
    document.getElementById('freeTextGroup').style.display = 'none';
    
    if (!level1) return;
    
    if (level1 === "_new") {
        level2Select.innerHTML += '<option value="_new">➕ Add New Minor Expense Head...</option>';
        return;
    }
    
    const level2Values = [...new Set(
        categories
            .filter(c => c.level1 === level1 && c.level2)
            .map(c => c.level2)
    )].filter(v => v !== "_freeformat");
    
    if (level2Values.length === 0) {
        level2Select.innerHTML += '<option value="_new">➕ Add New Minor Expense Head...</option>';
        return;
    }
    
    level2Values.sort().forEach(level2 => {
        const option = document.createElement('option');
        option.value = level2;
        option.textContent = level2;
        level2Select.appendChild(option);
    });
    
    level2Select.innerHTML += '<option value="_new">➕ Add New Minor Expense Head...</option>';
    
    if (level2Values.length > 0) {
        level3Row.style.display = 'flex';
    }
    
    // Add input handler for new Level 2
    level2Select.addEventListener('change', function() {
        if (this.value === "_new") {
            const level1Value = document.getElementById('level1').value;
            if (!level1Value || level1Value === "_new") {
                showMessage('Please select a Major Expense Head first', 'error');
                this.value = "";
                return;
            }
            
            const input = promptWithValidation('Enter new Minor Expense Head (max 25 characters):', '', true);
            if (input && input.trim()) {
                const validatedInput = validateAndTrimInput(input);
                if (validatedInput) {
                    const option = document.createElement('option');
                    option.value = validatedInput;
                    option.textContent = validatedInput;
                    option.selected = true;
                    this.appendChild(option);
                    
                    const newOption = this.querySelector('option[value="_new"]');
                    newOption.remove();
                    
                    updateLevel3();
                    level3Row.style.display = 'flex';
                    
                    this.appendChild(newOption);
                } else {
                    this.value = "";
                }
            } else {
                this.value = "";
            }
        }
    });
}

function updateLevel3() {
    const level1 = document.getElementById('level1').value;
    const level2 = document.getElementById('level2').value;
    const level3Select = document.getElementById('level3');
    const level4Select = document.getElementById('level4');
    
    level3Select.innerHTML = '<option value="">Select Why Spent</option>';
    level4Select.innerHTML = '<option value="">Select Why Spent first</option>';
    document.getElementById('freeTextGroup').style.display = 'none';
    
    if (!level2 || level2 === "_new") {
        level3Select.innerHTML = '<option value="_new">➕ Add New Why Spent...</option>';
        return;
    }
    
    const hasFreeFormatL3 = categories.some(c => 
        c.level1 === level1 && 
        c.level2 === level2 && 
        c.hasFreeFormatL3
    );
    
    if (hasFreeFormatL3) {
        level3Select.style.display = 'none';
        document.getElementById('freeTextGroup').style.display = 'block';
        return;
    }
    
    const level3Values = [...new Set(
        categories
            .filter(c => 
                c.level1 === level1 && 
                c.level2 === level2 && 
                c.level3 && 
                c.level3 !== "_freeformat"
            )
            .map(c => c.level3)
    )];
    
    level3Values.sort().forEach(level3 => {
        const option = document.createElement('option');
        option.value = level3;
        option.textContent = level3;
        level3Select.appendChild(option);
    });
    
    level3Select.innerHTML += '<option value="_new">➕ Add New Why Spent...</option>';
    level3Select.innerHTML += '<option value="freeformat">Free Format Entry</option>';
    
    // Add input handler for new Level 3
    level3Select.addEventListener('change', function() {
        if (this.value === "_new") {
            const input = promptWithValidation('Enter new Why Spent (max 25 characters):', '', true);
            if (input && input.trim()) {
                const validatedInput = validateAndTrimInput(input);
                if (validatedInput) {
                    const option = document.createElement('option');
                    option.value = validatedInput;
                    option.textContent = validatedInput;
                    option.selected = true;
                    this.appendChild(option);
                    
                    const freeFormatOption = this.querySelector('option[value="freeformat"]');
                    if (freeFormatOption) freeFormatOption.remove();
                    const newOption = this.querySelector('option[value="_new"]');
                    newOption.remove();
                    
                    updateLevel4();
                    
                    this.appendChild(newOption);
                    this.appendChild(freeFormatOption);
                } else {
                    this.value = "";
                }
            } else {
                this.value = "";
            }
        }
    });
}

function updateLevel4() {
    const level1 = document.getElementById('level1').value;
    const level2 = document.getElementById('level2').value;
    const level3 = document.getElementById('level3').value;
    const level4Select = document.getElementById('level4');
    
    level4Select.innerHTML = '<option value="">Select Spent For</option>';
    document.getElementById('freeTextGroup').style.display = 'none';
    
    if (!level3 || level3 === "_new") {
        level4Select.innerHTML = '<option value="_new">➕ Add New Spent For...</option>';
        level4Select.innerHTML += '<option value="freeformat">Free Format Entry</option>';
        return;
    }
    
    if (level3 === "freeformat") {
        level4Select.style.display = 'none';
        document.getElementById('freeTextGroup').style.display = 'block';
        return;
    }
    
    const hasFreeFormatL4 = categories.some(c => 
        c.level1 === level1 && 
        c.level2 === level2 && 
        c.level3 === level3 && 
        c.hasFreeFormatL4
    );
    
    if (hasFreeFormatL4) {
        level4Select.style.display = 'none';
        document.getElementById('freeTextGroup').style.display = 'block';
        return;
    }
    
    const level4Values = [...new Set(
        categories
            .filter(c => 
                c.level1 === level1 && 
                c.level2 === level2 && 
                c.level3 === level3 && 
                c.level4 && 
                c.level4 !== "_freeformat"
            )
            .map(c => c.level4)
    )];
    
    level4Values.sort().forEach(level4 => {
        const option = document.createElement('option');
        option.value = level4;
        option.textContent = level4;
        level4Select.appendChild(option);
    });
    
    level4Select.innerHTML += '<option value="_new">➕ Add New Spent For...</option>';
    level4Select.innerHTML += '<option value="freeformat">Free Format Entry</option>';
    
    // Add input handler for new Level 4
    level4Select.addEventListener('change', function() {
        if (this.value === "_new") {
            const input = promptWithValidation('Enter new Spent For (max 25 characters):', '', true);
            if (input && input.trim()) {
                const validatedInput = validateAndTrimInput(input);
                if (validatedInput) {
                    const option = document.createElement('option');
                    option.value = validatedInput;
                    option.textContent = validatedInput;
                    option.selected = true;
                    this.appendChild(option);
                    
                    const freeFormatOption = this.querySelector('option[value="freeformat"]');
                    if (freeFormatOption) freeFormatOption.remove();
                    const newOption = this.querySelector('option[value="_new"]');
                    newOption.remove();
                    
                    this.appendChild(newOption);
                    this.appendChild(freeFormatOption);
                } else {
                    this.value = "";
                }
            } else {
                this.value = "";
            }
        }
    });
}

// Enhanced prompt with validation
function promptWithValidation(message, defaultValue, showCharLimit = false) {
    const charLimitText = showCharLimit ? " (max 25 characters)" : "";
    const input = prompt(message + charLimitText, defaultValue);
    
    if (input === null) return null; // User cancelled
    
    const validated = validateAndTrimInput(input);
    if (validated === false && input.trim() !== "") {
        alert("Invalid input:\n• Maximum 25 characters\n• Only alphanumeric, spaces, and basic punctuation\n• No consecutive repeated characters");
        return promptWithValidation(message, defaultValue, showCharLimit);
    }
    
    return validated;
}

// Input validation function
function validateAndTrimInput(input) {
    if (!input) return "";
    
    const trimmed = input.trim();
    if (trimmed === "") return "";
    
    // Check length
    if (trimmed.length > 25) {
        return false;
    }
    
    // Check for valid characters (alphanumeric, spaces, basic punctuation)
    if (!/^[a-zA-Z0-9\s\-&.,()/]+$/.test(trimmed)) {
        return false;
    }
    
    // Check for consecutive identical characters (3 or more)
    if (/(\w)\1{2,}/.test(trimmed)) {
        return false;
    }
    
    // Check for consecutive identical characters including spaces (5 or more)
    if (/(.)\1{4,}/.test(trimmed)) {
        return false;
    }
    
    return trimmed;
}

function saveCategory() {
    const editId = document.getElementById('editId').value;
    const isLevel1Edit = document.getElementById('isLevel1Edit').value === "true";
    let level1 = document.getElementById('level1').value;
    let level2 = document.getElementById('level2').value;
    let level3 = document.getElementById('level3').value;
    let level4 = document.getElementById('level4').value;
    const status = document.getElementById('status').value;
    const freeText = document.getElementById('freeText').value.trim();
    
    // Validate inputs
    if (level1 && !validateAndTrimInput(level1)) {
        showMessage('Invalid Major Expense Head. Max 25 chars, alphanumeric only.', 'error');
        return;
    }
    
    if (level2 && !validateAndTrimInput(level2)) {
        showMessage('Invalid Minor Expense Head. Max 25 chars, alphanumeric only.', 'error');
        return;
    }
    
    if (level3 && level3 !== "freeformat" && !validateAndTrimInput(level3)) {
        showMessage('Invalid Why Spent. Max 25 chars, alphanumeric only.', 'error');
        return;
    }
    
    if (level4 && level4 !== "freeformat" && !validateAndTrimInput(level4)) {
        showMessage('Invalid Spent For. Max 25 chars, alphanumeric only.', 'error');
        return;
    }
    
    if (freeText && !validateAndTrimInput(freeText)) {
        showMessage('Invalid free format text. Max 25 chars, alphanumeric only.', 'error');
        return;
    }
    
    // Handle free format
    if (level3 === "freeformat") {
        level3 = "_freeformat";
        if (!freeText) {
            showMessage('Please enter free format text for Why Spent', 'error');
            return;
        }
    }
    
    if (level4 === "freeformat") {
        level4 = "_freeformat";
        if (!freeText) {
            showMessage('Please enter free format text for Spent For', 'error');
            return;
        }
    }
    
    // Validate required fields
    if (!level1) {
        showMessage('Major Expense Head is required', 'error');
        return;
    }
    
    if (!level2) {
        showMessage('Minor Expense Head is required', 'error');
        return;
    }
    
    if (!level3) {
        showMessage('Why Spent is required', 'error');
        return;
    }
    
    // Cannot edit Level 1
    if (editId && isLevel1Edit) {
        showMessage('Cannot edit Major Expense Head. You can only add new ones.', 'error');
        return;
    }
    
    // Check for duplicates
    const isDuplicate = categories.some(c => 
        c.id.toString() !== editId &&
        c.level1 === level1 &&
        c.level2 === level2 &&
        c.level3 === level3 &&
        c.level4 === level4
    );
    
    if (isDuplicate) {
        showMessage('This expense type combination already exists!', 'error');
        return;
    }
    
    // Save expense type
    const expenseType = {
        id: editId ? parseInt(editId) : nextId++,
        level1: level1,
        level2: level2,
        level3: level3,
        level4: level4,
        status: status,
        hasFreeFormatL3: level3 === "_freeformat",
        hasFreeFormatL4: level4 === "_freeformat",
        freeTextValue: freeText || null
    };
    
    if (editId) {
        const index = categories.findIndex(c => c.id.toString() === editId);
        categories[index] = expenseType;
        showMessage('Expense type updated successfully!', 'success');
    } else {
        categories.push(expenseType);
        showMessage('Expense type added successfully!', 'success');
    }
    
    localStorage.setItem('chsl_categories', JSON.stringify(categories));
    
    clearForm();
    initCategories();
    renderCategories();
    updateStats();
    updateExportButton();
}

function renderCategories() {
    const container = document.getElementById('categoriesList');
    
    if (categories.length === 0) {
        container.innerHTML = `
            <div class="no-data-message">
                <i class="fas fa-folder-open"></i>
                <h3>No expense types loaded yet</h3>
                <p>Click "Load Default Categories" in the Add/Edit tab to start</p>
            </div>
        `;
        return;
    }
    
    let html = '';
    const grouped = categories.reduce((acc, cat) => {
        if (!acc[cat.level1]) acc[cat.level1] = [];
        acc[cat.level1].push(cat);
        return acc;
    }, {});
    
    Object.keys(grouped).sort().forEach(level1 => {
        const level1Items = grouped[level1];
        const hasLevel2Items = level1Items.some(cat => cat.level2);
        
        if (!hasLevel2Items) {
            // No sub-levels
            html += `
                <div class="tree-item" data-id="${level1Items[0].id}">
                    <div class="tree-level">
                        <span class="level-indicator level-1">MEH</span>
                        <strong>${level1}</strong>
                        <span class="no-sublevels">(No sub-levels)</span>
                        <span class="status-badge ${level1Items[0]?.status.toLowerCase()}">${level1Items[0]?.status}</span>
                    </div>
                    <div class="actions">
                        <button class="action-btn disabled" title="Cannot edit Major Expense Head">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="deleteExpenseType(${level1Items[0].id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        } else {
            // Has sub-levels
            html += `
                <div class="tree-item">
                    <div class="tree-level">
                        <span class="level-indicator level-1">MEH</span>
                        <strong>${level1}</strong>
                        <span class="level-description">(Major Expense Head)</span>
                    </div>
                    <div class="actions">
                        <button class="action-btn disabled" title="Cannot edit Major Expense Head">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
            `;
            
            const level2Groups = level1Items.reduce((acc, cat) => {
                if (!acc[cat.level2]) acc[cat.level2] = [];
                acc[cat.level2].push(cat);
                return acc;
            }, {});
            
            Object.keys(level2Groups).sort().forEach(level2 => {
                if (!level2) return;
                
                const level2Items = level2Groups[level2];
                const level2Id = level2Items[0]?.id;
                const hasLevel3Items = level2Items.some(cat => cat.level3 && cat.level3 !== "_freeformat");
                
                html += `
                    <div class="tree-item" style="padding-left: 40px; background: #f9f9f9;" data-id="${level2Id}">
                        <div class="tree-level">
                            <span class="level-indicator level-2">MIH</span>
                            ${level2}
                            <span class="level-description">(Minor Expense Head)</span>
                        </div>
                        <div class="actions">
                            <button class="action-btn" onclick="editLevel2('${level1}', '${level2}')" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="action-btn delete" onclick="deleteLevel2('${level1}', '${level2}')" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                `;
                
                if (hasLevel3Items) {
                    const level3Groups = level2Items.reduce((acc, cat) => {
                        if (!acc[cat.level3]) acc[cat.level3] = [];
                        acc[cat.level3].push(cat);
                        return acc;
                    }, {});
                    
                    Object.keys(level3Groups).sort().forEach(level3 => {
                        if (!level3 || level3 === "_freeformat") return;
                        
                        const level3Items = level3Groups[level3];
                        const level3Id = level3Items[0]?.id;
                        const hasLevel4Items = level3Items.some(cat => cat.level4 && cat.level4 !== "_freeformat");
                        
                        const displayLevel3 = level3Items[0]?.hasFreeFormatL3 ? 
                            `Free Format: ${level3Items[0]?.freeTextValue || 'User Entry'}` : 
                            level3;
                        
                        html += `
                            <div class="tree-item" style="padding-left: 70px; background: #f0f0f0;" data-id="${level3Id}">
                                <div class="tree-level">
                                    <span class="level-indicator level-3">WS</span>
                                    ${displayLevel3}
                                    <span class="level-description">(Why Spent)</span>
                                    ${level3Items[0]?.hasFreeFormatL3 ? '<span class="free-format-indicator">Free Format</span>' : ''}
                                </div>
                                <div class="actions">
                                    <button class="action-btn" onclick="editLevel3('${level1}', '${level2}', '${level3}')" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="action-btn delete" onclick="deleteLevel3('${level1}', '${level2}', '${level3}')" title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        `;
                        
                        if (hasLevel4Items) {
                            level3Items.forEach(cat => {
                                if (!cat.level4 || cat.level4 === "_freeformat") return;
                                
                                const displayLevel4 = cat.hasFreeFormatL4 ? 
                                    `Free Format: ${cat.freeTextValue || 'User Entry'}` : 
                                    cat.level4;
                                
                                html += `
                                    <div class="tree-item" style="padding-left: 100px;" data-id="${cat.id}">
                                        <div class="tree-level">
                                            <span class="level-indicator level-4">SF</span>
                                            ${displayLevel4}
                                            <span class="level-description">(Spent For)</span>
                                            ${cat.hasFreeFormatL4 ? '<span class="free-format-indicator">Free Format</span>' : ''}
                                            <span class="status-badge ${cat.status.toLowerCase()}">${cat.status}</span>
                                        </div>
                                        <div class="actions">
                                            <button class="action-btn" onclick="editCategory(${cat.id})" title="Edit">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button class="action-btn delete" onclick="deleteExpenseType(${cat.id})" title="Delete">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                `;
                            });
                        }
                    });
                }
            });
        }
    });
    
    container.innerHTML = html;
}

// Renamed delete functions for consistency
function deleteExpenseType(id) {
    const expenseType = categories.find(c => c.id === id);
    if (!expenseType) return;
    
    const typeName = expenseType.level4 || expenseType.level3 || expenseType.level2 || expenseType.level1;
    
    if (confirm(`Delete expense type "${typeName}"?`)) {
        categories = categories.filter(c => c.id !== id);
        localStorage.setItem('chsl_categories', JSON.stringify(categories));
        renderCategories();
        updateStats();
        updateExportButton();
        showMessage('Expense type deleted', 'success');
    }
}

function deleteLevel2(level1, level2) {
    const affectedItems = categories.filter(c => c.level1 === level1 && c.level2 === level2);
    const count = affectedItems.length;
    
    if (confirm(`Delete ${count} expense type${count > 1 ? 's' : ''} under "${level1} → ${level2}"?`)) {
        categories = categories.filter(c => !(c.level1 === level1 && c.level2 === level2));
        localStorage.setItem('chsl_categories', JSON.stringify(categories));
        initCategories();
        renderCategories();
        updateStats();
        updateExportButton();
        showMessage(`Deleted ${count} expense type${count > 1 ? 's' : ''}`, 'success');
    }
}

function deleteLevel3(level1, level2, level3) {
    const affectedItems = categories.filter(c => 
        c.level1 === level1 && 
        c.level2 === level2 && 
        c.level3 === level3
    );
    const count = affectedItems.length;
    
    if (confirm(`Delete ${count} expense type${count > 1 ? 's' : ''} under "${level1} → ${level2} → ${level3}"?`)) {
        categories = categories.filter(c => !(c.level1 === level1 && c.level2 === level2 && c.level3 === level3));
        localStorage.setItem('chsl_categories', JSON.stringify(categories));
        initCategories();
        renderCategories();
        updateStats();
        updateExportButton();
        showMessage(`Deleted ${count} expense type${count > 1 ? 's' : ''}`, 'success');
    }
}

function editCategory(id) {
    const category = categories.find(c => c.id === id);
    if (!category) return;
    
    document.getElementById('editId').value = category.id;
    document.getElementById('isLevel1Edit').value = "false";
    
    const level1Select = document.getElementById('level1');
    level1Select.value = category.level1;
    
    switchTab('add-edit');
    
    setTimeout(() => {
        updateLevel2();
        setTimeout(() => {
            document.getElementById('level2').value = category.level2;
            updateLevel3();
            
            setTimeout(() => {
                if (category.hasFreeFormatL3) {
                    document.getElementById('level3').value = "freeformat";
                    document.getElementById('freeText').value = category.freeTextValue || '';
                } else {
                    document.getElementById('level3').value = category.level3;
                }
                
                updateLevel4();
                
                setTimeout(() => {
                    if (category.hasFreeFormatL4) {
                        document.getElementById('level4').value = "freeformat";
                        document.getElementById('freeText').value = category.freeTextValue || '';
                    } else {
                        document.getElementById('level4').value = category.level4;
                    }
                    
                    document.getElementById('status').value = category.status;
                    
                    showMessage(`Editing: ${category.level1}`, 'success');
                }, 100);
            }, 100);
        }, 100);
    }, 100);
}

function editLevel2(level1, level2) {
    const newLevel2 = promptWithValidation('Enter new name for Minor Expense Head:', level2, true);
    if (newLevel2 && newLevel2.trim() && newLevel2 !== level2) {
        categories.filter(c => c.level1 === level1 && c.level2 === level2).forEach(cat => {
            cat.level2 = newLevel2.trim();
        });
        localStorage.setItem('chsl_categories', JSON.stringify(categories));
        initCategories();
        renderCategories();
        showMessage(`Updated Minor Expense Head`, 'success');
    }
}

function editLevel3(level1, level2, level3) {
    const newLevel3 = promptWithValidation('Enter new name for Why Spent:', level3, true);
    if (newLevel3 && newLevel3.trim() && newLevel3 !== level3) {
        categories.filter(c => 
            c.level1 === level1 && 
            c.level2 === level2 && 
            c.level3 === level3
        ).forEach(cat => {
            cat.level3 = newLevel3.trim();
        });
        localStorage.setItem('chsl_categories', JSON.stringify(categories));
        initCategories();
        renderCategories();
        showMessage(`Updated Why Spent`, 'success');
    }
}

function clearForm() {
    document.getElementById('editId').value = '';
    document.getElementById('isLevel1Edit').value = 'false';
    document.getElementById('level1').value = '';
    document.getElementById('level2').innerHTML = '<option value="">Select Minor Expense Head</option>';
    document.getElementById('level3').innerHTML = '<option value="">Select Why Spent</option>';
    document.getElementById('level3').style.display = 'block';
    document.getElementById('level4').innerHTML = '<option value="">Select Spent For</option>';
    document.getElementById('level4').style.display = 'block';
    document.getElementById('freeText').value = '';
    document.getElementById('charCount').textContent = '0/25 characters';
    document.getElementById('freeTextGroup').style.display = 'none';
    document.getElementById('status').value = 'Active';
    document.getElementById('level3-row').style.display = 'none';
    
    // Clear validation errors
    document.querySelectorAll('.validation-error').forEach(el => el.style.display = 'none');
    document.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
}

function updateStats() {
    document.getElementById('totalCategories').textContent = categories.length;
    document.getElementById('activeCategories').textContent = categories.filter(c => c.status === 'Active').length;
    document.getElementById('withSublevels').textContent = categories.filter(c => c.level2).length;
}

function updateExportButton() {
    const exportBtn = document.getElementById('exportButton');
    if (categories.length > 0) {
        exportBtn.style.display = 'inline-flex';
    } else {
        exportBtn.style.display = 'none';
    }
}

function showMessage(message, type) {
    const alert = document.getElementById('messageAlert');
    alert.innerHTML = message;
    alert.className = `alert alert-${type}`;
    alert.style.display = 'block';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 5000);
}

function switchTab(tabName) {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    
    document.querySelector(`.tab[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-tab`).classList.add('active');
}

// Bulk Upload Functions
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
        showMessage('Please upload a CSV file (.csv)', 'error');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            parseCSV(e.target.result);
        } catch (error) {
            showMessage(`Error reading file: ${error.message}`, 'error');
        }
    };
    reader.onerror = function() {
        showMessage('Error reading file', 'error');
    };
    reader.readAsText(file);
}

function parseCSV(csvContent) {
    const lines = csvContent.split('\n').filter(line => line.trim() !== '');
    if (lines.length === 0) {
        showMessage('CSV file is empty', 'error');
        return;
    }
    
    const headers = lines[0].split(',').map(h => h.trim());
    const requiredColumns = ['Major Expense Head', 'Minor Expense Head', 'Why Spent', 'Spent For', 'Status'];
    const missingColumns = requiredColumns.filter(col => !headers.includes(col));
    
    if (missingColumns.length > 0) {
        showMessage(`Missing columns: ${missingColumns.join(', ')}`, 'error');
        return;
    }
    
    uploadedData = [];
    const errors = [];
    let totalRows = 0;
    
    for (let i = 1; i < lines.length; i++) {
        totalRows++;
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length < 5) continue; // Skip incomplete rows
        
        const row = {
            rowNumber: i + 1,
            level1: values[headers.indexOf('Major Expense Head')] || '',
            level2: values[headers.indexOf('Minor Expense Head')] || '',
            level3: values[headers.indexOf('Why Spent')] || '',
            level4: values[headers.indexOf('Spent For')] || '',
            status: values[headers.indexOf('Status')] || ''
        };
        
        const rowErrors = validateUploadRow(row);
        
        if (rowErrors.length === 0) {
            uploadedData.push(row);
        } else {
            errors.push({ row: row.rowNumber, errors: rowErrors, data: row });
        }
    }
    
    showPreview(uploadedData, errors, totalRows);
}

function validateUploadRow(row) {
    const errors = [];
    
    // Validate each field
    if (!row.level1) errors.push('Major Expense Head is required');
    else if (!validateAndTrimInput(row.level1)) errors.push('Major Expense Head: Invalid format');
    
    if (!row.level2) errors.push('Minor Expense Head is required');
    else if (row.level2 !== "None" && !validateAndTrimInput(row.level2)) errors.push('Minor Expense Head: Invalid format');
    
    if (!row.level3) errors.push('Why Spent is required');
    else if (row.level3 !== "None" && !validateAndTrimInput(row.level3)) errors.push('Why Spent: Invalid format');
    
    if (row.level4 && row.level4 !== "None" && !validateAndTrimInput(row.level4)) {
        errors.push('Spent For: Invalid format');
    }
    
    if (!row.status) errors.push('Status is required');
    else if (!['Active', 'Inactive'].includes(row.status)) {
        errors.push('Status must be "Active" or "Inactive"');
    }
    
    return errors;
}

function showPreview(data, errors, totalRows) {
    const previewDiv = document.getElementById('csvPreview');
    const tableBody = document.querySelector('#previewTable tbody');
    const statsDiv = document.getElementById('uploadStats');
    
    if (data.length === 0 && errors.length === 0) {
        showMessage('No valid data found in file', 'error');
        return;
    }
    
    // Show upload statistics
    statsDiv.innerHTML = `
        <strong>Upload Analysis:</strong><br>
        • Total rows in file: ${totalRows}<br>
        • Valid rows: ${data.length}<br>
        • Rows with errors: ${errors.length}<br>
        ${errors.length > 0 ? '⚠️ Error rows highlighted in red. Hover to see details.' : '✓ All rows are valid'}
    `;
    
    tableBody.innerHTML = '';
    const previewRows = data.slice(0, 15); // Show first 15 rows
    
    previewRows.forEach(row => {
        const tr = document.createElement('tr');
        const rowErrors = errors.find(e => e.row === row.rowNumber);
        if (rowErrors) {
            tr.className = 'error-row';
            tr.title = rowErrors.errors.join(', ');
        }
        
        tr.innerHTML = `
            <td>${row.level1 || '<span class="none-value">(empty)</span>'}</td>
            <td>${row.level2 || '<span class="none-value">None</span>'}</td>
            <td>${row.level3 || '<span class="none-value">None</span>'}</td>
            <td>${row.level4 || '<span class="none-value">None</span>'}</td>
            <td>${row.status}</td>
        `;
        tableBody.appendChild(tr);
    });
    
    previewDiv.style.display = 'block';
    
    if (errors.length > 0) {
        showMessage(`Found ${data.length} valid rows and ${errors.length} rows with errors`, 'error');
    } else {
        showMessage(`Found ${data.length} valid rows ready for import`, 'success');
    }
}

function processUpload() {
    if (uploadedData.length === 0) {
        showMessage('No data to import', 'error');
        return;
    }
    
    let imported = 0, duplicates = 0, errors = 0;
    
    uploadedData.forEach(row => {
        const rowErrors = validateUploadRow(row);
        if (rowErrors.length > 0) {
            errors++;
            return;
        }
        
        const level1 = row.level1;
        const level2 = row.level2 === "None" ? "" : row.level2;
        const level3 = row.level3 === "None" ? "" : row.level3;
        const level4 = row.level4 === "None" ? "" : row.level4;
        
        const isDuplicate = categories.some(c => 
            c.level1 === level1 &&
            c.level2 === level2 &&
            c.level3 === level3 &&
            c.level4 === level4
        );
        
        if (isDuplicate) {
            duplicates++;
            return;
        }
        
        categories.push({
            id: nextId++,
            level1: level1,
            level2: level2,
            level3: level3,
            level4: level4,
            status: row.status,
            hasFreeFormatL3: false,
            hasFreeFormatL4: false,
            freeTextValue: null
        });
        
        imported++;
    });
    
    localStorage.setItem('chsl_categories', JSON.stringify(categories));
    
    showMessage(`Import complete: ${imported} imported, ${duplicates} duplicates skipped, ${errors} errors`, 
                imported > 0 ? 'success' : 'error');
    
    initCategories();
    renderCategories();
    updateStats();
    updateExportButton();
    cancelUpload();
}

function cancelUpload() {
    uploadedData = [];
    document.getElementById('fileInput').value = '';
    document.getElementById('csvPreview').style.display = 'none';
}

function exportToCSV() {
    if (categories.length === 0) {
        showMessage('No data to export', 'error');
        return;
    }
    
    const headers = ['Major Expense Head', 'Minor Expense Head', 'Why Spent', 'Spent For', 'Status'];
    const rows = categories.map(cat => [
        cat.level1,
        cat.level2 || "None",
        cat.level3 || "None",
        cat.level4 || "None",
        cat.status
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `expense_categories_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showMessage(`Exported ${categories.length} expense types`, 'success');
}