// CHSL Expense Categories Management System - USER-FRIENDLY VERSION 1.02
// FORGIVING CSV IMPORT WITH AUTO-CORRECTION

// ===== EMBEDDED DEFAULT DATA =====
const embeddedCSVData = [
    // ... (same as before, unchanged)
];

// ===== GLOBAL VARIABLES =====
let categories = JSON.parse(localStorage.getItem('chsl_categories')) || [];
let nextId = categories.length > 0 ? Math.max(...categories.map(c => c.id)) + 1 : 1;
let uploadedData = [];
let importWarnings = []; // Track warnings without blocking

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('CHSL Expense Categories System v1.02 - User Friendly Mode');
    initCategories();
    renderCategories();
    updateStats();
    updateExportButton();
    
    // Setup free text character counter
    const freeTextInput = document.getElementById('freeText');
    if (freeTextInput) {
        freeTextInput.addEventListener('input', function() {
            document.getElementById('charCount').textContent = `${this.value.length}/25 characters`;
        });
    }
    
    // Add CSV template download button
    addCSVTemplateButton();
    
    showMessage('Expense Categories Management System ready. Click "Load Default Categories" to start.', 'info');
});

// ===== FORGIVING CSV IMPORT SYSTEM =====

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Reset warnings
    importWarnings = [];
    
    if (!file.name.toLowerCase().endsWith('.csv')) {
        showMessage('Please upload a CSV file (.csv)', 'error');
        return;
    }
    
    if (file.size > 1024 * 1024) { // 1MB limit
        showMessage('File size exceeds 1MB limit', 'error');
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
    
    // Normalize and auto-correct headers
    const rawHeaders = lines[0].split(',').map(h => h.trim());
    const correctedHeaders = autoCorrectHeaders(rawHeaders);
    
    // Show header corrections if any
    if (correctedHeaders.corrections.length > 0) {
        importWarnings.push({
            type: 'header_correction',
            message: 'Column headers were auto-corrected:',
            details: correctedHeaders.corrections
        });
    }
    
    // Process data rows with auto-correction
    uploadedData = [];
    let rowWarnings = [];
    let totalRows = 0;
    
    for (let i = 1; i < lines.length; i++) {
        totalRows++;
        const rawValues = lines[i].split(',').map(v => v.trim());
        
        // Auto-correct and validate row
        const result = processCSVRow(rawValues, correctedHeaders.headers, i + 1);
        
        if (result.row) {
            uploadedData.push(result.row);
        }
        
        if (result.warnings.length > 0) {
            rowWarnings.push(...result.warnings);
        }
    }
    
    // Add row warnings to import warnings
    if (rowWarnings.length > 0) {
        importWarnings.push({
            type: 'row_warnings',
            message: `Found issues in ${rowWarnings.length} row(s)`,
            details: rowWarnings.slice(0, 10) // Show first 10 warnings
        });
    }
    
    showPreview(uploadedData, importWarnings, totalRows);
}

function autoCorrectHeaders(rawHeaders) {
    const expectedHeaders = [
        'Major Expense Head',
        'Minor Expense Head', 
        'Why Spent',
        'Spent For',
        'Status'
    ];
    
    const corrections = [];
    const correctedHeaders = [];
    
    // Common variations and their corrections
    const commonVariations = {
        'major expense': 'Major Expense Head',
        'minor expense': 'Minor Expense Head',
        'why spent': 'Why Spent',
        'spent for': 'Spent For',
        'status': 'Status',
        'expense head': 'Major Expense Head',
        'expense': 'Major Expense Head',
        'head': 'Major Expense Head',
        'major': 'Major Expense Head',
        'minor': 'Minor Expense Head',
        'why': 'Why Spent',
        'for': 'Spent For'
    };
    
    rawHeaders.forEach((header, index) => {
        const lowerHeader = header.toLowerCase().replace(/\s+/g, ' ');
        let corrected = header;
        
        // Try to match with expected headers
        const exactMatch = expectedHeaders.find(h => 
            h.toLowerCase().replace(/\s+/g, ' ') === lowerHeader
        );
        
        if (exactMatch) {
            corrected = exactMatch;
        } else {
            // Try partial matches
            for (const [variation, correction] of Object.entries(commonVariations)) {
                if (lowerHeader.includes(variation) || variation.includes(lowerHeader)) {
                    if (header !== correction) {
                        corrections.push(`"${header}" → "${correction}"`);
                    }
                    corrected = correction;
                    break;
                }
            }
        }
        
        // If still not corrected and we have empty slots, try to assign by position
        if (!expectedHeaders.includes(corrected) && index < expectedHeaders.length) {
            corrected = expectedHeaders[index];
            if (header && header !== corrected) {
                corrections.push(`"${header}" → "${corrected}" (assigned by position)`);
            }
        }
        
        correctedHeaders.push(corrected);
    });
    
    // Ensure we have all required headers (add missing ones)
    expectedHeaders.forEach(expected => {
        if (!correctedHeaders.includes(expected)) {
            correctedHeaders.push(expected);
            corrections.push(`Added missing column: "${expected}"`);
        }
    });
    
    return {
        headers: correctedHeaders,
        corrections: corrections
    };
}

