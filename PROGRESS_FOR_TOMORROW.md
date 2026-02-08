## TESTING FEEDBACK - ISSUES TO FIX TOMORROW

### Issues Found (Feb 8 Testing):
1. LABEL CORRECTIONS:
   - "Repairs" → "Repairs & Maintenance"
   - "Accounting" → "Accounting & Managerial"

2. "NONE" LOGIC FAILING:
   - BMC Water Charges (level2="None") still shows sub-levels
   - Check line 630 fix: if (!level2 || level2 === "None") return;

3. INDENTATION ISSUE:
   - Why Spent right-indents when selecting Accounting → Monthly Fees
   - CSS min-width: 180px may need adjustment

4. FREE FORMAT DISPLAY:
   - Free Format entries should not appear in main table

5. CSV ERROR DISPLAY:
   - Error rows not shown (10 rows had errors)

### Files to Examine Tomorrow:
1. js/categories.js - "None" logic and data structure
2. css/categories.css - Label alignment (current: min-width: 180px)
3. Check CSV upload error handling functions

### Time: $(date)
