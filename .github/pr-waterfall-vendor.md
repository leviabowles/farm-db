## Summary

This PR updates the YTD Cash Flow Waterfall chart to show expenses broken down by vendor (with account name for better categorization).

## Changes

**File:** `react-frontend/src/components/ExpenditureWaterfall.js`

### 1. Added vendor fetching
The component now fetches the vendor list on mount to map vendor IDs to names:

```javascript
const [vendors, setVendors] = useState({});

useEffect(() => {
  const fetchVendors = async () => {
    try {
      const response = await api.get('/api/vendors/');
      const vendorList = Array.isArray(response.data) ? response.data : (response.data.results || []);
      const vendorMap = {};
      vendorList.forEach(v => {
        vendorMap[v.id] = v.vendor_name || `Vendor ${v.id}`;
      });
      setVendors(vendorMap);
    } catch (err) {
      console.error('Error fetching vendors:', err);
    }
  };
  fetchVendors();
}, []);
```

### 2. Updated category breakdown
Expenses are now categorized by vendor with the account name in parentheses:

```javascript
// OLD:
const categoryTotals = {};
categoryTotals[category] = (categoryTotals[category] || 0) + paid;

// NEW:
const expenseByVendor = {};
const vendorName = tx.vendor && vendors[tx.vendor] ? vendors[tx.vendor] : 'No Vendor';
const accountName = tx.account_name || 'Unknown Account';
const category = `${vendorName} (${accountName})`;
expenseByVendor[category] = (expenseByVendor[category] || 0) + amount;
```

## Expected Output

The waterfall chart will now show categories like:
- `TOTAL RECEIVED`: $275.50 (income)
- `TestVendor (Sales Income)`: $1,800.00
- `TestVendor (Expense Account)`: $351.00
- `No Vendor (Test Account)`: $1,550.00
- `No Vendor (Unknown Account)`: $100.00
- `NET BALANCE`: -$3,525.50 (negative = net loss)

## Testing

1. Navigate to the dashboard homepage at http://localhost:3000
2. Scroll to the "YTD CASH FLOW WATERFALL" section
3. Verify expenses are grouped by vendor with account names