function processCSVRow(rawValues, headers, rowNumber) {
    const warnings = [];
    const row = {
        rowNumber: rowNumber,
        level1: '',
        level2: '',
        level3: '',
        level4: '',
        status: 'Active' // Default value
    };
    
    // Map values to headers with auto-correction
    headers.forEach((header, index) => {
        const value = rawValues[index] || '';
        
        switch(header) {
            case 'Major Expense Head':
                row.level1 = autoCorrectValue(value, 'level1', warnings, rowNumber);
                break;
            case 'Minor Expense Head':
                row.level2 = autoCorrectValue(value, 'level2', warnings, rowNumber);
                break;
            case 'Why Spent':
                row.level3 = autoCorrectValue(value, 'level3', warnings, rowNumber);
                break;
            case 'Spent For':
                row.level4 = autoCorrectValue(value, 'level4', warnings, rowNumber);
                break;
            case 'Status':
                row.status = autoCorrectStatus(value, warnings, rowNumber);
                break;
        }
    });
    
    // Auto-fix common issues
    row.level1 = autoFixCommonIssues(row.level1, 'Major Expense Head', warnings, rowNumber);
    row.level2 = autoFixCommonIssues(row.level2, 'Minor Expense Head', warnings, rowNumber);
    row.level3 = autoFixCommonIssues(row.level3, 'Why Spent', warnings, rowNumber);
    row.level4 = autoFixCommonIssues(row.level4, 'Spent For', warnings, rowNumber);
    
    // Validate required fields
    if (!row.level1) {
        warnings.push(`Row ${rowNumber}: Major Expense Head is empty`);
    }
    
    if (!row.level2 && row.level2 !== "") {
        warnings.push(`Row ${rowNumber}: Minor Expense Head is empty (using "None")`);
        row.level2 = "";
    }
    
    if (!row.level3 && row.level3 !== "") {
        warnings.push(`Row ${rowNumber}: Why Spent is empty (using "None")`);
        row.level3 = "";
    }
    
    return {
        row: row.level1 ? row : null, // Only return if we have at least Level 1
        warnings: warnings
    };
}

function autoCorrectValue(value, fieldType, warnings, rowNumber) {
    if (!value) return "";
    
    let corrected = value.trim();
    
    // Common abbreviations and their expansions
    const abbreviations = {
        'amt': 'Amount',
        'maint': 'Maintenance',
        'elec': 'Electrical',
        'acct': 'Accounting',
        'admin': 'Administration',
        'mgr': 'Manager',
        'dept': 'Department',
        'eqpt': 'Equipment',
        'misc': 'Miscellaneous',
        'temp': 'Temporary',
        'perm': 'Permanent',
        'cont': 'Contract',
        'est': 'Estimate'
    };
    
    // Check for and expand abbreviations
    Object.entries(abbreviations).forEach(([abbr, full]) => {
        const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
        if (regex.test(corrected)) {
            corrected = corrected.replace(regex, full);
            warnings.push(`Row ${rowNumber}: Expanded abbreviation "${abbr}" → "${full}"`);
        }
    });
    
    // Fix common typos in expense categories
    const commonTypos = {
        'electicity': 'Electricity',
        'electrical': 'Electrical',
        'maintainance': 'Maintenance',
        'account': 'Accounting',
        'insurence': 'Insurance',
        'securty': 'Security',
        'propery': 'Property',
        'gardning': 'Gardening',
        'pestcontrol': 'Pest Control',
        'housekeepng': 'Housekeeping'
    };
    
    Object.entries(commonTypos).forEach(([typo, correct]) => {
        if (corrected.toLowerCase().includes(typo.toLowerCase())) {
            corrected = corrected.replace(new RegExp(typo, 'gi'), correct);
            warnings.push(`Row ${rowNumber}: Corrected typo "${typo}" → "${correct}"`);
        }
    });
    
    // Remove extra spaces and normalize
    corrected = corrected.replace(/\s+/g, ' ').trim();
    
    // Truncate if too long (with warning)
    if (corrected.length > 25) {
        const original = corrected;
        corrected = corrected.substring(0, 25);
        warnings.push(`Row ${rowNumber}: "${fieldType}" truncated from ${original.length} to 25 characters`);
    }
    
    return corrected;
}

function autoCorrectStatus(value, warnings, rowNumber) {
    if (!value) return 'Active'; // Default to Active
    
    const normalized = value.trim().toLowerCase();
    
    const statusMap = {
        'active': 'Active',
        'act': 'Active',
        'a': 'Active',
        'yes': 'Active',
        'y': 'Active',
        '1': 'Active',
        'inactive': 'Inactive',
        'inact': 'Inactive',
        'i': 'Inactive',
        'no': 'Inactive',
        'n': 'Inactive',
        '0': 'Inactive',
        'pending': 'Active', // Treat pending as active
        'draft': 'Active', // Treat draft as active
        'archived': 'Inactive'
    };
    
    if (statusMap[normalized]) {
        if (normalized !== 'active' && normalized !== 'inactive') {
            warnings.push(`Row ${rowNumber}: Status "${value}" → "${statusMap[normalized]}"`);
        }
        return statusMap[normalized];
    }
    
    // Default to Active with warning
    warnings.push(`Row ${rowNumber}: Unknown status "${value}", using "Active"`);
    return 'Active';
}

function autoFixCommonIssues(value, fieldName, warnings, rowNumber) {
    if (!value) return "";
    
    let fixed = value;
    
    // Handle "None" variations
    if (value.toLowerCase() === 'none' || value.toLowerCase() === 'n/a' || value.toLowerCase() === 'na') {
        fixed = "";
        if (value.toLowerCase() !== 'none') {
            warnings.push(`Row ${rowNumber}: ${fieldName} "${value}" → empty (treated as "None")`);
        }
    }
    
    // Handle "Free Format" variations
    if (value.toLowerCase().includes('free') || value.toLowerCase().includes('custom') || 
        value.toLowerCase().includes('user') || value.toLowerCase().includes('other')) {
        if (value.toLowerCase() !== 'free format') {
            fixed = "Free Format";
            warnings.push(`Row ${rowNumber}: ${fieldName} "${value}" → "Free Format"`);
        }
    }
    
    // Fix capitalization (Title Case for expense categories)
    if (fixed && fixed !== "Free Format" && fixed !== "") {
        const words = fixed.split(' ');
        const titleCased = words.map(word => {
            if (word.length <= 2) return word.toUpperCase(); // AMC, DG, etc.
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
        }).join(' ');
        
        if (titleCased !== fixed) {
            warnings.push(`Row ${rowNumber}: ${fieldName} capitalization fixed`);
            fixed = titleCased;
        }
    }
    
    return fixed;
}

function showPreview(data, warnings, totalRows) {
    const previewDiv = document.getElementById('csvPreview');
    const tableBody = document.querySelector('#previewTable tbody');
    const statsDiv = document.getElementById('uploadStats');
    
    if (!previewDiv || !tableBody || !statsDiv) {
        console.error('Required elements not found');
        return;
    }
    
    if (data.length === 0) {
        showMessage('No valid data found in file', 'error');
        return;
    }
    
    // Show comprehensive statistics
    let statsHTML = `<strong>Upload Analysis:</strong><br>`;
    statsHTML += `• Total rows processed: ${totalRows}<br>`;
    statsHTML += `• Valid rows ready: ${data.length}<br>`;
    
    if (warnings.length > 0) {
        const warningCount = warnings.reduce((count, w) => count + (w.details ? w.details.length : 1), 0);
        statsHTML += `• Auto-fixes applied: ${warningCount}<br>`;
        statsHTML += `⚠️ <em>Review warnings below before importing</em>`;
    } else {
        statsHTML += `✓ All rows are valid and ready`;
    }
    
    statsDiv.innerHTML = statsHTML;
    
    // Show warnings in a separate section
    if (warnings.length > 0) {
        let warningsHTML = `<div class="warnings-section" style="background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 15px 0; border-radius: 4px;">`;
        warningsHTML += `<h4 style="margin-top: 0; color: #856404;"><i class="fas fa-exclamation-triangle"></i> Auto-Corrections Applied:</h4>`;
        warningsHTML += `<ul style="margin-bottom: 0;">`;
        
        warnings.forEach(warning => {
            if (warning.type === 'header_correction') {
                warningsHTML += `<li><strong>Column Headers:</strong> ${warning.message}</li>`;
                warning.details.forEach(detail => {
                    warningsHTML += `<li style="margin-left: 20px;">${detail}</li>`;
                });
            } else if (warning.type === 'row_warnings') {
                warningsHTML += `<li><strong>Data Corrections:</strong> ${warning.message}</li>`;
                warning.details.slice(0, 5).forEach(detail => {
                    warningsHTML += `<li style="margin-left: 20px;">${detail}</li>`;
                });
                if (warning.details.length > 5) {
                    warningsHTML += `<li style="margin-left: 20px; font-style: italic;">... and ${warning.details.length - 5} more corrections</li>`;
                }
            }
        });
        
        warningsHTML += `</ul></div>`;
        statsDiv.insertAdjacentHTML('afterend', warningsHTML);
    }
    
    // Show preview data
    tableBody.innerHTML = '';
    const previewRows = data.slice(0, 10); // Show first 10 rows
    
    previewRows.forEach(row => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${row.level1 || '<span class="none-value">(None)</span>'}</td>
            <td>${row.level2 || '<span class="none-value">None</span>'}</td>
            <td>${row.level3 || '<span class="none-value">None</span>'}</td>
            <td>${row.level4 || '<span class="none-value">None</span>'}</td>
            <td><span class="status-badge ${row.status.toLowerCase()}">${row.status}</span></td>
        `;
        tableBody.appendChild(tr);
    });
    
    if (data.length > 10) {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td colspan="5" style="text-align: center; font-style: italic; background: #f8f9fa;">... and ${data.length - 10} more rows</td>`;
        tableBody.appendChild(tr);
    }
    
    previewDiv.style.display = 'block';
    
    if (warnings.length > 0) {
        showMessage(`Processed ${data.length} rows with ${warnings.length} auto-corrections applied. Review before importing.`, 'warning');
    } else {
        showMessage(`${data.length} rows ready for import`, 'success');
    }
}

function processUpload() {
    if (uploadedData.length === 0) {
        showMessage('No data to import', 'error');
        return;
    }
    
    let imported = 0, duplicates = 0, skipped = 0;
    const importResults = [];
    
    uploadedData.forEach(row => {
        // Final validation
        if (!row.level1) {
            skipped++;
            return;
        }
        
        // Check for duplicates
        const isDuplicate = categories.some(c => 
            c.level1 === row.level1 &&
            c.level2 === row.level2 &&
            c.level3 === row.level3 &&
            c.level4 === row.level4
        );
        
        if (isDuplicate) {
            duplicates++;
            importResults.push({
                row: row.rowNumber,
                action: 'skipped',
                reason: 'Duplicate'
            });
            return;
        }
        
        // Handle Free Format conversion
        const finalLevel3 = row.level3 === "Free Format" ? "_freeformat" : row.level3;
        const finalLevel4 = row.level4 === "Free Format" ? "_freeformat" : row.level4;
        
        categories.push({
            id: nextId++,
            level1: row.level1,
            level2: row.level2,
            level3: finalLevel3,
            level4: finalLevel4,
            status: row.status,
            hasFreeFormatL3: row.level3 === "Free Format",
            hasFreeFormatL4: row.level4 === "Free Format",
            freeTextValue: null,
            userAdded: true
        });
        
        imported++;
        importResults.push({
            row: row.rowNumber,
            action: 'imported',
            data: `${row.level1} → ${row.level2 || 'None'}`
        });
    });
    
    // Save to localStorage
    localStorage.setItem('chsl_categories', JSON.stringify(categories));
    
    // Show comprehensive results
    let resultMessage = `<strong>Import Complete:</strong><br>`;
    resultMessage += `✓ Imported: ${imported} rows<br>`;
    resultMessage += `⏭️ Skipped (duplicates): ${duplicates} rows<br>`;
    resultMessage += `⏭️ Skipped (invalid): ${skipped} rows<br>`;
    
    if (importWarnings.length > 0) {
        resultMessage += `<br><em>${importWarnings.length} auto-corrections were applied during import</em>`;
    }
    
    // Show results in a nice alert
    const alertDiv = document.getElementById('messageAlert');
    if (alertDiv) {
        alertDiv.innerHTML = resultMessage;
        alertDiv.className = imported > 0 ? 'alert alert-success' : 'alert alert-error';
        alertDiv.style.display = 'block';
        
        setTimeout(() => {
            alertDiv.style.display = 'none';
        }, 8000);
    }
    
    // Update UI
    initCategories();
    renderCategories();
    updateStats();
    updateExportButton();
    cancelUpload();
}

// ===== REST OF FUNCTIONS REMAIN THE SAME =====
// (Keep all other functions from previous version unchanged)
// Only replace the CSV import/export section with the above code